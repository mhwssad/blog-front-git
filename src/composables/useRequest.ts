import { ref, readonly, type Ref } from 'vue'

export interface UseRequestOptions<T> {
  /** 请求函数 */
  fn: (...args: unknown[]) => Promise<T>
  /** 是否在创建时立即执行，默认 false */
  immediate?: boolean
  /** 初始数据 */
  initialData?: T
}

export interface UseRequestReturn<T> {
  /** 响应数据 */
  data: Ref<T | undefined>
  /** 是否加载中 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 手动触发请求 */
  execute: (...args: unknown[]) => Promise<T | undefined>
  /** 重置状态 */
  reset: () => void
}

/**
 * 通用请求状态管理 Composable
 *
 * 统一管理 loading/error/data 状态，消除各处重复的 try-catch + ref 模式。
 *
 * @example
 * ```ts
 * const { data, loading, error, execute } = useRequest({
 *   fn: (id: number) => ArticleApi.getArticleById(id),
 * })
 *
 * // 手动调用
 * await execute(42)
 * ```
 */
export function useRequest<T>(options: UseRequestOptions<T>): UseRequestReturn<T> {
  const data = ref<T | undefined>(options.initialData) as Ref<T | undefined>
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function execute(...args: unknown[]): Promise<T | undefined> {
    loading.value = true
    error.value = null

    try {
      const result = await options.fn(...args)
      data.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      return undefined
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    data.value = options.initialData
    loading.value = false
    error.value = null
  }

  if (options.immediate) {
    void execute()
  }

  return {
    data,
    loading: readonly(loading) as Ref<boolean>,
    error: readonly(error) as Ref<Error | null>,
    execute,
    reset,
  }
}
