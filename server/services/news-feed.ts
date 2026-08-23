import type {
  NewsApiResponse,
  NewsFeedWarning,
  NewsItem,
  NewsSource,
  NewsSourceId,
} from '~~/shared/types/news'
import { NEWS_SOURCES } from '~~/shared/constants/news'
import { parseRssFeed } from '~~/server/utils/rss'

interface NewsRuntimeOptions {
  cacheTtlMs: number
  requestTimeoutMs: number
  maxItemsPerSource: number
  mosRssUrl: string
  lentaRssUrl: string
}

interface SourceCacheEntry {
  items: NewsItem[]
  fetchedAt: number
}

interface SourceResult {
  items: NewsItem[]
  stale: boolean
  warning?: NewsFeedWarning
}

const sourceCache = new Map<NewsSourceId, SourceCacheEntry>()
const MAX_FEED_SIZE = 5 * 1024 * 1024
const FORCE_REFRESH_COOLDOWN_MS = 15_000
let lastForcedRefreshAt = 0

class FeedFetchError extends Error {
  constructor(message: string, readonly retryable: boolean) {
    super(message)
    this.name = 'FeedFetchError'
  }
}

function waitBeforeRetry(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 250))
}

async function readLimitedBody(
  response: Response,
  maximumBytes: number,
): Promise<string> {
  if (!response.body) {
    throw new FeedFetchError('RSS-источник вернул пустой ответ', false)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let totalBytes = 0
  let body = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      totalBytes += value.byteLength
      if (totalBytes > maximumBytes) {
        await reader.cancel()
        throw new FeedFetchError('RSS-ответ превышает допустимый размер', false)
      }

      body += decoder.decode(value, { stream: true })
    }

    body += decoder.decode()
    return body
  }
  finally {
    reader.releaseLock()
  }
}

export async function fetchFeedXml(
  feedUrl: string,
  timeoutMs: number,
  maximumBytes = MAX_FEED_SIZE,
): Promise<string> {
  const url = new URL(feedUrl)
  if (url.protocol !== 'https:') {
    throw new FeedFetchError('RSS URL должен использовать HTTPS', false)
  }

  let lastError: unknown

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        headers: {
          'accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
          'user-agent': 'NewsListSSR/1.0 (+https://github.com/)',
        },
        redirect: 'follow',
        signal: controller.signal,
      })

      if (!response.ok) {
        const retryable = response.status === 408
          || response.status === 429
          || response.status >= 500
        throw new FeedFetchError(`RSS-источник ответил HTTP ${response.status}`, retryable)
      }

      const responseUrl = new URL(response.url || url)
      if (responseUrl.protocol !== 'https:') {
        throw new FeedFetchError('RSS-источник перенаправил запрос на небезопасный URL', false)
      }

      const contentLength = Number(response.headers.get('content-length'))
      if (Number.isFinite(contentLength) && contentLength > maximumBytes) {
        throw new FeedFetchError('RSS-ответ превышает допустимый размер', false)
      }

      const contentType = response.headers.get('content-type')?.toLowerCase()
      if (contentType && !/(?:rss|xml|text\/plain)/.test(contentType)) {
        throw new FeedFetchError('RSS-источник вернул неподдерживаемый тип данных', false)
      }

      const xml = await readLimitedBody(response, maximumBytes)
      if (!xml.trim()) {
        throw new FeedFetchError('RSS-источник вернул пустой ответ', false)
      }

      return xml
    }
    catch (error) {
      lastError = error
      const retryable = !(error instanceof FeedFetchError) || error.retryable
      if (!retryable || attempt === 1) {
        throw error
      }

      await waitBeforeRetry()
    }
    finally {
      clearTimeout(timeout)
    }
  }

  throw lastError
}

function sourceUrl(sourceId: NewsSourceId, options: NewsRuntimeOptions): string {
  return sourceId === 'mos' ? options.mosRssUrl : options.lentaRssUrl
}

function publicErrorMessage(source: NewsSource): string {
  return `Не удалось обновить новости ${source.name}`
}

async function fetchSource(
  source: NewsSource,
  options: NewsRuntimeOptions,
  forceRefresh: boolean,
): Promise<SourceResult> {
  const now = Date.now()
  const cached = sourceCache.get(source.id)

  if (
    !forceRefresh
    && cached
    && now - cached.fetchedAt < options.cacheTtlMs
  ) {
    return {
      items: cached.items,
      stale: false,
    }
  }

  try {
    const xml = await fetchFeedXml(
      sourceUrl(source.id, options),
      options.requestTimeoutMs,
    )

    const items = parseRssFeed(xml, source, options.maxItemsPerSource)
    sourceCache.set(source.id, {
      items,
      fetchedAt: Date.now(),
    })

    return {
      items,
      stale: false,
    }
  }
  catch (error) {
    console.error(`[news-feed] ${publicErrorMessage(source)}`, error)

    if (cached) {
      return {
        items: cached.items,
        stale: true,
        warning: {
          sourceId: source.id,
          message: `${publicErrorMessage(source)}. Показана сохранённая версия.`,
        },
      }
    }

    throw new Error(publicErrorMessage(source), { cause: error })
  }
}

function sortByDateDescending(items: NewsItem[]): NewsItem[] {
  return [...items].sort((left, right) => {
    const leftTime = left.publishedAt ? Date.parse(left.publishedAt) : 0
    const rightTime = right.publishedAt ? Date.parse(right.publishedAt) : 0
    return rightTime - leftTime || left.id.localeCompare(right.id)
  })
}

function deduplicate(items: NewsItem[]): NewsItem[] {
  return [...new Map(items.map(item => [item.url, item])).values()]
}

export async function getNewsFeed(
  options: NewsRuntimeOptions,
  forceRefresh = false,
): Promise<NewsApiResponse> {
  const now = Date.now()
  const canForceRefresh = forceRefresh
    && now - lastForcedRefreshAt >= FORCE_REFRESH_COOLDOWN_MS

  if (canForceRefresh) {
    lastForcedRefreshAt = now
  }

  const results = await Promise.allSettled(
    NEWS_SOURCES.map(source => fetchSource(source, options, canForceRefresh)),
  )

  const successful = results.flatMap((result): SourceResult[] => (
    result.status === 'fulfilled' ? [result.value] : []
  ))

  if (successful.length === 0) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Новостные источники временно недоступны',
    })
  }

  const warnings = successful.flatMap(result => (
    result.warning ? [result.warning] : []
  ))

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      warnings.push({
        sourceId: NEWS_SOURCES[index]!.id,
        message: publicErrorMessage(NEWS_SOURCES[index]!),
      })
    }
  })

  return {
    items: sortByDateDescending(deduplicate(
      successful.flatMap(result => result.items),
    )),
    sources: [...NEWS_SOURCES],
    fetchedAt: new Date().toISOString(),
    isStale: successful.some(result => result.stale),
    warnings,
  }
}
