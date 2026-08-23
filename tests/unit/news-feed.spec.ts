import { afterEach, describe, expect, it, vi } from 'vitest'

const options = {
  cacheTtlMs: 300_000,
  requestTimeoutMs: 1_000,
  maxItemsPerSource: 10,
  mosRssUrl: 'https://feeds.test/mos.xml',
  lentaRssUrl: 'https://feeds.test/lenta.xml',
}

function rss(title: string, link: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <item>
          <title>${title}</title>
          <link>${link}</link>
          <pubDate>Sun, 23 Aug 2026 10:00:00 GMT</pubDate>
        </item>
      </channel>
    </rss>`
}

function xmlResponse(body: string): Response {
  return new Response(body, {
    status: 200,
    headers: { 'content-type': 'application/rss+xml; charset=UTF-8' },
  })
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('fetchFeedXml', () => {
  it('stops reading as soon as the decompressed byte limit is exceeded', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('123456'))
        controller.close()
      },
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(stream, {
      headers: { 'content-type': 'application/xml' },
    })))

    const { fetchFeedXml } = await import('~~/server/services/news-feed')

    await expect(fetchFeedXml('https://feeds.test/news.xml', 1_000, 5))
      .rejects.toThrow('превышает допустимый размер')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('rejects non-XML upstream responses without retrying', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html />', {
      headers: { 'content-type': 'text/html' },
    })))

    const { fetchFeedXml } = await import('~~/server/services/news-feed')

    await expect(fetchFeedXml('https://feeds.test/news.xml', 1_000))
      .rejects.toThrow('неподдерживаемый тип данных')
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})

describe('getNewsFeed', () => {
  it('returns available news and a warning when one source fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn((input: URL | RequestInfo) => {
      const url = String(input)
      if (url.includes('mos.xml')) {
        return Promise.resolve(xmlResponse(rss(
          'Новости Москвы',
          'https://www.mos.ru/news/item/1/',
        )))
      }

      return Promise.reject(new TypeError('upstream unavailable'))
    }))

    const { getNewsFeed } = await import('~~/server/services/news-feed')
    const result = await getNewsFeed(options)

    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.source.id).toBe('mos')
    expect(result.warnings).toEqual([{
      sourceId: 'lenta',
      message: 'Не удалось обновить новости Lenta.ru',
    }])
  })

  it('returns a controlled 502 when every source fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    vi.stubGlobal('createError', (input: { statusCode: number, statusMessage: string }) => (
      Object.assign(new Error(input.statusMessage), input)
    ))

    const { getNewsFeed } = await import('~~/server/services/news-feed')

    await expect(getNewsFeed(options)).rejects.toMatchObject({
      statusCode: 502,
      message: 'Новостные источники временно недоступны',
    })
  })
})
