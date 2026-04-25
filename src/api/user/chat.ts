/**
 * 用户聊天 API
 * 基于 auth-api.md 文档 第8节
 */

import { http } from '../request'
import type {
  ChatConversationReadRequest,
  ChatConversationReadVO,
  ChatConversationVO,
  ChatGroupCreateRequest,
  ChatGroupMemberInviteRequest,
  ChatGroupMemberVO,
  ChatGroupMuteRequest,
  ChatGroupNoticeUpdateRequest,
  ChatGroupOwnerTransferRequest,
  ChatMessageEditRequest,
  ChatMessageVO,
  ChatSendFileRequest,
  ChatSendTextRequest,
  ChatSingleConversationCreateRequest,
  PageResult,
  UserChatConversationQueryRequest,
  UserChatMessageQueryRequest,
} from '../types'

/**
 * 用户聊天 API
 * 提供会话管理、消息发送、群组管理等功能
 */
export class UserChatApi {
  /**
   * 8.1 分页查询会话列表
   * GET /api/user/chat/conversations
   */
  static getConversations(params?: UserChatConversationQueryRequest) {
    return http.get<PageResult<ChatConversationVO>>('/user/chat/conversations', params)
  }

  /**
   * 8.2 获取会话详情
   * GET /api/user/chat/conversations/{conversationId}
   */
  static getConversationById(conversationId: number) {
    return http.get<ChatConversationVO>(`/user/chat/conversations/${conversationId}`)
  }

  /**
   * 8.3 创建单人会话
   * POST /api/user/chat/single-conversations
   */
  static createSingleConversation(data: ChatSingleConversationCreateRequest) {
    return http.post<ChatConversationVO>('/user/chat/single-conversations', data)
  }

  /**
   * 8.4 分页查询会话消息
   * GET /api/user/chat/conversations/{conversationId}/messages
   */
  static getMessages(conversationId: number, params?: UserChatMessageQueryRequest) {
    return http.get<PageResult<ChatMessageVO>>(
      `/user/chat/conversations/${conversationId}/messages`,
      params
    )
  }

  /**
   * 8.5 发送文本消息
   * POST /api/user/chat/messages/text
   */
  static sendTextMessage(data: ChatSendTextRequest) {
    return http.post<ChatMessageVO>('/user/chat/messages/text', data)
  }

  /**
   * 8.6 发送文件消息
   * POST /api/user/chat/messages/file
   */
  static sendFileMessage(data: ChatSendFileRequest) {
    return http.post<ChatMessageVO>('/user/chat/messages/file', data)
  }

  /**
   * 8.7 编辑消息
   * PUT /api/user/chat/messages/{messageId}
   */
  static updateMessage(messageId: number, data: ChatMessageEditRequest) {
    return http.put<ChatMessageVO>(`/user/chat/messages/${messageId}`, data)
  }

  /**
   * 8.8 撤回消息
   * POST /api/user/chat/messages/{messageId}/revoke
   */
  static revokeMessage(messageId: number) {
    return http.post<void>(`/user/chat/messages/${messageId}/revoke`)
  }

  /**
   * 8.9 删除消息
   * DELETE /api/user/chat/messages/{messageId}
   */
  static deleteMessage(messageId: number) {
    return http.delete<void>(`/user/chat/messages/${messageId}`)
  }

  /**
   * 8.10 标记会话已读
   * POST /api/user/chat/conversations/{conversationId}/read
   */
  static markConversationRead(conversationId: number, data: ChatConversationReadRequest) {
    return http.post<ChatConversationReadVO>(
      `/user/chat/conversations/${conversationId}/read`,
      data
    )
  }

  /**
   * 8.11 创建群组
   * POST /api/user/chat/groups
   */
  static createGroup(data: ChatGroupCreateRequest) {
    return http.post<ChatConversationVO>('/user/chat/groups', data)
  }

  /**
   * 8.12 获取群组详情
   * GET /api/user/chat/groups/{conversationId}
   */
  static getGroupById(conversationId: number) {
    return http.get<ChatConversationVO>(`/user/chat/groups/${conversationId}`)
  }

  /**
   * 8.13 获取群组成员列表
   * GET /api/user/chat/groups/{conversationId}/members
   */
  static getGroupMembers(conversationId: number) {
    return http.get<ChatGroupMemberVO[]>(`/user/chat/groups/${conversationId}/members`)
  }

  /**
   * 8.14 邀请群组成员
   * POST /api/user/chat/groups/{conversationId}/members
   */
  static inviteGroupMembers(conversationId: number, data: ChatGroupMemberInviteRequest) {
    return http.post<void>(`/user/chat/groups/${conversationId}/members`, data)
  }

  /**
   * 8.15 设置群组管理员
   * PUT /api/user/chat/groups/{conversationId}/admins/{memberUserId}
   */
  static setGroupAdmin(conversationId: number, memberUserId: number) {
    return http.put<void>(`/user/chat/groups/${conversationId}/admins/${memberUserId}`)
  }

  /**
   * 8.16 移除群组管理员
   * DELETE /api/user/chat/groups/{conversationId}/admins/{memberUserId}
   */
  static removeGroupAdmin(conversationId: number, memberUserId: number) {
    return http.delete<void>(`/user/chat/groups/${conversationId}/admins/${memberUserId}`)
  }

  /**
   * 8.17 转让群组所有权
   * PUT /api/user/chat/groups/{conversationId}/owner
   */
  static transferGroupOwner(conversationId: number, data: ChatGroupOwnerTransferRequest) {
    return http.put<void>(`/user/chat/groups/${conversationId}/owner`, data)
  }

  /**
   * 8.18 更新群组成员禁言状态
   * PUT /api/user/chat/groups/{conversationId}/members/{memberUserId}/mute
   */
  static updateGroupMemberMute(
    conversationId: number,
    memberUserId: number,
    data: ChatGroupMuteRequest
  ) {
    return http.put<void>(
      `/user/chat/groups/${conversationId}/members/${memberUserId}/mute`,
      data
    )
  }

  /**
   * 8.19 更新群组公告
   * PUT /api/user/chat/groups/{conversationId}/notice
   */
  static updateGroupNotice(conversationId: number, data: ChatGroupNoticeUpdateRequest) {
    return http.put<void>(`/user/chat/groups/${conversationId}/notice`, data)
  }

  /**
   * 8.20 移出群组成员
   * DELETE /api/user/chat/groups/{conversationId}/members/{memberUserId}
   */
  static removeGroupMember(conversationId: number, memberUserId: number) {
    return http.delete<void>(`/user/chat/groups/${conversationId}/members/${memberUserId}`)
  }

  /**
   * 8.21 退出群组
   * POST /api/user/chat/groups/{conversationId}/leave
   */
  static leaveGroup(conversationId: number) {
    return http.post<void>(`/user/chat/groups/${conversationId}/leave`)
  }

  /**
   * 8.22 解散群组
   * DELETE /api/user/chat/groups/{conversationId}
   */
  static dissolveGroup(conversationId: number) {
    return http.delete<void>(`/user/chat/groups/${conversationId}`)
  }
}

export default UserChatApi
