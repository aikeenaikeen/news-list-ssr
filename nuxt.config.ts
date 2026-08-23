export default defineNuxtConfig({
  compatibilityDate: '2026-08-23',

  modules: [
    '@pinia/nuxt',
    '@nuxt/eslint',
  ],

  css: ['~/assets/styles/main.scss'],

  devtools: {
    enabled: true,
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'ru',
      },
      titleTemplate: '%s · Список новостей',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Свежие новости Mos.ru и Lenta.ru в одном месте.',
        },
        { name: 'theme-color', content: '#003cff' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  runtimeConfig: {
    news: {
      cacheTtlMs: 5 * 60 * 1000,
      requestTimeoutMs: 10_000,
      maxItemsPerSource: 50,
      mosRssUrl: 'https://www.mos.ru/rss',
      lentaRssUrl: 'https://lenta.ru/rss/news',
    },
  },

  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: [
            '@use "~/assets/styles/abstracts/variables" as *;',
            '@use "~/assets/styles/abstracts/mixins" as *;',
          ].join('\n'),
        },
      },
    },
  },

  nitro: {
    compressPublicAssets: true,
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
