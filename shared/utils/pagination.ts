export type PaginationToken = number | 'ellipsis-start' | 'ellipsis-end'

export function createPagination(
  currentPage: number,
  totalPages: number,
): PaginationToken[] {
  if (totalPages <= 0) {
    return []
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis-end', totalPages]
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      'ellipsis-start',
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }

  return [
    1,
    'ellipsis-start',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis-end',
    totalPages,
  ]
}
