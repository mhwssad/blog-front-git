import { ref, onMounted, type Ref } from 'vue'

/**
 * 通用分页列表 Composable
 *
 * 统一管理分页状态 + onMounted 自动加载，消除 7+ 页面中重复的
 * currentPage/loadData/reset-to-1 模式。
 *
 * @example
 * ```ts
 * const { currentPage, loadData } = usePaginatedList(async (page) => {
 *   await store.fetchArticles({ current: page, size: 10, categoryId: id.value })
 * })
 * ```
 */
export interface UsePaginatedListOptions {
  /** 是否在 onMounted 时自动调用 loadData，默认 true */
  immediate?: boolean
}

export function usePaginatedList(
  fetchFn: (page: number) => Promise<void>,
  options?: UsePaginatedListOptions,
): {
  currentPage: Ref<number>
  loadData: () => Promise<void>
  reset: () => void
} {
  const currentPage = ref(1)

  async function loadData(): Promise<void> {
    await fetchFn(currentPage.value)
  }

  function reset(): void {
    currentPage.value = 1
  }

  // 始终在 setup 阶段同步注册 onMounted，避免条件调用导致的 Vue 警告
  onMounted(() => {
    if (options?.immediate !== false) {
      void loadData()
    }
  })

  return { currentPage, loadData, reset }
}
