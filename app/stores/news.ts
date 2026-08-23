import { defineStore } from 'pinia'
import type {
  NewsApiResponse,
  NewsFeedWarning,
  NewsItem,
  NewsSource,
  NewsViewMode,
} from '~~/shared/types/news'

interface NewsState {
  items: NewsItem[]
  sources: NewsSource[]
  warnings: NewsFeedWarning[]
  fetchedAt: string | null
  isStale: boolean
  viewMode: NewsViewMode
}

export const useNewsStore = defineStore('news', {
  state: (): NewsState => ({
    items: [],
    sources: [],
    warnings: [],
    fetchedAt: null,
    isStale: false,
    viewMode: 'grid',
  }),

  actions: {
    setFeed(feed: NewsApiResponse) {
      this.items = feed.items
      this.sources = feed.sources
      this.warnings = feed.warnings
      this.fetchedAt = feed.fetchedAt
      this.isStale = feed.isStale
    },

    setViewMode(mode: NewsViewMode) {
      if (mode === 'grid' || mode === 'list') {
        this.viewMode = mode
      }
    },
  },
})
