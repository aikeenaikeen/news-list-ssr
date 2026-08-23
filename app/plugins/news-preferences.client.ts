import type { NewsViewMode } from '~~/shared/types/news'
import { NEWS_VIEW_STORAGE_KEY } from '~~/shared/constants/news'
import { useNewsStore } from '~/stores/news'

function isViewMode(value: string | null): value is NewsViewMode {
  return value === 'grid' || value === 'list'
}

export default defineNuxtPlugin({
  name: 'news-preferences',
  setup(nuxtApp) {
    const store = useNewsStore()
    let initialized = false

    // `page:finish` runs after the initial Suspense branch has hydrated. Reading
    // localStorage any earlier would make the client expect list markup while
    // the server necessarily rendered the deterministic grid default.
    nuxtApp.hook('page:finish', () => {
      if (initialized) {
        return
      }

      initialized = true

      try {
        const savedMode = window.localStorage.getItem(NEWS_VIEW_STORAGE_KEY)
        if (isViewMode(savedMode)) {
          store.setViewMode(savedMode)
        }
      }
      catch {
        // Storage may be unavailable in privacy mode. The SSR default remains usable.
      }

      watch(
        () => store.viewMode,
        (mode) => {
          try {
            window.localStorage.setItem(NEWS_VIEW_STORAGE_KEY, mode)
          }
          catch {
            // A preference must never make the application unusable.
          }
        },
        { flush: 'post' },
      )

      window.addEventListener('storage', (event) => {
        if (event.key === NEWS_VIEW_STORAGE_KEY && isViewMode(event.newValue)) {
          store.setViewMode(event.newValue)
        }
      })
    })
  },
})
