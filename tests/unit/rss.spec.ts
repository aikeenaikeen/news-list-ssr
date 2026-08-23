import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { NewsSource } from '~~/shared/types/news'
import { parseRssFeed, toPlainText } from '~~/server/utils/rss'

const mosSource: NewsSource = {
  id: 'mos',
  name: 'Mos.ru',
  homepage: 'https://www.mos.ru/',
}

const lentaSource: NewsSource = {
  id: 'lenta',
  name: 'Lenta.ru',
  homepage: 'https://lenta.ru/',
}

function fixture(name: string): string {
  return readFileSync(
    fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url)),
    'utf8',
  )
}

describe('parseRssFeed', () => {
  it('normalizes Mos.ru XML and takes the first valid image', () => {
    const items = parseRssFeed(fixture('mos.xml'), mosSource, 10)

    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({
      title: 'Новая станция & городской маршрут',
      description: 'В Москве открылся новый маршрут.',
      url: 'https://www.mos.ru/news/item/1/',
      imageUrl: 'https://www.mos.ru/images/first.jpg',
      publishedAt: '2026-08-23T09:31:01.000Z',
      source: mosSource,
    })
    expect(items[0]!.id).toHaveLength(20)
  })

  it('keeps empty descriptions and rejects insecure media URLs', () => {
    const [item] = parseRssFeed(fixture('lenta.xml'), lentaSource, 10)

    expect(item).toMatchObject({
      title: 'Пример новости Lenta.ru',
      description: '',
      imageUrl: null,
    })
  })

  it('respects the per-source item limit', () => {
    expect(parseRssFeed(fixture('mos.xml'), mosSource, 1)).toHaveLength(1)
  })

  it('fails explicitly when a feed has no items', () => {
    expect(() => parseRssFeed('<rss><channel /></rss>', mosSource, 10))
      .toThrow('не вернул новостей')
  })
})

describe('toPlainText', () => {
  it('removes markup, active content and decodes entities', () => {
    expect(toPlainText('<p>Один&nbsp;<b>два</b></p><style>x{}</style>'))
      .toBe('Один два')
  })
})
