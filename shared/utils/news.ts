import type { NewsFilters, NewsItem } from '../types/news'

export function normalizeSearchQuery(value: string): string {
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim().slice(0, 200)
}

function searchableText(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('ru-RU')
    .replaceAll('ё', 'е')
}

export function filterNews(items: NewsItem[], filters: NewsFilters): NewsItem[] {
  const normalizedQuery = searchableText(normalizeSearchQuery(filters.query))
  const searchTerms = normalizedQuery.split(' ').filter(Boolean)

  return items.filter((item) => {
    if (filters.source && item.source.id !== filters.source) {
      return false
    }

    if (searchTerms.length === 0) {
      return true
    }

    const haystack = searchableText(`${item.title} ${item.description}`)
    return searchTerms.every(term => haystack.includes(term))
  })
}

export function formatNewsDate(value: string | null): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Moscow',
  }).format(date)
}

export function sourceHost(homepage: string): string {
  try {
    return new URL(homepage).hostname.replace(/^www\./, '')
  }
  catch {
    return homepage
  }
}
