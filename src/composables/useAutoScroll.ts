import { nextTick, ref, watch, type Ref } from 'vue'

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
export function useAutoScroll(): {
  containerRef: Ref<HTMLElement | null>
  scrollToBottom: () => void
  autoScroll: (trigger: () => unknown) => void
} {
  const containerRef = ref<HTMLElement | null>(null)

  function scrollToBottom(): void {
    void nextTick(() => {
      if (containerRef.value) {
        containerRef.value.scrollTop = containerRef.value.scrollHeight
      }
    })
  }

  /** 设置自动滚动 — 当 trigger 返回值变化时自动滚到底部 */
  function autoScroll(trigger: () => unknown): void {
    watch(trigger, () => scrollToBottom())
  }

  return { containerRef, scrollToBottom, autoScroll }
}
