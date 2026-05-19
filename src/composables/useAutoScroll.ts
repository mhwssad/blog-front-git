import { nextTick, ref, watch, type Ref } from 'vue'

export interface UseAutoScrollOptions {
  /** 滚动防抖间隔（毫秒），默认 100。设为 0 禁用防抖 */
  debounce?: number
}

/**
 * 自动滚动容器 Composable
 *
 * 封装聊天/AI 对话类场景的 scrollToBottom 模式，消除
 * AiAssistant / ChatView 中重复的 nextTick + scrollTop 逻辑。
 *
 * @example
 * ```ts
 * const { containerRef, scrollToBottom, autoScroll } = useAutoScroll()
 * watch(() => store.messages.length, () => scrollToBottom())
 * ```
 */
export function useAutoScroll(options?: UseAutoScrollOptions): {
  containerRef: Ref<HTMLElement | null>
  scrollToBottom: () => void
  autoScroll: (trigger: () => unknown) => void
} {
  const containerRef = ref<HTMLElement | null>(null)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  const debounceMs = options?.debounce ?? 100

  function scrollToBottom(): void {
    const doScroll = () => {
      if (containerRef.value) {
        containerRef.value.scrollTop = containerRef.value.scrollHeight
      }
    }

    if (debounceMs <= 0) {
      void nextTick(doScroll)
      return
    }

    if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = null
      void nextTick(doScroll)
    }, debounceMs)
  }

  /** 设置自动滚动 — 当 trigger 返回值变化时自动滚到底部 */
  function autoScroll(trigger: () => unknown): void {
    watch(trigger, () => scrollToBottom())
  }

  return { containerRef, scrollToBottom, autoScroll }
}
