/**
 * 大厅频道子模块
 * @description 管理：大厅信息、置顶消息、频道主题
 */

import { ref } from 'vue'
import { SysChatApi } from '@/api/sys/chat'
import type {
  ChatConversationVO,
  ChatLobbyPinnedMessageVO,
  ChatLobbySettingsUpdateRequest,
  ChatGroupMuteRequest,
  SysTopicChannelSaveRequest,
} from '@/types/api-types'

export function useChatLobby() {
  const lobbyInfo = ref<ChatConversationVO | null>(null)
  const lobbyInfoLoading = ref(false)

  const pinnedMessages = ref<ChatLobbyPinnedMessageVO[]>([])
  const pinnedTotal = ref(0)
  const pinnedLoading = ref(false)

  async function updateLobbySettings(data: ChatLobbySettingsUpdateRequest): Promise<boolean> {
    try {
      await SysChatApi.updateLobbySettings(data)
      return true
    } catch {
      return false
    }
  }

  async function pinLobbyMessage(messageId: number): Promise<boolean> {
    try {
      await SysChatApi.pinLobbyMessage(messageId)
      return true
    } catch {
      return false
    }
  }

  async function unpinLobbyMessage(messageId: number): Promise<boolean> {
    try {
      await SysChatApi.unpinLobbyMessage(messageId)
      return true
    } catch {
      return false
    }
  }

  async function fetchPinnedLobbyMessages(params?: {
    current?: number
    size?: number
  }): Promise<void> {
    pinnedLoading.value = true
    try {
      const response = await SysChatApi.getPinnedLobbyMessages(params)
      const data = response.data.data
      pinnedMessages.value = data.records
      pinnedTotal.value = data.total
    } finally {
      pinnedLoading.value = false
    }
  }

  async function muteLobbyMember(
    memberUserId: number,
    data: ChatGroupMuteRequest,
  ): Promise<boolean> {
    try {
      await SysChatApi.muteLobbyMember(memberUserId, data)
      return true
    } catch {
      return false
    }
  }

  async function kickLobbyMember(memberUserId: number): Promise<boolean> {
    try {
      await SysChatApi.kickLobbyMember(memberUserId)
      return true
    } catch {
      return false
    }
  }

  async function createTopicChannel(data: SysTopicChannelSaveRequest): Promise<boolean> {
    try {
      await SysChatApi.createTopicChannel(data)
      return true
    } catch {
      return false
    }
  }

  async function updateTopicChannel(
    conversationId: number,
    data: SysTopicChannelSaveRequest,
  ): Promise<boolean> {
    try {
      await SysChatApi.updateTopicChannel(conversationId, data)
      return true
    } catch {
      return false
    }
  }

  return {
    lobbyInfo,
    lobbyInfoLoading,
    pinnedMessages,
    pinnedTotal,
    pinnedLoading,
    updateLobbySettings,
    pinLobbyMessage,
    unpinLobbyMessage,
    fetchPinnedLobbyMessages,
    muteLobbyMember,
    kickLobbyMember,
    createTopicChannel,
    updateTopicChannel,
  }
}
