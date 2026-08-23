import { createHash } from 'node:crypto'
import { XMLParser } from 'fast-xml-parser'
import { decode } from 'html-entities'
import type { NewsItem, NewsSource } from '~~/shared/types/news'

type XmlRecord = Record<string, unknown>

const parser = new XMLParser({
  allowBooleanAttributes: false,
  attributeNamePrefix: '@_',
  cdataPropName: '#cdata',
  ignoreAttributes: false,
  parseAttributeValue: false,
  parseTagValue: false,
  processEntities: false,
  removeNSPrefix: true,
  trimValues: true,
})

function isRecord(value: unknown): value is XmlRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asArray(value: unknown): unknown[] {
  if (value === undefined || value === null) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

function readText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.map(readText).find(Boolean) ?? ''
  }

  if (!isRecord(value)) {
    return ''
  }

  return readText(value['#text'])
    || readText(value['#cdata'])
    || readText(value['@_href'])
    || readText(value['@_url'])
}

export function toPlainText(value: unknown): string {
  const rawText = readText(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')

  return decode(rawText)
    .replace(/[\u00a0\s]+/g, ' ')
    .trim()
}

function safeUrl(value: unknown, baseUrl: string): string | null {
  const candidate = readText(value).trim()

  if (!candidate) {
    return null
  }

  try {
    const url = new URL(candidate, baseUrl)
    return url.protocol === 'https:' ? url.toString() : null
  }
  catch {
    return null
  }
}

function readItemLink(item: XmlRecord, baseUrl: string): string | null {
  for (const link of asArray(item.link)) {
    const url = safeUrl(link, baseUrl)
    if (url) {
      return url
    }
  }

  return null
}

function readImageUrl(item: XmlRecord, baseUrl: string): string | null {
  const candidates = [
    ...asArray(item.enclosure),
    ...asArray(item.thumbnail),
    ...asArray(item.content),
  ]

  for (const candidate of candidates) {
    if (isRecord(candidate)) {
      const medium = readText(candidate['@_medium'])
      const type = readText(candidate['@_type'])

      if (medium && medium !== 'image') {
        continue
      }

      if (type && !type.startsWith('image/')) {
        continue
      }
    }

    const url = safeUrl(candidate, baseUrl)
    if (url) {
      return url
    }
  }

  return null
}

function toIsoDate(value: unknown): string | null {
  const candidate = readText(value).trim()

  if (!candidate) {
    return null
  }

  const timestamp = Date.parse(candidate)
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString()
}

function createItemId(source: NewsSource, item: XmlRecord, url: string, title: string): string {
  const guid = readText(item.guid) || readText(item.id)
  return createHash('sha256')
    .update(`${source.id}:${guid || url || title}`)
    .digest('hex')
    .slice(0, 20)
}

function findRawItems(document: XmlRecord): unknown[] {
  const rss = isRecord(document.rss) ? document.rss : document
  const channel = isRecord(rss.channel) ? rss.channel : null

  if (channel) {
    return asArray(channel.item)
  }

  const feed = isRecord(document.feed) ? document.feed : null
  return feed ? asArray(feed.entry) : []
}

export function parseRssFeed(
  xml: string,
  source: NewsSource,
  maxItems: number,
): NewsItem[] {
  if (/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(xml)) {
    throw new Error(`Источник ${source.name} вернул небезопасный XML`)
  }

  const document = parser.parse(xml) as unknown

  if (!isRecord(document)) {
    throw new Error(`Источник ${source.name} вернул некорректный XML`)
  }

  const rawItems = findRawItems(document)
  if (rawItems.length === 0) {
    throw new Error(`Источник ${source.name} не вернул новостей`)
  }

  return rawItems
    .slice(0, maxItems)
    .flatMap((rawItem): NewsItem[] => {
      if (!isRecord(rawItem)) {
        return []
      }

      const title = toPlainText(rawItem.title)
      const url = readItemLink(rawItem, source.homepage)

      if (!title || !url) {
        return []
      }

      return [{
        id: createItemId(source, rawItem, url, title),
        title: title.slice(0, 500),
        description: toPlainText(
          rawItem.description
          ?? rawItem.summary
          ?? rawItem.encoded,
        ).slice(0, 4_000),
        url,
        imageUrl: readImageUrl(rawItem, source.homepage),
        publishedAt: toIsoDate(
          rawItem.pubDate
          ?? rawItem.published
          ?? rawItem.updated,
        ),
        source,
      }]
    })
}
