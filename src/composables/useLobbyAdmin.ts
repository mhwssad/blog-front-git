import { computed } from 'vue'
import { useChatStore } from '@/stores'

export function useLobbyAdmin() {
  const chatStore = useChatStore()
  const lobbyConvId = computed(() => chatStore.lobbyInfo?.id ?? null)

  /**
   * 确保 lobby 信息已加载，返回 lobbyConvId 或 null（加载失败时）
   */
  async function ensureLobbyLoaded(): Promise<number | null> {
    if (lobbyConvId.value) return lobbyConvId.value
    const info = await chatStore.fetchLobbyInfo()
    return info?.id ?? null
  }

  return { chatStore, lobbyConvId, ensureLobbyLoaded }
}
