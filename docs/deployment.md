# Конфигурация и деплой

## Runtime config

Значения по умолчанию находятся в `nuxt.config.ts` и переопределяются серверными environment variables.

| Переменная | Default |
|---|---|
| `NUXT_NEWS_MOS_RSS_URL` | `https://www.mos.ru/rss` |
| `NUXT_NEWS_RBC_RSS_URL` | `https://rssexport.rbc.ru/rbcnews/news/30/full.rss` |
| `NUXT_NEWS_CACHE_TTL_MS` | `300000` |
| `NUXT_NEWS_REQUEST_TIMEOUT_MS` | `10000` |
| `NUXT_NEWS_MAX_ITEMS_PER_SOURCE` | `50` |

См. `.env.example`. Числовые значения валидируются и ограничиваются на API boundary.

## Production build

```bash
npm ci
npm run build
node .output/server/index.mjs
```

По умолчанию Nitro использует порт `3000`. Для production можно задать `NITRO_HOST` и `NITRO_PORT`.

## Выбор hosting

Приложению необходим SSR runtime и Nitro API для чтения RSS. GitHub Pages как статический hosting не подходит. Возможны обычный Node.js hosting, Vercel или Netlify.

Дополнительные ссылки:

- [Nuxt installation](https://nuxt.com/docs/4.x/getting-started/installation)
- [Nuxt configuration](https://nuxt.com/docs/getting-started/configuration)
- [Nuxt server directory](https://nuxt.com/docs/4.x/directory-structure/server)
