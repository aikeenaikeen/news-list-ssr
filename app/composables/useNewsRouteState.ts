import type { LocationQueryRaw, RouteLocationRaw } from 'vue-router'
import type { NewsSourceId } from '~~/shared/types/news'
import { NEWS_SOURCE_IDS } from '~~/shared/types/news'
import { normalizeSearchQuery } from '~~/shared/utils/news'

function firstQueryValue(value: unknown): string {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

function isSourceId(value: string): value is NewsSourceId {
  return (NEWS_SOURCE_IDS as readonly string[]).includes(value)
}

function normalizedPage(value: unknown): number {
  const rawValue = Array.isArray(value) ? value[0] : value
  const page = Number(rawValue)
  return Number.isSafeInteger(page) && page > 0 ? page : 1
}

export function useNewsRouteState() {
  const route = useRoute()
  const router = useRouter()

  const page = computed(() => normalizedPage(route.params.page))
  const source = computed<NewsSourceId | null>(() => {
    const value = firstQueryValue(route.query.source)
    return isSourceId(value) ? value : null
  })
  const query = computed(() => normalizeSearchQuery(
    firstQueryValue(route.query.q),
  ))
  const hasFilters = computed(() => Boolean(source.value || query.value))

  function buildQuery(
    sourceId: NewsSourceId | null,
    searchQuery: string,
  ): LocationQueryRaw {
    const nextQuery: LocationQueryRaw = {}
    const normalizedQuery = normalizeSearchQuery(searchQuery)

    if (sourceId) {
      nextQuery.source = sourceId
    }

    if (normalizedQuery) {
      nextQuery.q = normalizedQuery
    }

    return nextQuery
  }

  function pageLocation(targetPage: number): RouteLocationRaw {
    return {
      path: `/news/${Math.max(1, targetPage)}`,
      query: buildQuery(source.value, query.value),
    }
  }

  function setSource(sourceId: NewsSourceId | null) {
    return router.push({
      path: '/news/1',
      query: buildQuery(sourceId, query.value),
    })
  }

  function setQuery(searchQuery: string, replace = true) {
    const location: RouteLocationRaw = {
      path: '/news/1',
      query: buildQuery(source.value, searchQuery),
    }

    return replace ? router.replace(location) : router.push(location)
  }

  function resetFilters() {
    return router.push('/news/1')
  }

  return {
    page,
    source,
    query,
    hasFilters,
    pageLocation,
    resetFilters,
    setQuery,
    setSource,
  }
}
