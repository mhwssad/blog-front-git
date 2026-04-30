/**
 * 聊天管理模块 API
 * 基于 chat-api.md 文档
 */

import { http } from '../request'
import type {
  ChatConversationVO,
  ChatGroupMemberVO,
  ChatGroupMuteRequest,
  ChatLobbyPinnedMessageVO,
  ChatLobbySettingsUpdateRequest,
  ChatMessageVO,
  PageResult,
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

/**
 * 系统聊天管理 API
 * 提供会话、消息、成员的查询和管理操作
 */
export class SysChatApi {
  // ==================== 会话管理 ====================

  /**
   * 分页查询会话列表
   * GET /api/sys/chats/conversations
   */
  static getConversations(params?: SysChatConversationQueryRequest) {
    return http.get<PageResult<ChatConversationVO>>('/sys/chats/conversations', params)
  }

  /**
   * 查询会话详情
   * GET /api/sys/chats/conversations/{conversationId}
   */
  static getConversationById(conversationId: number) {
    return http.get<ChatConversationVO>(`/sys/chats/conversations/${conversationId}`)
  }

  /**
   * 查询会话成员列表
   * GET /api/sys/chats/conversations/{conversationId}/members
   */
  static getConversationMembers(conversationId: number) {
    return http.get<ChatGroupMemberVO[]>(
      `/sys/chats/conversations/${conversationId}/members`,
    )
  }

  // ==================== 消息管理 ====================

  /**
   * 分页查询会话消息列表
   * GET /api/sys/chats/conversations/{conversationId}/messages
   */
  static getMessages(conversationId: number, params?: SysChatMessageQueryRequest) {
    return http.get<PageResult<ChatMessageVO>>(
      `/sys/chats/conversations/${conversationId}/messages`,
      params,
    )
  }

  /**
   * 查询消息详情
   * GET /api/sys/chats/conversations/{conversationId}/messages/{messageId}
   */
  static getMessageById(conversationId: number, messageId: number) {
    return http.get<ChatMessageVO>(
      `/sys/chats/conversations/${conversationId}/messages/${messageId}`,
    )
  }

  /**
   * 分页查询消息回执列表
   * GET /api/sys/chats/conversations/{conversationId}/messages/{messageId}/receipts
   */
  static getMessageReceipts(
    conversationId: number,
    messageId: number,
    params?: SysChatReceiptQueryRequest,
  ) {
    return http.get<PageResult<SysChatReceiptVO>>(
      `/sys/chats/conversations/${conversationId}/messages/${messageId}/receipts`,
      params,
    )
  }

  /**
   * 撤回消息
   * POST /api/sys/chats/conversations/{conversationId}/messages/{messageId}/revoke
   */
  static revokeMessage(conversationId: number, messageId: number) {
    return http.post<void>(
      `/sys/chats/conversations/${conversationId}/messages/${messageId}/revoke`,
    )
  }

  // ==================== 成员管理 ====================

  /**
   * 更新成员角色
   * PUT /api/sys/chats/conversations/{conversationId}/members/{memberUserId}/role
   */
  static updateMemberRole(
    conversationId: number,
    memberUserId: number,
    data: SysChatMemberRoleUpdateRequest,
  ) {
    return http.put<void>(
      `/sys/chats/conversations/${conversationId}/members/${memberUserId}/role`,
      data,
    )
  }

  /**
   * 更新成员状态
   * PUT /api/sys/chats/conversations/{conversationId}/members/{memberUserId}/status
   */
  static updateMemberStatus(
    conversationId: number,
    memberUserId: number,
    data: SysChatMemberStatusUpdateRequest,
  ) {
    return http.put<void>(
      `/sys/chats/conversations/${conversationId}/members/${memberUserId}/status`,
      data,
    )
  }

  /**
   * 更新成员禁言状态
   * PUT /api/sys/chats/conversations/{conversationId}/members/{memberUserId}/mute
   */
  static updateMemberMute(
    conversationId: number,
    memberUserId: number,
    data: ChatGroupMuteRequest,
  ) {
    return http.put<void>(
      `/sys/chats/conversations/${conversationId}/members/${memberUserId}/mute`,
      data,
    )
  }

  // ==================== 会话状态 ====================

  /**
   * 更新会话状态
   * PUT /api/sys/chats/conversations/{conversationId}/status
   */
  static updateConversationStatus(
    conversationId: number,
    data: SysChatConversationStatusUpdateRequest,
  ) {
    return http.put<void>(`/sys/chats/conversations/${conversationId}/status`, data)
  }

  // ==================== 大厅频道管理 ====================

  /**
   * 更新大厅频道设置
   * PUT /api/sys/chats/lobby/settings
   */
  static updateLobbySettings(data: ChatLobbySettingsUpdateRequest) {
    return http.put<void>('/sys/chats/lobby/settings', data)
  }

  /**
   * 置顶大厅消息
   * POST /api/sys/chats/lobby/messages/{messageId}/pin
   */
  static pinLobbyMessage(messageId: number) {
    return http.post<void>(`/sys/chats/lobby/messages/${messageId}/pin`)
  }

  /**
   * 取消置顶大厅消息
   * DELETE /api/sys/chats/lobby/messages/{messageId}/pin
   */
  static unpinLobbyMessage(messageId: number) {
    return http.delete<void>(`/sys/chats/lobby/messages/${messageId}/pin`)
  }

  /**
   * 分页查询大厅置顶消息
   * GET /api/sys/chats/lobby/messages/pinned
   */
  static getPinnedLobbyMessages(params?: { current?: number; size?: number }) {
    return http.get<PageResult<ChatLobbyPinnedMessageVO>>(
      '/sys/chats/lobby/messages/pinned',
      params,
    )
  }

  /**
   * 禁言大厅用户
   * PUT /api/sys/chats/lobby/members/{memberUserId}/mute
   */
  static muteLobbyMember(memberUserId: number, data: ChatGroupMuteRequest) {
    return http.put<void>(`/sys/chats/lobby/members/${memberUserId}/mute`, data)
  }

  /**
   * 踢出大厅用户
   * PUT /api/sys/chats/lobby/members/{memberUserId}/kick
   */
  static kickLobbyMember(memberUserId: number) {
    return http.put<void>(`/sys/chats/lobby/members/${memberUserId}/kick`)
  }

  // ==================== 主题频道管理 ====================

  /**
   * 创建主题频道
   * POST /api/sys/chats/topic-channels
   */
  static createTopicChannel(data: SysTopicChannelSaveRequest) {
    return http.post<void>('/sys/chats/topic-channels', data)
  }

  /**
   * 编辑主题频道
   * PUT /api/sys/chats/topic-channels/{conversationId}
   */
  static updateTopicChannel(conversationId: number, data: SysTopicChannelSaveRequest) {
    return http.put<void>(`/sys/chats/topic-channels/${conversationId}`, data)
  }

  // ==================== 频道创建申请 ====================

  /**
   * 分页查询频道申请
   * GET /api/sys/chats/channel-applications
   */
  static getChannelApplications(params?: SysChannelApplicationQueryRequest) {
    return http.get<PageResult<SysChannelApplicationVO>>(
      '/sys/chats/channel-applications',
      params,
    )
  }

  /**
   * 查询频道申请详情
   * GET /api/sys/chats/channel-applications/{id}
   */
  static getChannelApplicationById(id: number) {
    return http.get<SysChannelApplicationVO>(`/sys/chats/channel-applications/${id}`)
  }

  /**
   * 审核频道申请
   * PUT /api/sys/chats/channel-applications/{id}/review
   */
  static reviewChannelApplication(id: number, data: SysChannelApplicationReviewRequest) {
    return http.put<void>(`/sys/chats/channel-applications/${id}/review`, data)
  }
}

export default SysChatApi
