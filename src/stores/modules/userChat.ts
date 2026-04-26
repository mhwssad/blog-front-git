import { ref } from 'vue'
import { defineStore } from 'pinia'
import { UserChatApi } from '@/api/user/chat'
import type {
  ChatConversationVO,
  ChatGroupCreateRequest,
  ChatMessageVO,
  ChatSendTextRequest,
  PageResult,
  UserChatConversationQueryRequest,
  UserChatMessageQueryRequest,
} from '@/api/types'

export const useUserChatStore = defineStore('userChat', () => {
  const conversations = ref<ChatConversationVO[]>([])
  const currentConversation = ref<ChatConversationVO | null>(null)
  const messages = ref<ChatMessageVO[]>([])
  const loading = ref(false)
  const sending = ref(false)

  const convTotal = ref(0)
  const convCurrent = ref(1)
  const convSize = ref(20)

  const msgTotal = ref(0)
  const msgCurrent = ref(1)
  const msgSize = ref(30)

  function assignConvs(data: PageResult<ChatConversationVO>): void {
    conversations.value = data.records
    convTotal.value = data.total
    convCurrent.value = data.current
    convSize.value = data.size
  }

  async function fetchConversations(params?: UserChatConversationQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await UserChatApi.getConversations(params)
      assignConvs(response.data.data)
    } finally {
      loading.value = false
    }
  }

  async function selectConversation(conversationId: number): Promise<void> {
    loading.value = true
    try {
      const response = await UserChatApi.getConversationById(conversationId)
      currentConversation.value = response.data.data
      await fetchMessages(conversationId, { current: 1, size: msgSize.value })
    } finally {
      loading.value = false
    }
  }

  async function fetchMessages(
    conversationId: number,
    params?: UserChatMessageQueryRequest,
  ): Promise<void> {
    try {
      const response = await UserChatApi.getMessages(conversationId, params)
      const data = response.data.data
      messages.value = data.records.reverse()
      msgTotal.value = data.total
      msgCurrent.value = data.current
    } catch {
      messages.value = []
    }
  }

  async function sendText(data: ChatSendTextRequest): Promise<ChatMessageVO | null> {
    sending.value = true
    try {
      const response = await UserChatApi.sendTextMessage(data)
      const msg = response.data.data
      messages.value.push(msg)
      // 更新会话最后消息
      if (currentConversation.value) {
        currentConversation.value.lastMessage = msg
      }
      return msg
    } catch {
      return null
    } finally {
      sending.value = false
    }
  }

  async function revokeMessage(messageId: number): Promise<boolean> {
    try {
      await UserChatApi.revokeMessage(messageId)
      const msg = messages.value.find((m) => m.id === messageId)
      if (msg) msg.revoked = true
      return true
    } catch {
      return false
    }
  }

  async function deleteMessage(messageId: number): Promise<boolean> {
    try {
      await UserChatApi.deleteMessage(messageId)
      messages.value = messages.value.filter((m) => m.id !== messageId)
      return true
    } catch {
      return false
    }
  }

  async function createGroup(data: ChatGroupCreateRequest): Promise<ChatConversationVO | null> {
    try {
      const response = await UserChatApi.createGroup(data)
      const conv = response.data.data
      conversations.value.unshift(conv)
      return conv
    } catch {
      return null
    }
  }

  function clearState(): void {
    conversations.value = []
    currentConversation.value = null
    messages.value = []
    convTotal.value = 0
    convCurrent.value = 1
    msgTotal.value = 0
    msgCurrent.value = 1
  }

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    sending,
    convTotal,
    convCurrent,
    convSize,
    msgTotal,
    msgCurrent,
    msgSize,
    fetchConversations,
    selectConversation,
    fetchMessages,
    sendText,
    revokeMessage,
    deleteMessage,
    createGroup,
    clearState,
  }
})
