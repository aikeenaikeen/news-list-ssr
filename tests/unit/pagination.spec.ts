import { describe, expect, it } from 'vitest'
import { createPagination } from '~~/shared/utils/pagination'

describe('createPagination', () => {
  it('returns all pages for short collections', () => {
    expect(createPagination(2, 4)).toEqual([1, 2, 3, 4])
  })

  it('matches the first-page layout from the design', () => {
    expect(createPagination(1, 200)).toEqual([1, 2, 3, 4, 'ellipsis-end', 200])
  })

  it('adds ellipses around a middle page', () => {
    expect(createPagination(50, 200)).toEqual([
      1,
      'ellipsis-start',
      49,
      50,
      51,
      'ellipsis-end',
      200,
    ])
  })

  it('keeps the final pages reachable', () => {
    expect(createPagination(200, 200)).toEqual([
      1,
      'ellipsis-start',
      197,
      198,
      199,
      200,
    ])
  })
})
