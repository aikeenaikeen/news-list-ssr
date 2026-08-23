import { getNewsFeed } from '~~/server/services/news-feed'

function positiveNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function boundedNumber(value: unknown, fallback: number, maximum: number): number {
  return Math.min(positiveNumber(value, fallback), maximum)
}

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const query = getQuery(event)
  const newsConfig = runtimeConfig.news

  setResponseHeaders(event, {
    'Cache-Control': 'private, max-age=0, must-revalidate',
    'Content-Type': 'application/json; charset=utf-8',
  })

  return getNewsFeed(
    {
      cacheTtlMs: boundedNumber(newsConfig.cacheTtlMs, 300_000, 60 * 60 * 1000),
      requestTimeoutMs: boundedNumber(newsConfig.requestTimeoutMs, 10_000, 30_000),
      maxItemsPerSource: boundedNumber(newsConfig.maxItemsPerSource, 50, 200),
      mosRssUrl: String(newsConfig.mosRssUrl),
      lentaRssUrl: String(newsConfig.lentaRssUrl),
    },
    query.refresh === '1',
  )
})
