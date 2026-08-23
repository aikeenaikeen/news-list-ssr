# Список новостей — Nuxt 4 SSR

SSR-веб-приложение, которое объединяет новости [Mos.ru](https://www.mos.ru/rss) и [Lenta.ru](https://lenta.ru/rss/news), фильтрует их по источнику и содержанию и отображает в двух адаптивных режимах по предоставленному Figma-макету.

## Что реализовано

- настоящий universal SSR на Nuxt 4: карточки приходят в первом HTML, а не появляются только после hydration;
- серверная агрегация двух RSS без CORS-проблем в `server/api/news.get.ts`;
- параллельная загрузка источников, timeout, retry, ограничение размера, кэш, stale fallback и частичный ответ при отказе одного RSS;
- Pinia для нормализованных данных и пользовательского режима отображения;
- режимы `grid` и `list`, сохранение в `localStorage` без hydration mismatch;
- базовый маршрут `/` и динамический `/news/[page]`;
- номер страницы в полном path, например `/news/3`;
- источник в `?source=mos|lenta`, поиск в `?q=...`;
- debounce поиска, submit по Enter, совместная работа query-параметров и browser back/forward;
- единый сброс источника и поискового запроса;
- обновление RSS по кнопке без изменения URL;
- четыре карточки на страницу и доступная пагинация с многоточиями;
- empty/error/partial-error/loading состояния;
- адаптивная SCSS-вёрстка, доступность, SEO metadata и security headers;
- strict TypeScript, ESLint, 23 unit-теста, production build и GitHub Actions CI.

## Стек

Версии зафиксированы lockfile и актуальны на дату разработки:

| Технология | Версия |
|---|---:|
| Node.js LTS | 24.19.0 |
| Nuxt | 4.5.2 |
| Vue | 3.5.41 |
| Vue Router | 5.2.0 |
| Pinia | 4.0.3 |
| `@pinia/nuxt` | 1.0.2 |
| Sass | 1.103.1 |
| Vitest | 4.1.11 |

TypeScript зафиксирован на `6.0.3`: выпущенный TypeScript 7 пока несовместим с текущим `vue-tsc 3.3.11` из-за изменённого package export. Это осознанный выбор последней совместимой стабильной версии, а не плавающая зависимость.

## Запуск

Требуются Node.js `24.x` начиная с `24.11.0` и pnpm `11.22.0`; рекомендуемая точная версия Node зафиксирована в `.nvmrc`.

```bash
corepack enable
corepack prepare pnpm@11.22.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Приложение будет доступно по адресу `http://localhost:3000`; `/` перенаправит на `/news/1`.

Production-проверка:

```bash
pnpm check
node .output/server/index.mjs
```

Отдельные команды:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

## URL-контракт

| URL | Результат |
|---|---|
| `/` | redirect на первую страницу |
| `/news/1` | все новости, первая страница |
| `/news/2?source=mos` | вторая страница Mos.ru |
| `/news/1?q=метро` | поиск по заголовку и доступному описанию |
| `/news/1?source=lenta&q=москва` | источник и поиск одновременно |

Смена источника или запроса возвращает пользователя на первую страницу. Пагинация сохраняет активные query-параметры. Режим представления намеренно не хранится в URL: это пользовательское предпочтение из Pinia + `localStorage`.

## Архитектура

```text
app/pages/news/[page].vue
  ├─ useAsyncData + useRequestFetch (SSR payload)
  ├─ URL state: page / source / q
  ├─ Pinia: feed + view preference
  └─ responsive components
          │
          ▼
server/api/news.get.ts
  └─ news-feed service
       ├─ Mos.ru RSS ─┐
       ├─ Lenta RSS ──┼─ Promise.allSettled
       └─ cache/stale ┘
             │
             ▼
       safe XML normalization
       deduplicate → stable sort → JSON
```

Клиент никогда не обращается к RSS напрямую. Внешние URL фиксированы server runtime config, поэтому query не может превратить API в SSRF-прокси. RSS считается недоверенным вводом: HTML удаляется, entities декодируются, `v-html` не используется, разрешаются только HTTPS-ссылки, размер текста и XML ограничен.

## Структура каталогов

```text
app/
  assets/styles/          # variables, mixins, reset, shared state styles
  components/news/       # BEM-подобные компоненты карточек и controls
  composables/           # URL state
  layouts/
  pages/                 # basic + dynamic routing
  plugins/               # hydration-safe localStorage persistence
  stores/                # Pinia
server/
  api/                    # Nitro API
  services/               # RSS aggregation/cache
  utils/                  # XML normalization
shared/
  constants/
  types/
  utils/
tests/
  fixtures/
  unit/
public/
```

Ссылка в исходном ТЗ ведёт к структуре Nuxt `0.10.7`. Буквально смешивать её с актуальным Nuxt 4 нельзя. Сохранено требуемое разделение на assets, components, layouts, pages, plugins и store, но использована официальная [Nuxt 4 directory structure](https://nuxt.com/docs/4.x/directory-structure/) с `app/`, `server/`, `shared/` и `public/`.

## SCSS и адаптивность

- базовый шрифт — Arial, как в макете;
- desktop container — fluid `76%` с `max-width: 1520px`;
- mobile container — ширина viewport минус `40px`;
- breakpoint — `767px`;
- desktop grid: 2 колонки по 744px при ширине макета, изображения скрыты;
- desktop list: изображение `280 × 140`, горизонтальная карточка;
- mobile grid: одна колонка без изображений;
- mobile list: изображение `2:1`, текст под ним;
- переиспользуемые SCSS mixins: mobile media, focus ring, card shadow, line clamp, reduced motion и reset интерактивных controls.

Все component styles scoped; `additionalData` инжектирует только variables/mixins и не дублирует CSS rules.

## Runtime config

Значения по умолчанию находятся в `nuxt.config.ts`; при необходимости их можно переопределить серверными environment variables:

| Переменная | Default |
|---|---|
| `NUXT_NEWS_MOS_RSS_URL` | `https://www.mos.ru/rss` |
| `NUXT_NEWS_LENTA_RSS_URL` | `https://lenta.ru/rss/news` |
| `NUXT_NEWS_CACHE_TTL_MS` | `300000` |
| `NUXT_NEWS_REQUEST_TIMEOUT_MS` | `10000` |
| `NUXT_NEWS_MAX_ITEMS_PER_SOURCE` | `50` |

См. также `.env.example`. Числовые настройки валидируются и ограничиваются на API boundary.

## Особенности live RSS

Макет показывает статичные новости и условную последнюю страницу `200`, но production использует live RSS и вычисляет реальное количество страниц. На момент реализации Mos.ru отдаёт около 10 записей, Lenta.ru — около 200; API берёт до 50 из каждого источника по умолчанию.

Lenta.ru сейчас почти всегда отдаёт пустой `<description>`. Приложение не генерирует выдуманный текст и не скрапит сотни HTML-страниц: поиск работает по title и по description там, где источник его предоставляет. Карточки остаются устойчивыми к отсутствующему описанию или изображению.

## Проверки

Unit-тесты покрывают:

- Mos.ru/Lenta.ru RSS fixtures, CDATA, entities, очистку HTML и выбор изображения;
- запрет небезопасных XML declarations и media URL, ограничение потока по байтам и проверку MIME type;
- частичный ответ при отказе одного RSS и контролируемый `502` при отказе обоих;
- поиск по title/description, source filter, регистр и `е/ё`;
- детерминированную дату в `Europe/Moscow`;
- pagination с началом, серединой и концом диапазона;
- Pinia default и смену режима.

Дополнительно автоматизированным браузером проверены desktop/mobile, grid/list, focus, URL поиска и источника, reset, pagination, back navigation, refresh, reload с сохранённым `localStorage` и отсутствие hydration/console errors.

## Деплой

Это SSR-приложение с Nitro endpoint, поэтому GitHub Pages для него не подходит. Репозиторий можно хранить на GitHub/GitLab, а runtime размещать на Node.js hosting, Vercel, Netlify или в контейнере.

```bash
docker build -t news-list-ssr .
docker run --rm -p 3000:3000 news-list-ssr
```

GitHub Actions запускает lint, typecheck, unit tests, production build, сборку Docker image и smoke-test Nitro-контейнера для push в `main` и каждого pull request.

## Основные ссылки ТЗ

- [Vue](https://vuejs.org/guide/introduction.html)
- [Nuxt installation](https://nuxt.com/docs/4.x/getting-started/installation)
- [Nuxt routing](https://nuxt.com/docs/4.x/getting-started/routing)
- [`useAsyncData`](https://nuxt.com/docs/4.x/api/composables/use-async-data)
- [Pinia + Nuxt SSR](https://pinia.vuejs.org/ssr/nuxt.html)
- [Vue Router query navigation](https://router.vuejs.org/guide/essentials/navigation.html)
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
