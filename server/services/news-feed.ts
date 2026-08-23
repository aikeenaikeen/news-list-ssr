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
    const xml = await $fetch<string>(sourceUrl(source.id, options), {
      headers: {
        'accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
        'user-agent': 'NewsListSSR/1.0 (+https://github.com/)',
      },
      responseType: 'text',
      retry: 1,
      retryDelay: 250,
      timeout: options.requestTimeoutMs,
    })

    const items = parseRssFeed(xml, source, options.maxItemsPerSource)
    sourceCache.set(source.id, {
      items,
      fetchedAt: now,
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
    return rightTime - leftTime
  })
}

function deduplicate(items: NewsItem[]): NewsItem[] {
  return [...new Map(items.map(item => [item.url, item])).values()]
}

export async function getNewsFeed(
  options: NewsRuntimeOptions,
  forceRefresh = false,
): Promise<NewsApiResponse> {
  const results = await Promise.allSettled(
    NEWS_SOURCES.map(source => fetchSource(source, options, forceRefresh)),
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
