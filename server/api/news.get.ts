import { getNewsFeed } from '~~/server/services/news-feed'

function positiveNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
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
      cacheTtlMs: positiveNumber(newsConfig.cacheTtlMs, 300_000),
      requestTimeoutMs: positiveNumber(newsConfig.requestTimeoutMs, 10_000),
      maxItemsPerSource: positiveNumber(newsConfig.maxItemsPerSource, 50),
      mosRssUrl: String(newsConfig.mosRssUrl),
      lentaRssUrl: String(newsConfig.lentaRssUrl),
    },
    query.refresh === '1',
  )
})
