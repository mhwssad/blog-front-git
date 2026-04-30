/**
 * 用户聊天 Store
 * 基于 chat-api.md 文档
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { UserChatApi } from '@/api/user/chat'
import type {
  ChannelApplicationRequest,
  ChannelApplicationVO,
  ChatConversationVO,
  ChatGroupCreateRequest,
  ChatGroupSearchRequest,
  ChatGroupSearchVO,
  ChatMessageEditRequest,
  ChatMessageVO,
  ChatSendFileRequest,
  ChatSendTextRequest,
  ForumLinkRequest,
  ForumLinkVO,
  GroupInviteLinkCreateRequest,
  GroupInviteLinkVO,
  GroupJoinApplicationRequest,
  GroupJoinApplicationReviewRequest,
  GroupJoinApplicationVO,
  PageResult,
  UserChatConversationQueryRequest,
  UserChatMessageQueryRequest,
} from '@/types/api-types'

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

  const searchResults = ref<ChatGroupSearchVO[]>([])
  const searchTotal = ref(0)
  const searchLoading = ref(false)

  const channelApplications = ref<ChannelApplicationVO[]>([])
  const channelAppTotal = ref(0)
  const latestChannelApp = ref<ChannelApplicationVO | null>(null)
  const channelAppLoading = ref(false)

  const forumLinks = ref<ForumLinkVO[]>([])
  const forumLinkTotal = ref(0)
  const forumLinkLoading = ref(false)

  const joinApplications = ref<GroupJoinApplicationVO[]>([])
  const joinAppTotal = ref(0)
  const joinAppLoading = ref(false)

  const inviteLinks = ref<GroupInviteLinkVO[]>([])
  const inviteLinkTotal = ref(0)
  const inviteLinkLoading = ref(false)

  function assignConvs(data: PageResult<ChatConversationVO>): void {
    conversations.value = data.records
    convTotal.value = data.total
    convCurrent.value = data.current
    convSize.value = data.size
  }

  // ==================== 会话管理 ====================

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

  async function createSingleConversation(
    data: Parameters<typeof UserChatApi.createSingleConversation>[0],
  ): Promise<ChatConversationVO | null> {
    try {
      const response = await UserChatApi.createSingleConversation(data)
      const conv = response.data.data
      conversations.value.unshift(conv)
      return conv
    } catch {
      return null
    }
  }

  async function joinConversation(conversationId: number): Promise<boolean> {
    try {
      await UserChatApi.joinConversation(conversationId)
      return true
    } catch {
      return false
    }
  }

  async function leaveConversation(conversationId: number): Promise<boolean> {
    try {
      await UserChatApi.leaveConversation(conversationId)
      return true
    } catch {
      return false
    }
  }

  // ==================== 消息 ====================

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

  async function sendFileMessage(data: ChatSendFileRequest): Promise<ChatMessageVO | null> {
    sending.value = true
    try {
      const response = await UserChatApi.sendFileMessage(data)
      const msg = response.data.data
      messages.value.push(msg)
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

  async function updateMessage(
    messageId: number,
    data: ChatMessageEditRequest,
  ): Promise<boolean> {
    try {
      const response = await UserChatApi.updateMessage(messageId, data)
      const updated = response.data.data
      const idx = messages.value.findIndex((m) => m.id === messageId)
      if (idx !== -1) messages.value[idx] = updated
      return true
    } catch {
      return false
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

  // ==================== 群组管理 ====================

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

  async function searchGroups(params?: ChatGroupSearchRequest): Promise<void> {
    searchLoading.value = true
    try {
      const response = await UserChatApi.searchGroups(params)
      const data = response.data.data
      searchResults.value = data.records
      searchTotal.value = data.total
    } finally {
      searchLoading.value = false
    }
  }

  // ==================== 频道创建申请 ====================

  async function submitChannelApplication(data: ChannelApplicationRequest): Promise<boolean> {
    channelAppLoading.value = true
    try {
      await UserChatApi.submitChannelApplication(data)
      return true
    } catch {
      return false
    } finally {
      channelAppLoading.value = false
    }
  }

  async function fetchLatestChannelApplication(): Promise<ChannelApplicationVO | null> {
    try {
      const response = await UserChatApi.getLatestChannelApplication()
      latestChannelApp.value = response.data.data
      return latestChannelApp.value
    } catch {
      return null
    }
  }

  async function fetchChannelApplications(params?: {
    current?: number
    size?: number
  }): Promise<void> {
    channelAppLoading.value = true
    try {
      const response = await UserChatApi.getChannelApplications(params)
      const data = response.data.data
      channelApplications.value = data.records
      channelAppTotal.value = data.total
    } finally {
      channelAppLoading.value = false
    }
  }

  // ==================== 帖子频道挂接 ====================

  async function createForumLink(data: ForumLinkRequest): Promise<boolean> {
    forumLinkLoading.value = true
    try {
      await UserChatApi.createForumLink(data)
      return true
    } catch {
      return false
    } finally {
      forumLinkLoading.value = false
    }
  }

  async function fetchForumLinksByPost(forumPostId: number): Promise<void> {
    forumLinkLoading.value = true
    try {
      const response = await UserChatApi.getForumLinksByPost(forumPostId)
      forumLinks.value = response.data.data
    } finally {
      forumLinkLoading.value = false
    }
  }

  async function fetchForumLinksByChannel(
    conversationId: number,
    params?: { current?: number; size?: number },
  ): Promise<void> {
    forumLinkLoading.value = true
    try {
      const response = await UserChatApi.getForumLinksByChannel(conversationId, params)
      const data = response.data.data
      forumLinks.value = data.records
      forumLinkTotal.value = data.total
    } finally {
      forumLinkLoading.value = false
    }
  }

  async function deleteForumLink(forumPostId: number): Promise<boolean> {
    try {
      await UserChatApi.deleteForumLink(forumPostId)
      return true
    } catch {
      return false
    }
  }

  // ==================== 入群申请 ====================

  async function submitJoinApplication(
    conversationId: number,
    data?: GroupJoinApplicationRequest,
  ): Promise<boolean> {
    joinAppLoading.value = true
    try {
      await UserChatApi.submitJoinApplication(conversationId, data)
      return true
    } catch {
      return false
    } finally {
      joinAppLoading.value = false
    }
  }

  async function fetchMyJoinApplications(params?: {
    current?: number
    size?: number
    applyStatus?: number
  }): Promise<void> {
    joinAppLoading.value = true
    try {
      const response = await UserChatApi.getMyJoinApplications(params)
      const data = response.data.data
      joinApplications.value = data.records
      joinAppTotal.value = data.total
    } finally {
      joinAppLoading.value = false
    }
  }

  async function fetchGroupJoinApplications(
    conversationId: number,
    params?: { current?: number; size?: number; applyStatus?: number },
  ): Promise<void> {
    joinAppLoading.value = true
    try {
      const response = await UserChatApi.getGroupJoinApplications(conversationId, params)
      const data = response.data.data
      joinApplications.value = data.records
      joinAppTotal.value = data.total
    } finally {
      joinAppLoading.value = false
    }
  }

  async function reviewJoinApplication(
    conversationId: number,
    applicationId: number,
    data: GroupJoinApplicationReviewRequest,
  ): Promise<boolean> {
    try {
      await UserChatApi.reviewJoinApplication(conversationId, applicationId, data)
      return true
    } catch {
      return false
    }
  }

  // ==================== 群邀请链接 ====================

  async function createInviteLink(
    conversationId: number,
    data?: GroupInviteLinkCreateRequest,
  ): Promise<GroupInviteLinkVO | null> {
    inviteLinkLoading.value = true
    try {
      const response = await UserChatApi.createInviteLink(conversationId, data)
      return response.data.data
    } catch {
      return null
    } finally {
      inviteLinkLoading.value = false
    }
  }

  async function fetchInviteLinks(
    conversationId: number,
    params?: { current?: number; size?: number; status?: number },
  ): Promise<void> {
    inviteLinkLoading.value = true
    try {
      const response = await UserChatApi.getInviteLinks(conversationId, params)
      const data = response.data.data
      inviteLinks.value = data.records
      inviteLinkTotal.value = data.total
    } finally {
      inviteLinkLoading.value = false
    }
  }

  async function disableInviteLink(
    conversationId: number,
    inviteLinkId: number,
  ): Promise<boolean> {
    try {
      await UserChatApi.disableInviteLink(conversationId, inviteLinkId)
      return true
    } catch {
      return false
    }
  }

  async function joinByInviteLink(inviteToken: string): Promise<boolean> {
    try {
      await UserChatApi.joinByInviteLink(inviteToken)
      return true
    } catch {
      return false
    }
  }

  // ==================== 清理 ====================

  function clearState(): void {
    conversations.value = []
    currentConversation.value = null
    messages.value = []
    convTotal.value = 0
    convCurrent.value = 1
    msgTotal.value = 0
    msgCurrent.value = 1
    searchResults.value = []
    searchTotal.value = 0
    channelApplications.value = []
    channelAppTotal.value = 0
    latestChannelApp.value = null
    forumLinks.value = []
    forumLinkTotal.value = 0
    joinApplications.value = []
    joinAppTotal.value = 0
    inviteLinks.value = []
    inviteLinkTotal.value = 0
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
    searchResults,
    searchTotal,
    searchLoading,
    channelApplications,
    channelAppTotal,
    latestChannelApp,
    channelAppLoading,
    forumLinks,
    forumLinkTotal,
    forumLinkLoading,
    joinApplications,
    joinAppTotal,
    joinAppLoading,
    inviteLinks,
    inviteLinkTotal,
    inviteLinkLoading,

    fetchConversations,
    selectConversation,
    createSingleConversation,
    joinConversation,
    leaveConversation,
    fetchMessages,
    sendText,
    sendFileMessage,
    updateMessage,
    revokeMessage,
    deleteMessage,
    createGroup,
    searchGroups,
    submitChannelApplication,
    fetchLatestChannelApplication,
    fetchChannelApplications,
    createForumLink,
    fetchForumLinksByPost,
    fetchForumLinksByChannel,
    deleteForumLink,
    submitJoinApplication,
    fetchMyJoinApplications,
    fetchGroupJoinApplications,
    reviewJoinApplication,
    createInviteLink,
    fetchInviteLinks,
    disableInviteLink,
    joinByInviteLink,
    clearState,
  }
})
