<script setup lang="ts">
import type { NewsApiResponse, NewsViewMode } from '~~/shared/types/news'
import { NEWS_PAGE_SIZE } from '~~/shared/constants/news'
import { filterNews } from '~~/shared/utils/news'
import { useNewsStore } from '~/stores/news'

definePageMeta({
  validate: (route) => {
    const value = Array.isArray(route.params.page)
      ? route.params.page[0]
      : route.params.page

    return typeof value === 'string' && /^[1-9]\d*$/.test(value)
  },
})

const route = useRoute()
const router = useRouter()
const newsStore = useNewsStore()
const {
  page,
  source,
  query,
  hasFilters,
  resetFilters,
  setQuery,
  setSource,
} = useNewsRouteState()

const forceRefresh = ref(false)
const searchDraft = ref(query.value)
const requestFetch = useRequestFetch()
let searchTimer: ReturnType<typeof setTimeout> | undefined

const {
  data,
  error,
  status,
  refresh,
} = await useAsyncData<NewsApiResponse>(
  'news-feed',
  (_nuxtApp, { signal }) => requestFetch('/api/news', {
    query: forceRefresh.value ? { refresh: '1' } : undefined,
    signal,
  }),
  {
    deep: false,
    dedupe: 'defer',
  },
)

if (data.value) {
  newsStore.setFeed(data.value)
}

watch(data, (feed) => {
  if (feed) {
    newsStore.setFeed(feed)
  }
})

watch(query, (value) => {
  searchDraft.value = value
})

const filteredItems = computed(() => filterNews(newsStore.items, {
  source: source.value,
  query: query.value,
}))
const totalPages = computed(() => Math.ceil(filteredItems.value.length / NEWS_PAGE_SIZE))
const visibleItems = computed(() => {
  const start = (page.value - 1) * NEWS_PAGE_SIZE
  return filteredItems.value.slice(start, start + NEWS_PAGE_SIZE)
})
const isInitialLoading = computed(() => (
  status.value === 'pending' && newsStore.items.length === 0
))
const isRefreshing = computed(() => (
  status.value === 'pending' && newsStore.items.length > 0
))
const hasFatalError = computed(() => Boolean(error.value && newsStore.items.length === 0))
const hasRefreshError = computed(() => Boolean(error.value && newsStore.items.length > 0))
const statusMessage = computed(() => {
  if (isRefreshing.value) {
    return 'Обновляем список новостей'
  }

  if (hasRefreshError.value) {
    return 'Не удалось обновить новости. Показана ранее загруженная версия.'
  }

  if (newsStore.warnings.length > 0) {
    return newsStore.warnings.map(warning => warning.message).join(' ')
  }

  if (newsStore.fetchedAt) {
    return `Загружено новостей: ${newsStore.items.length}`
  }

  return ''
})

function normalizedLocation(targetPage: number) {
  return {
    path: `/news/${Math.max(1, targetPage)}`,
    query: {
      ...(source.value ? { source: source.value } : {}),
      ...(query.value ? { q: query.value } : {}),
    },
  }
}

const lastExistingPage = Math.max(1, totalPages.value)
if (page.value > lastExistingPage && !hasFatalError.value) {
  await navigateTo(normalizedLocation(lastExistingPage), {
    redirectCode: 302,
    replace: true,
  })
}

watch([totalPages, page], ([pages, currentPage]) => {
  if (import.meta.client && status.value === 'success' && currentPage > Math.max(1, pages)) {
    void router.replace(normalizedLocation(Math.max(1, pages)))
  }
})

function updateSearchDraft(value: string) {
  searchDraft.value = value
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    void setQuery(value)
  }, 350)
}

function submitSearch(value: string) {
  clearTimeout(searchTimer)
  searchDraft.value = value
  void setQuery(value, false)
}

async function refreshNews() {
  if (status.value === 'pending') {
    return
  }

  forceRefresh.value = true
  try {
    await refresh({ dedupe: 'cancel' })
  }
  finally {
    forceRefresh.value = false
  }
}

function selectView(viewMode: NewsViewMode) {
  newsStore.setViewMode(viewMode)
}

onScopeDispose(() => clearTimeout(searchTimer))

useSeoMeta({
  title: () => page.value > 1 ? `Новости — страница ${page.value}` : 'Новости',
  description: () => query.value
    ? `Новости по запросу «${query.value}» на странице ${page.value}.`
    : `Свежие новости Mos.ru и Lenta.ru, страница ${page.value}.`,
  ogTitle: () => page.value > 1 ? `Список новостей — страница ${page.value}` : 'Список новостей',
  ogDescription: 'Свежие новости Mos.ru и Lenta.ru в одном месте.',
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: () => route.fullPath,
    },
  ],
})
</script>

<template>
  <main
    id="main-content"
    class="news-page"
    :class="`news-page--${newsStore.viewMode}`"
    :aria-busy="status === 'pending'"
  >
    <NewsHeader
      :model-value="searchDraft"
      :refreshing="status === 'pending'"
      @update:model-value="updateSearchDraft"
      @submit="submitSearch"
      @refresh="refreshNews"
    />

    <NewsToolbar
      :sources="newsStore.sources"
      :active-source="source"
      :view-mode="newsStore.viewMode"
      :has-filters="hasFilters"
      @select-source="setSource"
      @select-view="selectView"
      @reset="resetFilters"
    />

    <p
      class="visually-hidden"
      aria-live="polite"
    >
      {{ statusMessage }}
    </p>

    <aside
      v-if="hasRefreshError"
      class="news-warning"
      aria-live="polite"
    >
      Не удалось обновить новости. Показана ранее загруженная версия.
      <button
        class="news-warning__retry"
        type="button"
        @click="refreshNews"
      >
        Повторить
      </button>
    </aside>
    <aside
      v-else-if="newsStore.warnings.length"
      class="news-warning"
      aria-live="polite"
    >
      {{ newsStore.warnings.map(warning => warning.message).join(' ') }}
    </aside>

    <NewsSkeleton v-if="isInitialLoading" />
    <NewsError
      v-else-if="hasFatalError"
      :retrying="status === 'pending'"
      @retry="refreshNews"
    />
    <NewsEmpty
      v-else-if="visibleItems.length === 0"
      :filtered="hasFilters"
      @reset="resetFilters"
    />
    <section
      v-else
      class="news-feed"
      :class="[
        `news-feed--${newsStore.viewMode}`,
        { 'news-feed--refreshing': isRefreshing },
      ]"
      aria-label="Новости"
    >
      <NewsCard
        v-for="item in visibleItems"
        :key="item.id"
        :item="item"
        :view-mode="newsStore.viewMode"
      />
    </section>

    <NewsPagination
      :current-page="page"
      :total-pages="totalPages"
    />
  </main>
</template>

<style scoped lang="scss">
.news-page {
  width: calc(100% - 40px);
  max-width: $content-max-width;
  margin: 0 auto;
  padding: 36px 0 123px;

  &--list {
    padding-bottom: 124px;
  }
}

.news-feed {
  display: grid;
  gap: 20px;
  transition: opacity $transition-fast;

  &--grid {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
  }

  &--list {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }

  &--refreshing {
    opacity: 0.6;
    pointer-events: none;
  }
}

.news-warning {
  margin-bottom: 24px;
  padding: 12px 16px;
  border-left: 4px solid #e1bc00;
  background: $color-warning-bg;
  color: $color-warning-text;
  font-size: 14px;

  &__retry {
    @include interactive-reset;
    margin-left: 8px;
    color: inherit;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
}

@include mobile {
  .news-page {
    width: calc(100% - 43px);
    max-width: none;
    margin: 0 0 0 20px;
    padding: 27px 0 299px;

    &--list {
      padding-bottom: 62px;
    }

    &--grid :deep(.news-header__brand) {
      right: -3px;
    }
  }

  .news-feed,
  .news-feed--grid,
  .news-feed--list {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }

  .news-warning {
    margin-bottom: 16px;
    font-size: 12px;
  }
}
</style>
