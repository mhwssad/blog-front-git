import { ref } from 'vue'
import { defineStore } from 'pinia'
import { sysChatApi } from '@/api/sys/chat'
import type {
  ChatConversationVO,
  ChatGroupMemberVO,
  ChatGroupMuteRequest,
  ChatMessageVO,
  PageResult,
  SysChatConversationQueryRequest,
  SysChatConversationStatusUpdateRequest,
  SysChatMemberRoleUpdateRequest,
  SysChatMemberStatusUpdateRequest,
  SysChatMessageQueryRequest,
  SysChatReceiptQueryRequest,
  SysChatReceiptVO,
} from '@/api/types'

export const useChatStore = defineStore('admin-chat', () => {
  const conversations = ref<ChatConversationVO[]>([])
  const conversationTotal = ref(0)
  const conversationDetail = ref<ChatConversationVO | null>(null)
  const members = ref<ChatGroupMemberVO[]>([])
  const messages = ref<ChatMessageVO[]>([])
  const messageTotal = ref(0)
  const messageDetail = ref<ChatMessageVO | null>(null)
  const receipts = ref<SysChatReceiptVO[]>([])
  const receiptTotal = ref(0)
  const conversationLoading = ref(false)
  const detailLoading = ref(false)
  const memberLoading = ref(false)
  const messageLoading = ref(false)
  const receiptLoading = ref(false)

  async function fetchConversations(params?: SysChatConversationQueryRequest): Promise<void> {
    conversationLoading.value = true
    try {
      const response = await sysChatApi.getConversations(params)
      const data = response.data.data as PageResult<ChatConversationVO>

      conversations.value = data.records
      conversationTotal.value = data.total
    } finally {
      conversationLoading.value = false
    }
  }

  async function fetchConversationDetail(conversationId: number): Promise<ChatConversationVO | null> {
    detailLoading.value = true
    try {
      const response = await sysChatApi.getConversationById(conversationId)
      conversationDetail.value = response.data.data
      return conversationDetail.value
    } finally {
      detailLoading.value = false
    }
  }

  async function fetchConversationMembers(conversationId: number): Promise<void> {
    memberLoading.value = true
    try {
      const response = await sysChatApi.getConversationMembers(conversationId)
      members.value = response.data.data ?? []
    } finally {
      memberLoading.value = false
    }
  }

  async function fetchMessages(
    conversationId: number,
    params?: SysChatMessageQueryRequest
  ): Promise<void> {
    messageLoading.value = true
    try {
      const response = await sysChatApi.getMessages(conversationId, params)
      const data = response.data.data as PageResult<ChatMessageVO>

      messages.value = data.records
      messageTotal.value = data.total
    } finally {
      messageLoading.value = false
    }
  }

  async function fetchMessageDetail(
    conversationId: number,
    messageId: number
  ): Promise<ChatMessageVO | null> {
    detailLoading.value = true
    try {
      const response = await sysChatApi.getMessageById(conversationId, messageId)
      messageDetail.value = response.data.data
      return messageDetail.value
    } finally {
      detailLoading.value = false
    }
  }

  async function fetchReceipts(
    conversationId: number,
    messageId: number,
    params?: SysChatReceiptQueryRequest
  ): Promise<void> {
    receiptLoading.value = true
    try {
      const response = await sysChatApi.getMessageReceipts(conversationId, messageId, params)
      const data = response.data.data as PageResult<SysChatReceiptVO>

      receipts.value = data.records
      receiptTotal.value = data.total
    } finally {
      receiptLoading.value = false
    }
  }

  async function updateMemberRole(
    conversationId: number,
    memberUserId: number,
    payload: SysChatMemberRoleUpdateRequest
  ): Promise<boolean> {
    try {
      await sysChatApi.updateMemberRole(conversationId, memberUserId, payload)
      return true
    } catch {
      return false
    }
  }

  async function updateMemberStatus(
    conversationId: number,
    memberUserId: number,
    payload: SysChatMemberStatusUpdateRequest
  ): Promise<boolean> {
    try {
      await sysChatApi.updateMemberStatus(conversationId, memberUserId, payload)
      return true
    } catch {
      return false
    }
  }

  async function updateMemberMute(
    conversationId: number,
    memberUserId: number,
    payload: ChatGroupMuteRequest
  ): Promise<boolean> {
    try {
      await sysChatApi.updateMemberMute(conversationId, memberUserId, payload)
      return true
    } catch {
      return false
    }
  }

  async function revokeMessage(conversationId: number, messageId: number): Promise<boolean> {
    try {
      await sysChatApi.revokeMessage(conversationId, messageId)
      return true
    } catch {
      return false
    }
  }

  async function updateConversationStatus(
    conversationId: number,
    payload: SysChatConversationStatusUpdateRequest
  ): Promise<boolean> {
    try {
      await sysChatApi.updateConversationStatus(conversationId, payload)
      return true
    } catch {
      return false
    }
  }

  function clearConversationContext(): void {
    conversationDetail.value = null
    members.value = []
    messages.value = []
    messageDetail.value = null
    receipts.value = []
    messageTotal.value = 0
    receiptTotal.value = 0
  }

  return {
    conversations,
    conversationTotal,
    conversationDetail,
    members,
    messages,
    messageTotal,
    messageDetail,
    receipts,
    receiptTotal,
    conversationLoading,
    detailLoading,
    memberLoading,
    messageLoading,
    receiptLoading,
    fetchConversations,
    fetchConversationDetail,
    fetchConversationMembers,
    fetchMessages,
    fetchMessageDetail,
    fetchReceipts,
    updateMemberRole,
    updateMemberStatus,
    updateMemberMute,
    revokeMessage,
    updateConversationStatus,
    clearConversationContext,
  }
})
