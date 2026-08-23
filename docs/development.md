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

TypeScript зафиксирован на `6.0.3`: TypeScript 7 несовместим с текущим `vue-tsc 3.3.11` из-за изменённого package export.

Необходимые native lifecycle scripts закреплены по версиям в `package.json#allowScripts`; остальные dependency install scripts npm блокирует по умолчанию.

## Windows PowerShell

На компьютере, где выполнение PowerShell-скриптов полностью отключено, команда `npm` может завершиться с `PSSecurityException` ещё до обращения к проекту. Это одноразовая настройка пользовательского окружения, а не зависимость приложения.

Разрешите локальные скрипты для текущего пользователя без прав администратора:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Политика `RemoteSigned` продолжает требовать подпись для загруженных из интернета скриптов. После настройки обычные команды `npm i` и `npm run dev` работают в PowerShell; при необходимости переоткройте терминал.

## Команды

| Команда | Назначение |
|---|---|
| `npm run dev` | dev-server на `127.0.0.1:3000` |
| `npm run lint` | ESLint |
| `npm run lint:fix` | автоматические ESLint-исправления |
| `npm run typecheck` | strict Nuxt/Vue typecheck |
| `npm run build` | production SSR build |
| `npm run preview` | preview production build |
| `npm run check` | lint → typecheck → build |

## Git workflow

История разработки разделена по функциональности и использует спецификацию [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): `chore`, `feat`, `fix`, `test` и `docs`.
