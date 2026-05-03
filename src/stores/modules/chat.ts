/**
 * 聊天管理 Store（后台管理端）
 * 基于 chat-api.md 文档
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { SysChatApi } from '@/api/sys/chat'
import type {
  ChatConversationVO,
  ChatGroupMemberVO,
  ChatGroupMuteRequest,
  ChatLobbyPinnedMessageVO,
  ChatLobbySettingsUpdateRequest,
  ChatMessageVO,
  GroupJoinApplicationReviewRequest,
  GroupJoinApplicationVO,
  SysChannelApplicationQueryRequest,
  SysChannelApplicationReviewRequest,
  SysChannelApplicationVO,
  SysChatConversationQueryRequest,
  SysChatConversationStatusUpdateRequest,
  SysChatMemberRoleUpdateRequest,
  SysChatMemberStatusUpdateRequest,
  SysChatMessageQueryRequest,
  SysChatReceiptQueryRequest,
  SysChatReceiptVO,
  SysTopicChannelSaveRequest,
} from '@/types/api-types'

export const useChatStore = defineStore('admin-chat', () => {
  // ==================== 状态 ====================

  /**
   * 会话列表
   */
  const conversations = ref<ChatConversationVO[]>([])

  /**
   * 会话总数
   */
  const conversationTotal = ref(0)

  /**
   * 当前查看的会话详情
   */
  const conversationDetail = ref<ChatConversationVO | null>(null)

  /**
   * 群成员列表
   */
  const members = ref<ChatGroupMemberVO[]>([])

  /**
   * 消息列表
   */
  const messages = ref<ChatMessageVO[]>([])

  /**
   * 消息总数
   */
  const messageTotal = ref(0)

  /**
   * 当前查看的消息详情
   */
  const messageDetail = ref<ChatMessageVO | null>(null)

  /**
   * 消息回执列表
   */
  const receipts = ref<SysChatReceiptVO[]>([])

  /**
   * 回执总数
   */
  const receiptTotal = ref(0)

  /**
   * 会话列表加载状态
   */
  const conversationLoading = ref(false)

  /**
   * 详情加载状态
   */
  const detailLoading = ref(false)

  /**
   * 成员加载状态
   */
  const memberLoading = ref(false)

  /**
   * 消息加载状态
   */
  const messageLoading = ref(false)

  /**
   * 回执加载状态
   */
  const receiptLoading = ref(false)

  const pinnedMessages = ref<ChatLobbyPinnedMessageVO[]>([])
  const pinnedTotal = ref(0)
  const pinnedLoading = ref(false)

  const channelApplications = ref<SysChannelApplicationVO[]>([])
  const channelAppTotal = ref(0)
  const channelAppDetail = ref<SysChannelApplicationVO | null>(null)
  const channelAppLoading = ref(false)

  const groupJoinApplications = ref<GroupJoinApplicationVO[]>([])
  const groupJoinAppTotal = ref(0)
  const groupJoinAppLoading = ref(false)

  // ==================== 操作 ====================

  /**
   * 分页查询会话列表
   */
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

  /**
   * 查询会话详情
   */
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

  /**
   * 查询群成员列表
   */
  async function fetchConversationMembers(conversationId: number): Promise<void> {
    memberLoading.value = true
    try {
      const response = await SysChatApi.getConversationMembers(conversationId)
      members.value = response.data.data ?? []
    } finally {
      memberLoading.value = false
    }
  }

  /**
   * 分页查询消息历史
   */
  async function fetchMessages(
    conversationId: number,
    params?: SysChatMessageQueryRequest
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

  /**
   * 查询消息详情
   */
  async function fetchMessageDetail(
    conversationId: number,
    messageId: number
  ): Promise<ChatMessageVO | null> {
    detailLoading.value = true
    try {
      const response = await SysChatApi.getMessageById(conversationId, messageId)
      messageDetail.value = response.data.data
      return messageDetail.value
    } finally {
      detailLoading.value = false
    }
  }

  /**
   * 查询消息回执
   */
  async function fetchReceipts(
    conversationId: number,
    messageId: number,
    params?: SysChatReceiptQueryRequest
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

  /**
   * 更新成员角色（设为管理员/取消管理员）
   */
  async function updateMemberRole(
    conversationId: number,
    memberUserId: number,
    payload: SysChatMemberRoleUpdateRequest
  ): Promise<boolean> {
    try {
      await SysChatApi.updateMemberRole(conversationId, memberUserId, payload)
      return true
    } catch {
      return false
    }
  }

  /**
   * 更新成员状态（禁言/取消禁言）
   */
  async function updateMemberStatus(
    conversationId: number,
    memberUserId: number,
    payload: SysChatMemberStatusUpdateRequest
  ): Promise<boolean> {
    try {
      await SysChatApi.updateMemberStatus(conversationId, memberUserId, payload)
      return true
    } catch {
      return false
    }
  }

  /**
   * 设置成员禁言时间
   */
  async function updateMemberMute(
    conversationId: number,
    memberUserId: number,
    payload: ChatGroupMuteRequest
  ): Promise<boolean> {
    try {
      await SysChatApi.updateMemberMute(conversationId, memberUserId, payload)
      return true
    } catch {
      return false
    }
  }

  /**
   * 撤回消息
   */
  async function revokeMessage(conversationId: number, messageId: number): Promise<boolean> {
    try {
      await SysChatApi.revokeMessage(conversationId, messageId)
      return true
    } catch {
      return false
    }
  }

  /**
   * 更新会话状态
   */
  async function updateConversationStatus(
    conversationId: number,
    payload: SysChatConversationStatusUpdateRequest
  ): Promise<boolean> {
    try {
      await SysChatApi.updateConversationStatus(conversationId, payload)
      return true
    } catch {
      return false
    }
  }

  /**
   * 清空会话上下文
   */
  function clearConversationContext(): void {
    conversationDetail.value = null
    members.value = []
    messages.value = []
    messageDetail.value = null
    receipts.value = []
    messageTotal.value = 0
    receiptTotal.value = 0
    pinnedMessages.value = []
    pinnedTotal.value = 0
    channelApplications.value = []
    channelAppTotal.value = 0
    channelAppDetail.value = null
    groupJoinApplications.value = []
    groupJoinAppTotal.value = 0
  }

  // ==================== 大厅频道管理 ====================

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

  // ==================== 主题频道管理 ====================

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

  // ==================== 频道创建申请 ====================

  async function fetchChannelApplications(
    params?: SysChannelApplicationQueryRequest,
  ): Promise<void> {
    channelAppLoading.value = true
    try {
      const response = await SysChatApi.getChannelApplications(params)
      const data = response.data.data
      channelApplications.value = data.records
      channelAppTotal.value = data.total
    } finally {
      channelAppLoading.value = false
    }
  }

  async function fetchChannelApplicationById(
    id: number,
  ): Promise<SysChannelApplicationVO | null> {
    try {
      const response = await SysChatApi.getChannelApplicationById(id)
      channelAppDetail.value = response.data.data
      return channelAppDetail.value
    } catch {
      return null
    }
  }

  async function reviewChannelApplication(
    id: number,
    data: SysChannelApplicationReviewRequest,
  ): Promise<boolean> {
    try {
      await SysChatApi.reviewChannelApplication(id, data)
      return true
    } catch {
      return false
    }
  }

  // ==================== 入群申请管理 ====================

  async function fetchGroupJoinApplications(params?: {
    conversationId?: number
    applyStatus?: number
    keyword?: string
    current?: number
    size?: number
  }): Promise<void> {
    groupJoinAppLoading.value = true
    try {
      const response = await SysChatApi.getGroupJoinApplications(params)
      const data = response.data.data
      groupJoinApplications.value = data.records
      groupJoinAppTotal.value = data.total
    } finally {
      groupJoinAppLoading.value = false
    }
  }

  async function reviewGroupJoinApplication(
    applicationId: number,
    data: GroupJoinApplicationReviewRequest,
  ): Promise<boolean> {
    try {
      await SysChatApi.reviewGroupJoinApplication(applicationId, data)
      return true
    } catch {
      return false
    }
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
    pinnedMessages,
    pinnedTotal,
    pinnedLoading,
    channelApplications,
    channelAppTotal,
    channelAppDetail,
    channelAppLoading,
    groupJoinApplications,
    groupJoinAppTotal,
    groupJoinAppLoading,

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
    updateLobbySettings,
    pinLobbyMessage,
    unpinLobbyMessage,
    fetchPinnedLobbyMessages,
    muteLobbyMember,
    kickLobbyMember,
    createTopicChannel,
    updateTopicChannel,
    fetchChannelApplications,
    fetchChannelApplicationById,
    reviewChannelApplication,
    fetchGroupJoinApplications,
    reviewGroupJoinApplication,
  }
})
