/**
 * 聊天管理模块 API
 * 基于 auth-api.md 文档
 */

import { http } from '../request'
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
} from '../types'

/**
 * 系统聊天管理 API
 * 提供会话、消息、成员的查询和管理操作
 */
export class SysChatApi {
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
      `/sys/chats/conversations/${conversationId}/members`
    )
  }

  /**
   * 分页查询会话消息列表
   * GET /api/sys/chats/conversations/{conversationId}/messages
   */
  static getMessages(conversationId: number, params?: SysChatMessageQueryRequest) {
    return http.get<PageResult<ChatMessageVO>>(
      `/sys/chats/conversations/${conversationId}/messages`,
      params
    )
  }

  /**
   * 查询消息详情
   * GET /api/sys/chats/conversations/{conversationId}/messages/{messageId}
   */
  static getMessageById(conversationId: number, messageId: number) {
    return http.get<ChatMessageVO>(
      `/sys/chats/conversations/${conversationId}/messages/${messageId}`
    )
  }

  /**
   * 分页查询消息回执列表
   * GET /api/sys/chats/conversations/{conversationId}/messages/{messageId}/receipts
   */
  static getMessageReceipts(
    conversationId: number,
    messageId: number,
    params?: SysChatReceiptQueryRequest
  ) {
    return http.get<PageResult<SysChatReceiptVO>>(
      `/sys/chats/conversations/${conversationId}/messages/${messageId}/receipts`,
      params
    )
  }

  /**
   * 更新成员角色
   * PUT /api/sys/chats/conversations/{conversationId}/members/{memberUserId}/role
   */
  static updateMemberRole(
    conversationId: number,
    memberUserId: number,
    data: SysChatMemberRoleUpdateRequest
  ) {
    return http.put<void>(
      `/sys/chats/conversations/${conversationId}/members/${memberUserId}/role`,
      data
    )
  }

  /**
   * 更新成员状态
   * PUT /api/sys/chats/conversations/{conversationId}/members/{memberUserId}/status
   */
  static updateMemberStatus(
    conversationId: number,
    memberUserId: number,
    data: SysChatMemberStatusUpdateRequest
  ) {
    return http.put<void>(
      `/sys/chats/conversations/${conversationId}/members/${memberUserId}/status`,
      data
    )
  }

  /**
   * 更新成员禁言状态
   * PUT /api/sys/chats/conversations/{conversationId}/members/{memberUserId}/mute
   */
  static updateMemberMute(
    conversationId: number,
    memberUserId: number,
    data: ChatGroupMuteRequest
  ) {
    return http.put<void>(
      `/sys/chats/conversations/${conversationId}/members/${memberUserId}/mute`,
      data
    )
  }

  /**
   * 撤回消息
   * POST /api/sys/chats/conversations/{conversationId}/messages/{messageId}/revoke
   */
  static revokeMessage(conversationId: number, messageId: number) {
    return http.post<void>(
      `/sys/chats/conversations/${conversationId}/messages/${messageId}/revoke`
    )
  }

  /**
   * 更新会话状态
   * PUT /api/sys/chats/conversations/{conversationId}/status
   */
  static updateConversationStatus(
    conversationId: number,
    data: SysChatConversationStatusUpdateRequest
  ) {
    return http.put<void>(`/sys/chats/conversations/${conversationId}/status`, data)
  }
}

export default SysChatApi
