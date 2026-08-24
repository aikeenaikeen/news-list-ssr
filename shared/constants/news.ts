import type { NewsSource } from '../types/news'

export const NEWS_SOURCES = [
  {
    id: 'rbc',
    name: 'РБК',
    homepage: 'https://www.rbc.ru/',
  },
  {
    id: 'mos',
    name: 'Mos.ru',
    homepage: 'https://www.mos.ru/',
  },
] as const satisfies readonly NewsSource[]

export const NEWS_PAGE_SIZE = 4
export const NEWS_VIEW_STORAGE_KEY = 'news-list:view-mode'
