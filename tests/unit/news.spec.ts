import { describe, expect, it } from 'vitest'
import type { NewsItem } from '~~/shared/types/news'
import {
  filterNews,
  formatNewsDate,
  normalizeSearchQuery,
  sourceHost,
} from '~~/shared/utils/news'

const items: NewsItem[] = [
  {
    id: 'mos-1',
    title: 'В Москве открылся новый павильон',
    description: 'Посетителей ждёт выставка о науке.',
    url: 'https://www.mos.ru/1',
    imageUrl: null,
    publishedAt: '2026-08-23T09:00:00.000Z',
    source: {
      id: 'mos',
      name: 'Mos.ru',
      homepage: 'https://www.mos.ru/',
    },
  },
  {
    id: 'lenta-1',
    title: 'Учёные рассказали о космосе',
    description: 'Новые данные опубликованы утром.',
    url: 'https://lenta.ru/1',
    imageUrl: null,
    publishedAt: '2026-08-23T08:00:00.000Z',
    source: {
      id: 'lenta',
      name: 'Lenta.ru',
      homepage: 'https://lenta.ru/',
    },
  },
]

describe('filterNews', () => {
  it('filters by source before pagination', () => {
    expect(filterNews(items, { source: 'mos', query: '' }).map(item => item.id))
      .toEqual(['mos-1'])
  })

  it('searches title and description case-insensitively', () => {
    expect(filterNews(items, { source: null, query: 'НОВЫЕ утром' }).map(item => item.id))
      .toEqual(['lenta-1'])
  })

  it('treats е and ё as equivalent', () => {
    expect(filterNews(items, { source: null, query: 'ученые' }).map(item => item.id))
      .toEqual(['lenta-1'])
  })
})

describe('news value formatting', () => {
  it('normalizes whitespace and limits URL query length', () => {
    expect(normalizeSearchQuery('  новая\n\tстанция  ')).toBe('новая станция')
    expect(normalizeSearchQuery('я'.repeat(250))).toHaveLength(200)
  })

  it('formats dates deterministically in the Moscow time zone', () => {
    expect(formatNewsDate('2026-08-22T21:30:00.000Z')).toBe('23.08.2026')
  })

  it('normalizes source hosts', () => {
    expect(sourceHost('https://www.mos.ru/')).toBe('mos.ru')
  })
})
