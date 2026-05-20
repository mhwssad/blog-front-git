import type { Ref } from 'vue'
import type { PageResult } from '@/types/api-types/common'

export interface PaginatedState<T> {
  items: Ref<T[]>
  total: Ref<number>
  current: Ref<number>
  size: Ref<number>
  loading: Ref<boolean>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetch: (params?: any) => Promise<void>
  clear: () => void
}

export interface UsePaginatedStateOptions<T> {
  /** API 调用函数，返回 Axios response（response.data.data 为 PageResult<T>） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchFn: (params?: any) => Promise<any>
  defaultSize?: number
  persistSizeKey?: string
}

export function usePaginatedState<T>(options: UsePaginatedStateOptions<T>): PaginatedState<T> {
  const defaultSize = options.defaultSize ?? 10
  const initialSize = options.persistSizeKey
    ? Number(localStorage.getItem(options.persistSizeKey)) || defaultSize
    : defaultSize

  const items = ref<T[]>([]) as Ref<T[]>
  const total = ref(0)
  const current = ref(1)
  const size = ref(initialSize)
  const loading = ref(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function fetch(params?: any): Promise<void> {
    loading.value = true
    try {
      const response = await options.fetchFn(params)
      const data: PageResult<T> = response.data.data
      items.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  function clear(): void {
    items.value = []
    total.value = 0
    current.value = 1
  }

  return { items, total, current, size, loading, fetch, clear }
}
