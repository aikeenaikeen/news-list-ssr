export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@nuxt/eslint',
  ],

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
        { name: 'theme-color', content: '#0029ff' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  css: ['~/assets/styles/main.scss'],

  runtimeConfig: {
    news: {
      cacheTtlMs: 5 * 60 * 1000,
      requestTimeoutMs: 10_000,
      maxItemsPerSource: 50,
      mosRssUrl: 'https://www.mos.ru/rss',
      lentaRssUrl: 'https://lenta.ru/rss/news',
    },
  },

  routeRules: {
    '/**': {
      headers: {
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    },
  },

  compatibilityDate: '2026-08-23',

  nitro: {
    compressPublicAssets: true,
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

  typescript: {
    strict: true,
    typeCheck: true,
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  pinia: {
    storesDirs: ['./app/stores/**'],
  },
})
