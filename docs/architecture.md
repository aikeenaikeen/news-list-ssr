# Архитектура

## Общая схема

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

Клиент не обращается к RSS напрямую. `useAsyncData` получает данные от внутреннего Nitro API во время SSR, а Nuxt передаёт результат клиенту через payload без повторного hydration-запроса.

## URL и состояние

| URL | Результат |
|---|---|
| `/` | redirect на первую страницу |
| `/news/1` | все новости, первая страница |
| `/news/2?source=mos` | вторая страница Mos.ru |
| `/news/1?q=метро` | поиск по заголовку и доступному описанию |
| `/news/1?source=lenta&q=москва` | источник и поиск одновременно |

Источники состояния разделены намеренно:

- номер страницы хранится в path `/news/[page]`;
- источник и поиск — в `source` и `q` query parameters;
- загруженная лента и режим представления управляются Pinia;
- `grid/list` сохраняется в `localStorage` после hydration;
- черновик поискового поля остаётся локальным состоянием компонента.

Смена источника или поискового запроса возвращает пользователя на первую страницу. Пагинация сохраняет query parameters, reset удаляет фильтры, а browser back/forward полностью восстанавливает состояние.

## RSS aggregation и безопасность

Внешние URL находятся в server runtime config и не принимаются из пользовательского query, поэтому endpoint нельзя превратить в SSRF-прокси.

RSS считается недоверенным вводом:

- источники загружаются параллельно с timeout и retry;
- поток ответа ограничен по байтам до полного чтения в память;
- проверяются HTTPS, HTTP status и MIME type;
- запрещены `DOCTYPE` и `ENTITY` declarations;
- HTML удаляется, entities декодируются, `v-html` не используется;
- ссылки и изображения проходят URL validation;
- записи нормализуются, дедуплицируются и стабильно сортируются;
- каждый источник кэшируется отдельно, доступен stale fallback;
- отказ одного RSS возвращает работающий источник с warning;
- отказ обоих источников возвращает контролируемый `502`.

Ручное обновление имеет cooldown и не меняет URL.

## Структура проекта

```text
app/
  assets/styles/          # variables, mixins, reset, shared state styles
  components/news/       # карточки, toolbar, pagination и UI states
  composables/           # URL state
  layouts/
  pages/                 # базовая и динамическая маршрутизация
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
public/
  icons/                  # точные SVG-экспорты управляющих элементов Figma
docs/
```

Ссылка исходного ТЗ ведёт к Nuxt `0.10.7`. Буквально смешивать старую структуру с Nuxt 4 нельзя. Сохранено требуемое разделение на assets, components, layouts, pages, plugins и store, но применена актуальная структура с `app/`, `server/`, `shared/` и `public/`.

## SCSS и responsive

- Arial Regular/Bold используется как точный системный шрифт макета. Лицензионные файлы Arial не копируются в репозиторий;
- desktop-контейнер резиновый с боковыми отступами не менее `20px` и `max-width: 1060px`;
- основной mobile breakpoint — `767px`;
- desktop grid — две колонки по `520px` с промежутком `20px`, изображения скрыты;
- desktop list — карточка `1060 × 189px` с изображением `200 × 100px`;
- на контрольной ширине `425px` mobile-контент имеет ширину `382px` и начинается с `x=20px`;
- mobile grid — одна колонка без изображений, mobile list — изображение `338 × 166px` и текст под ним;
- поиск, refresh и search icons экспортированы из исходного Figma-файла без приблизительной перерисовки;
- общие mixins покрывают breakpoints, focus ring, shadow, line clamp, reduced motion и reset controls.

Компонентные стили scoped. `additionalData` инжектирует только Sass variables и mixins, поэтому CSS rules не дублируются.

## Ограничения live RSS

Макет использует статичные записи и условную последнюю страницу `200`. Приложение работает с актуальными RSS и вычисляет количество страниц из реального набора данных.

Mos.ru обычно отдаёт около 10 записей, Lenta.ru — до 200; API по умолчанию берёт максимум 50 записей каждого источника. В Lenta.ru поле `<description>` часто пустое. Приложение не генерирует выдуманный текст и не скрапит страницы: поиск использует title и фактически доступный description.

## Связанные материалы ТЗ

- [Vue](https://vuejs.org/guide/introduction.html)
- [Nuxt directory structure](https://nuxt.com/docs/4.x/directory-structure/)
- [Nuxt routing](https://nuxt.com/docs/4.x/getting-started/routing)
- [`useAsyncData`](https://nuxt.com/docs/4.x/api/composables/use-async-data)
- [Pinia + Nuxt SSR](https://pinia.vuejs.org/ssr/nuxt.html)
- [Vue Router navigation](https://router.vuejs.org/guide/essentials/navigation.html)
- [Исходный Figma-макет из ТЗ](https://www.figma.com/design/7CWWZqtl8E8iNJAgWuGnfI/Тестовое?node-id=2682-119)
