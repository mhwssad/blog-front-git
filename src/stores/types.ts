import type { Ref, ComputedRef } from 'vue'

export interface PaginatedList<T> {
  items: Ref<T[]>
  total: Ref<number>
  current: Ref<number>
  size: Ref<number>
  loading: Ref<boolean>
}

export interface SelectionState<T> {
  selectedRows: Ref<T[]>
  selectedIds: ComputedRef<number[]>
  selectedCount: ComputedRef<number>
}
