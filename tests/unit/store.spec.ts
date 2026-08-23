import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import type { NewsApiResponse } from '~~/shared/types/news'
import { useNewsStore } from '~/stores/news'

const response: NewsApiResponse = {
  items: [],
  sources: [],
  warnings: [],
  fetchedAt: '2026-08-23T10:00:00.000Z',
  isStale: false,
}

describe('useNewsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('uses a deterministic SSR-safe view default', () => {
    expect(useNewsStore().viewMode).toBe('grid')
  })

  it('hydrates normalized feed data', () => {
    const store = useNewsStore()
    store.setFeed(response)

    expect(store.fetchedAt).toBe(response.fetchedAt)
    expect(store.isStale).toBe(false)
  })

  it('switches between supported presentation modes', () => {
    const store = useNewsStore()
    store.setViewMode('list')
    expect(store.viewMode).toBe('list')
  })
})
