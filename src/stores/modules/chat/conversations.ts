/**
 * 聊天会话子模块
 * @description 管理：会话列表、会话详情、群成员
 */

import { ref } from 'vue'
import { SysChatApi } from '@/api/sys/chat'
import type {
  ChatConversationVO,
  ChatGroupMemberVO,
  SysChatConversationQueryRequest,
  SysChatConversationStatusUpdateRequest,
  SysChatMemberRoleUpdateRequest,
  SysChatMemberStatusUpdateRequest,
  ChatGroupMuteRequest,
} from '@/types/api-types'

export function useChatConversations() {
  const conversations = ref<ChatConversationVO[]>([])
  const conversationTotal = ref(0)
  const conversationDetail = ref<ChatConversationVO | null>(null)
  const conversationLoading = ref(false)
  const detailLoading = ref(false)
  const members = ref<ChatGroupMemberVO[]>([])
  const memberLoading = ref(false)

  async function fetchConversations(params?: SysChatConversationQueryRequest): Promise<void> {
    conversationLoading.value = true
    try {
      const response = await SysChatApi.getConversations(params)
      const data = response.data.data
      conversations.value = data.records
      conversationTotal.value = data.total
    } finally {
      conversationLoading.value = false
    }
  }

  async function fetchConversationDetail(conversationId: number): Promise<ChatConversationVO | null> {
    detailLoading.value = true
    try {
      const response = await SysChatApi.getConversationById(conversationId)
      conversationDetail.value = response.data.data
      return conversationDetail.value
    } finally {
      detailLoading.value = false
    }
  }

  async function fetchConversationMembers(conversationId: number): Promise<void> {
    memberLoading.value = true
    try {
      const response = await SysChatApi.getConversationMembers(conversationId)
      members.value = response.data.data ?? []
    } finally {
      memberLoading.value = false
    }
  }

  async function updateConversationStatus(
    conversationId: number,
    payload: SysChatConversationStatusUpdateRequest,
  ): Promise<boolean> {
    try {
      await SysChatApi.updateConversationStatus(conversationId, payload)
      return true
    } catch {
      return false
    }
  }

  async function updateMemberRole(
    conversationId: number,
    memberUserId: number,
    payload: SysChatMemberRoleUpdateRequest,
  ): Promise<boolean> {
    try {
      await SysChatApi.updateMemberRole(conversationId, memberUserId, payload)
      return true
    } catch {
      return false
    }
  }

  async function updateMemberStatus(
    conversationId: number,
    memberUserId: number,
    payload: SysChatMemberStatusUpdateRequest,
  ): Promise<boolean> {
    try {
      await SysChatApi.updateMemberStatus(conversationId, memberUserId, payload)
      return true
    } catch {
      return false
    }
  }

  async function updateMemberMute(
    conversationId: number,
    memberUserId: number,
    payload: ChatGroupMuteRequest,
  ): Promise<boolean> {
    try {
      await SysChatApi.updateMemberMute(conversationId, memberUserId, payload)
      return true
    } catch {
      return false
    }
  }

  return {
    conversations,
    conversationTotal,
    conversationDetail,
    conversationLoading,
    detailLoading,
    members,
    memberLoading,
    fetchConversations,
    fetchConversationDetail,
    fetchConversationMembers,
    updateConversationStatus,
    updateMemberRole,
    updateMemberStatus,
    updateMemberMute,
  }
}
