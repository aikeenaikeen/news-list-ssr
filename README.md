# Список новостей — Nuxt 4 SSR

[![Quality checks](https://github.com/aikeenaikeen/news-list-ssr/actions/workflows/ci.yml/badge.svg)](https://github.com/aikeenaikeen/news-list-ssr/actions/workflows/ci.yml)

SSR-веб-приложение на Nuxt 4, которое объединяет новости [Mos.ru](https://www.mos.ru/rss) и [Lenta.ru](https://lenta.ru/rss/news), поддерживает поиск, фильтрацию, пагинацию и два адаптивных режима отображения.

## Возможности

- universal SSR и загрузка RSS через защищённый Nitro API;
- Pinia и сохранение режима `grid/list` в `localStorage`;
- динамические страницы `/news/[page]`;
- фильтр источника и поиск в URL query parameters;
- сброс фильтров, ручное обновление и обработка отказов RSS;
- адаптивная SCSS-вёрстка по desktop/mobile-макетам.

## Требования

- Node.js `24.19.0` — точная версия зафиксирована в `.nvmrc`;
- npm `11.17.0` — входит в поставку указанной версии Node.js.

## Запуск

```bash
git clone https://github.com/aikeenaikeen/news-list-ssr.git
cd news-list-ssr
nvm install 24.19.0
nvm use 24.19.0
npm i
npm run dev
```

Приложение будет доступно по адресу [http://127.0.0.1:3000](http://127.0.0.1:3000). Корневой URL перенаправляет на `/news/1`.

Полная локальная проверка:

```bash
npm run check
```

## Документация

- [Архитектура, URL, RSS и адаптивность](docs/architecture.md)
- [Разработка, команды, тесты и CI](docs/development.md)
- [Конфигурация и SSR-деплой](docs/deployment.md)

## Репозиторий

[github.com/aikeenaikeen/news-list-ssr](https://github.com/aikeenaikeen/news-list-ssr)
