/**
 * 聊天管理 Store facade（后台管理端）
 * @description 组合子模块，对外 API 完全不变
 * 基于 chat-api.md 文档
 */

import { defineStore } from 'pinia'
import type { ChatConversationVO } from '@/types/api-types'
import { useChatConversations } from './conversations'
import { useChatMessages } from './messages'
import { useChatLobby } from './lobby'
import { useChatApplications } from './applications'
import { useChatMutes } from './mutes'

export const useChatStore = defineStore('admin-chat', () => {
  const conv = useChatConversations()
  const msg = useChatMessages()
  const lobby = useChatLobby()
  const app = useChatApplications()
  const mute = useChatMutes()

  // ==================== 跨模块操作 ====================

  async function fetchLobbyInfo(): Promise<ChatConversationVO | null> {
    lobby.lobbyInfoLoading.value = true
    try {
      await conv.fetchConversations({ size: 100 })
      const hall = conv.conversations.value.find((c) => c.sceneType === 'hall_channel')
      if (hall) {
        const detail = await conv.fetchConversationDetail(hall.id)
        lobby.lobbyInfo.value = detail
        return detail
      }
      return null
    } finally {
      lobby.lobbyInfoLoading.value = false
    }
  }

  function clearConversationContext(): void {
    conv.conversationDetail.value = null
    conv.members.value = []
    msg.messages.value = []
    msg.messageDetail.value = null
    msg.receipts.value = []
    msg.messageTotal.value = 0
    msg.receiptTotal.value = 0
    lobby.pinnedMessages.value = []
    lobby.pinnedTotal.value = 0
    lobby.lobbyInfo.value = null
    app.channelApplications.value = []
    app.channelAppTotal.value = 0
    app.channelAppDetail.value = null
    app.groupJoinApplications.value = []
    app.groupJoinAppTotal.value = 0
    mute.mutes.value = []
    mute.muteTotal.value = 0
  }

  const clearState = clearConversationContext

  return {
    ...conv,
    ...msg,
    ...lobby,
    ...app,
    ...mute,

    fetchLobbyInfo,
    clearConversationContext,
    clearState,
  }
})
