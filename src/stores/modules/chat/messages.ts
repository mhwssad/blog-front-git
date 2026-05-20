/**
 * 聊天消息子模块
 * @description 管理：消息列表、消息详情、消息回执、撤回
 */

import { ref } from 'vue'
import { SysChatApi } from '@/api/sys/chat'
import type {
  ChatMessageVO,
  SysChatMessageQueryRequest,
  SysChatReceiptVO,
  SysChatReceiptQueryRequest,
} from '@/types/api-types'

export function useChatMessages() {
  const messages = ref<ChatMessageVO[]>([])
  const messageTotal = ref(0)
  const messageDetail = ref<ChatMessageVO | null>(null)
  const messageLoading = ref(false)

  const receipts = ref<SysChatReceiptVO[]>([])
  const receiptTotal = ref(0)
  const receiptLoading = ref(false)

  async function fetchMessages(
    conversationId: number,
    params?: SysChatMessageQueryRequest,
  ): Promise<void> {
    messageLoading.value = true
    try {
      const response = await SysChatApi.getMessages(conversationId, params)
      const data = response.data.data
      messages.value = data.records
      messageTotal.value = data.total
    } finally {
      messageLoading.value = false
    }
  }

  async function fetchMessageDetail(
    conversationId: number,
    messageId: number,
  ): Promise<ChatMessageVO | null> {
    try {
      const response = await SysChatApi.getMessageById(conversationId, messageId)
      messageDetail.value = response.data.data
      return messageDetail.value
    } catch {
      return null
    }
  }

  async function fetchReceipts(
    conversationId: number,
    messageId: number,
    params?: SysChatReceiptQueryRequest,
  ): Promise<void> {
    receiptLoading.value = true
    try {
      const response = await SysChatApi.getMessageReceipts(conversationId, messageId, params)
      const data = response.data.data
      receipts.value = data.records
      receiptTotal.value = data.total
    } finally {
      receiptLoading.value = false
    }
  }

  async function revokeMessage(conversationId: number, messageId: number): Promise<boolean> {
    try {
      await SysChatApi.revokeMessage(conversationId, messageId)
      return true
    } catch {
      return false
    }
  }

  return {
    messages,
    messageTotal,
    messageDetail,
    messageLoading,
    receipts,
    receiptTotal,
    receiptLoading,
    fetchMessages,
    fetchMessageDetail,
    fetchReceipts,
    revokeMessage,
  }
}
