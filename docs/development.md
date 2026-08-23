# Разработка

Быстрый старт находится в корневом [README](../README.md#запуск).

## Toolchain

Версии зафиксированы `package-lock.json` и актуальны на дату разработки.

| Технология | Версия |
|---|---:|
| Node.js LTS | 24.19.0 |
| npm | 11.17.0 |
| Nuxt | 4.5.2 |
| Vue | 3.5.41 |
| Vue Router | 5.2.0 |
| Pinia | 4.0.3 |
| `@pinia/nuxt` | 1.0.2 |
| Sass | 1.103.1 |
| Vitest | 4.1.11 |

TypeScript зафиксирован на `6.0.3`: TypeScript 7 несовместим с текущим `vue-tsc 3.3.11` из-за изменённого package export.

Необходимые native lifecycle scripts закреплены по версиям в `package.json#allowScripts`; остальные dependency install scripts npm блокирует по умолчанию.

## Команды

| Команда | Назначение |
|---|---|
| `npm run dev` | dev-server на `127.0.0.1:3000` |
| `npm run lint` | ESLint |
| `npm run lint:fix` | автоматические ESLint-исправления |
| `npm run typecheck` | strict Nuxt/Vue typecheck |
| `npm test` | unit-тесты Vitest |
| `npm run test:watch` | тесты в watch mode |
| `npm run build` | production SSR build |
| `npm run preview` | preview production build |
| `npm run check` | lint → typecheck → test → build |

## Автоматические тесты

23 unit-теста покрывают:

- Mos.ru/Lenta.ru RSS fixtures, CDATA, entities, очистку HTML и изображения;
- запрет небезопасных XML declarations и media URL;
- MIME validation и остановку чтения при превышении byte limit;
- частичный ответ при отказе одного RSS и `502` при отказе обоих;
- поиск по title/description, фильтр источника, регистр и `е/ё`;
- форматирование даты в `Europe/Moscow`;
- разные диапазоны pagination;
- детерминированный Pinia default и смену режима.

## Браузерная проверка

Отдельно проверены desktop/mobile/tablet layouts, grid/list, focus, search/source URL, reset, pagination, back navigation, refresh, reload с сохранённым `localStorage`, SSR HTML и отсутствие hydration/console errors.

## CI

GitHub Actions для каждого push в `main` и pull request выполняет:

1. `npm ci`;
2. lint;
3. strict typecheck;
4. unit-тесты;
5. production build;
6. Docker image build;
7. запуск Nitro-контейнера и HTTP smoke-test.

## Git workflow

История разработки разделена по функциональности и использует спецификацию [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): `chore`, `feat`, `fix`, `test` и `docs`.
