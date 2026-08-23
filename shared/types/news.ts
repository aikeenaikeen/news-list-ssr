export const NEWS_SOURCE_IDS = ['lenta', 'mos'] as const

export type NewsSourceId = (typeof NEWS_SOURCE_IDS)[number]
export type NewsViewMode = 'grid' | 'list'

export interface NewsSource {
  id: NewsSourceId
  name: string
  homepage: string
}

export interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  imageUrl: string | null
  publishedAt: string | null
  source: NewsSource
}

export interface NewsFeedWarning {
  sourceId: NewsSourceId
  message: string
}

export interface NewsApiResponse {
  items: NewsItem[]
  sources: NewsSource[]
  fetchedAt: string
  isStale: boolean
  warnings: NewsFeedWarning[]
}

export interface NewsFilters {
  source: NewsSourceId | null
  query: string
}
