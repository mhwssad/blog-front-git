import type { PublicArticleQueryRequest } from '@/types/api-types'

export interface CategoryOption {
  id: number
  label: string
}

export interface SortOption {
  label: string
  value: NonNullable<PublicArticleQueryRequest['sort']>
}
