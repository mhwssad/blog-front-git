export interface UseAdminPaginationOptions {
  /** Store 的分页查询函数 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchFn: (params: any) => Promise<void>
  /** 构建搜索参数（不含 current/size，由 composable 自动附加） */
  buildParams: () => Record<string, unknown>
  /** 是否在 onMounted 自动加载，默认 true */
  immediate?: boolean
  /** 搜索防抖毫秒数，默认 300 */
  searchDebounce?: number
  /** localStorage key，持久化 page size */
  persistSizeKey?: string
  /** 默认每页数量，默认 10 */
  defaultSize?: number
}

export function useAdminPagination(options: UseAdminPaginationOptions) {
  const {
    fetchFn,
    buildParams,
    immediate = true,
    searchDebounce = 300,
    persistSizeKey,
    defaultSize = 10,
  } = options

  const initialSize = persistSizeKey
    ? Number(localStorage.getItem(persistSizeKey)) || defaultSize
    : defaultSize

  const pagination = reactive({ current: 1, size: initialSize })

  async function fetch(): Promise<void> {
    const params = buildParams()
    params.current = pagination.current
    params.size = pagination.size
    await fetchFn(params)
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  function debouncedFetch(): void {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      void fetch()
    }, searchDebounce)
  }

  function handleSearch(): void {
    pagination.current = 1
    debouncedFetch()
  }

  function handleReset(resetParams: () => void): void {
    resetParams()
    pagination.current = 1
    pagination.size = initialSize
    void fetch()
  }

  function handleSizeChange(newSize: number): void {
    pagination.size = newSize
    pagination.current = 1
    if (persistSizeKey) {
      localStorage.setItem(persistSizeKey, String(newSize))
    }
    void fetch()
  }

  function handleCurrentChange(newCurrent: number): void {
    pagination.current = newCurrent
    void fetch()
  }

  onMounted(() => {
    if (immediate) {
      void fetch()
    }
  })

  return { pagination, fetch, handleSearch, handleReset, handleSizeChange, handleCurrentChange }
}
