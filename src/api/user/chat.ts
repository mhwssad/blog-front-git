/**
 * 用户聊天 API
 * 基于 chat-api.md 文档
 */

import { http } from '../request'
import type {
  ChannelApplicationRequest,
  ChannelApplicationVO,
  ChatConversationReadRequest,
  ChatConversationReadVO,
  ChatConversationVO,
  ChatGroupCreateRequest,
  ChatGroupMemberInviteRequest,
  ChatGroupMemberVO,
  ChatGroupMuteRequest,
  ChatGroupNoticeUpdateRequest,
  ChatGroupOwnerTransferRequest,
  ChatGroupSearchRequest,
  ChatGroupSearchVO,
  ChatMessageEditRequest,
  ChatMessageVO,
  ChatSendFileRequest,
  ChatSendTextRequest,
  ChatSingleConversationCreateRequest,
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

/**
 * 用户聊天 API
 * 提供会话管理、消息发送、群组管理等功能
 */
export class UserChatApi {
  // ==================== 会话管理 ====================

  /**
   * 分页查询会话列表
   * GET /api/user/chat/conversations
   */
  static getConversations(params?: UserChatConversationQueryRequest) {
    return http.get<PageResult<ChatConversationVO>>('/user/chat/conversations', params)
  }

  /**
   * 获取会话详情
   * GET /api/user/chat/conversations/{conversationId}
   */
  static getConversationById(conversationId: number) {
    return http.get<ChatConversationVO>(`/user/chat/conversations/${conversationId}`)
  }

  /**
   * 创建单人会话
   * POST /api/user/chat/single-conversations
   */
  static createSingleConversation(data: ChatSingleConversationCreateRequest) {
    return http.post<ChatConversationVO>('/user/chat/single-conversations', data)
  }

  /**
   * 加入公开频道或公开群
   * POST /api/user/chat/conversations/{conversationId}/join
   */
  static joinConversation(conversationId: number) {
    return http.post<void>(`/user/chat/conversations/${conversationId}/join`)
  }

  /**
   * 离开频道或公开群
   * POST /api/user/chat/conversations/{conversationId}/leave
   */
  static leaveConversation(conversationId: number) {
    return http.post<void>(`/user/chat/conversations/${conversationId}/leave`)
  }

  // ==================== 消息 ====================

  /**
   * 分页查询会话消息
   * GET /api/user/chat/conversations/{conversationId}/messages
   */
  static getMessages(conversationId: number, params?: UserChatMessageQueryRequest) {
    return http.get<PageResult<ChatMessageVO>>(
      `/user/chat/conversations/${conversationId}/messages`,
      params,
    )
  }

  /**
   * 发送文本消息
   * POST /api/user/chat/messages/text
   */
  static sendTextMessage(data: ChatSendTextRequest) {
    return http.post<ChatMessageVO>('/user/chat/messages/text', data)
  }

  /**
   * 发送文件消息
   * POST /api/user/chat/messages/file
   */
  static sendFileMessage(data: ChatSendFileRequest) {
    return http.post<ChatMessageVO>('/user/chat/messages/file', data)
  }

  /**
   * 编辑消息
   * PUT /api/user/chat/messages/{messageId}
   */
  static updateMessage(messageId: number, data: ChatMessageEditRequest) {
    return http.put<ChatMessageVO>(`/user/chat/messages/${messageId}`, data)
  }

  /**
   * 撤回消息
   * POST /api/user/chat/messages/{messageId}/revoke
   */
  static revokeMessage(messageId: number) {
    return http.post<void>(`/user/chat/messages/${messageId}/revoke`)
  }

  /**
   * 删除消息
   * DELETE /api/user/chat/messages/{messageId}
   */
  static deleteMessage(messageId: number) {
    return http.delete<void>(`/user/chat/messages/${messageId}`)
  }

  /**
   * 标记会话已读
   * POST /api/user/chat/conversations/{conversationId}/read
   */
  static markConversationRead(conversationId: number, data: ChatConversationReadRequest) {
    return http.post<ChatConversationReadVO>(
      `/user/chat/conversations/${conversationId}/read`,
      data,
    )
  }

  // ==================== 群组管理 ====================

  /**
   * 创建群组
   * POST /api/user/chat/groups
   */
  static createGroup(data: ChatGroupCreateRequest) {
    return http.post<ChatConversationVO>('/user/chat/groups', data)
  }

  /**
   * 搜索公开群聊
   * GET /api/user/chat/groups/search
   */
  static searchGroups(params?: ChatGroupSearchRequest) {
    return http.get<PageResult<ChatGroupSearchVO>>('/user/chat/groups/search', params)
  }

  /**
   * 获取群组详情
   * GET /api/user/chat/groups/{conversationId}
   */
  static getGroupById(conversationId: number) {
    return http.get<ChatConversationVO>(`/user/chat/groups/${conversationId}`)
  }

  /**
   * 获取群组成员列表
   * GET /api/user/chat/groups/{conversationId}/members
   */
  static getGroupMembers(conversationId: number) {
    return http.get<ChatGroupMemberVO[]>(`/user/chat/groups/${conversationId}/members`)
  }

  /**
   * 邀请群组成员
   * POST /api/user/chat/groups/{conversationId}/members
   */
  static inviteGroupMembers(conversationId: number, data: ChatGroupMemberInviteRequest) {
    return http.post<void>(`/user/chat/groups/${conversationId}/members`, data)
  }

  /**
   * 设置群组管理员
   * PUT /api/user/chat/groups/{conversationId}/admins/{memberUserId}
   */
  static setGroupAdmin(conversationId: number, memberUserId: number) {
    return http.put<void>(`/user/chat/groups/${conversationId}/admins/${memberUserId}`)
  }

  /**
   * 移除群组管理员
   * DELETE /api/user/chat/groups/{conversationId}/admins/{memberUserId}
   */
  static removeGroupAdmin(conversationId: number, memberUserId: number) {
    return http.delete<void>(`/user/chat/groups/${conversationId}/admins/${memberUserId}`)
  }

  /**
   * 转让群组所有权
   * PUT /api/user/chat/groups/{conversationId}/owner
   */
  static transferGroupOwner(conversationId: number, data: ChatGroupOwnerTransferRequest) {
    return http.put<void>(`/user/chat/groups/${conversationId}/owner`, data)
  }

  /**
   * 更新群组成员禁言状态
   * PUT /api/user/chat/groups/{conversationId}/members/{memberUserId}/mute
   */
  static updateGroupMemberMute(
    conversationId: number,
    memberUserId: number,
    data: ChatGroupMuteRequest,
  ) {
    return http.put<void>(
      `/user/chat/groups/${conversationId}/members/${memberUserId}/mute`,
      data,
    )
  }

  /**
   * 更新群组公告
   * PUT /api/user/chat/groups/{conversationId}/notice
   */
  static updateGroupNotice(conversationId: number, data: ChatGroupNoticeUpdateRequest) {
    return http.put<void>(`/user/chat/groups/${conversationId}/notice`, data)
  }

  /**
   * 移出群组成员
   * DELETE /api/user/chat/groups/{conversationId}/members/{memberUserId}
   */
  static removeGroupMember(conversationId: number, memberUserId: number) {
    return http.delete<void>(`/user/chat/groups/${conversationId}/members/${memberUserId}`)
  }

  /**
   * 退出群组
   * POST /api/user/chat/groups/{conversationId}/leave
   */
  static leaveGroup(conversationId: number) {
    return http.post<void>(`/user/chat/groups/${conversationId}/leave`)
  }

  /**
   * 解散群组
   * DELETE /api/user/chat/groups/{conversationId}
   */
  static dissolveGroup(conversationId: number) {
    return http.delete<void>(`/user/chat/groups/${conversationId}`)
  }

  // ==================== 频道创建申请 ====================

  /**
   * 提交频道申请
   * POST /api/user/chat/channel-applications
   */
  static submitChannelApplication(data: ChannelApplicationRequest) {
    return http.post<void>('/user/chat/channel-applications', data)
  }

  /**
   * 查询最近一次频道申请
   * GET /api/user/chat/channel-applications/latest
   */
  static getLatestChannelApplication() {
    return http.get<ChannelApplicationVO | null>('/user/chat/channel-applications/latest')
  }

  /**
   * 分页查询频道申请
   * GET /api/user/chat/channel-applications
   */
  static getChannelApplications(params?: { current?: number; size?: number }) {
    return http.get<PageResult<ChannelApplicationVO>>('/user/chat/channel-applications', params)
  }

  // ==================== 帖子频道挂接 ====================

  /**
   * 分享帖子到频道
   * POST /api/user/chat/forum-links
   */
  static createForumLink(data: ForumLinkRequest) {
    return http.post<void>('/user/chat/forum-links', data)
  }

  /**
   * 查询帖子关联的频道
   * GET /api/user/chat/forum-links/posts/{forumPostId}
   */
  static getForumLinksByPost(forumPostId: number) {
    return http.get<ForumLinkVO[]>(`/user/chat/forum-links/posts/${forumPostId}`)
  }

  /**
   * 分页查询频道关联的帖子
   * GET /api/user/chat/forum-links/channels/{conversationId}
   */
  static getForumLinksByChannel(
    conversationId: number,
    params?: { current?: number; size?: number },
  ) {
    return http.get<PageResult<ForumLinkVO>>(
      `/user/chat/forum-links/channels/${conversationId}`,
      params,
    )
  }

  /**
   * 取消帖子与频道的关联
   * DELETE /api/user/chat/forum-links/posts/{forumPostId}
   */
  static deleteForumLink(forumPostId: number) {
    return http.delete<void>(`/user/chat/forum-links/posts/${forumPostId}`)
  }

  // ==================== 入群申请 ====================

  /**
   * 提交入群申请
   * POST /api/user/chat/groups/{conversationId}/join-applications
   */
  static submitJoinApplication(
    conversationId: number,
    data?: GroupJoinApplicationRequest,
  ) {
    return http.post<void>(
      `/user/chat/groups/${conversationId}/join-applications`,
      data,
    )
  }

  /**
   * 分页查询我的入群申请
   * GET /api/user/chat/group-join-applications
   */
  static getMyJoinApplications(params?: {
    current?: number
    size?: number
    applyStatus?: number
  }) {
    return http.get<PageResult<GroupJoinApplicationVO>>(
      '/user/chat/group-join-applications',
      params,
    )
  }

  /**
   * 分页查询指定群的入群申请
   * GET /api/user/chat/groups/{conversationId}/join-applications
   */
  static getGroupJoinApplications(
    conversationId: number,
    params?: { current?: number; size?: number; applyStatus?: number },
  ) {
    return http.get<PageResult<GroupJoinApplicationVO>>(
      `/user/chat/groups/${conversationId}/join-applications`,
      params,
    )
  }

  /**
   * 审核入群申请
   * PUT /api/user/chat/groups/{conversationId}/join-applications/{applicationId}/review
   */
  static reviewJoinApplication(
    conversationId: number,
    applicationId: number,
    data: GroupJoinApplicationReviewRequest,
  ) {
    return http.put<void>(
      `/user/chat/groups/${conversationId}/join-applications/${applicationId}/review`,
      data,
    )
  }

  // ==================== 群邀请链接 ====================

  /**
   * 创建群邀请链接
   * POST /api/user/chat/groups/{conversationId}/invite-links
   */
  static createInviteLink(
    conversationId: number,
    data?: GroupInviteLinkCreateRequest,
  ) {
    return http.post<GroupInviteLinkVO>(
      `/user/chat/groups/${conversationId}/invite-links`,
      data,
    )
  }

  /**
   * 分页查询群邀请链接
   * GET /api/user/chat/groups/{conversationId}/invite-links
   */
  static getInviteLinks(
    conversationId: number,
    params?: { current?: number; size?: number; status?: number },
  ) {
    return http.get<PageResult<GroupInviteLinkVO>>(
      `/user/chat/groups/${conversationId}/invite-links`,
      params,
    )
  }

  /**
   * 停用群邀请链接
   * PUT /api/user/chat/groups/{conversationId}/invite-links/{inviteLinkId}/disable
   */
  static disableInviteLink(conversationId: number, inviteLinkId: number) {
    return http.put<void>(
      `/user/chat/groups/${conversationId}/invite-links/${inviteLinkId}/disable`,
    )
  }

  /**
   * 通过邀请链接入群
   * POST /api/user/chat/group-invite-links/{inviteToken}/join
   */
  static joinByInviteLink(inviteToken: string) {
    return http.post<void>(`/user/chat/group-invite-links/${inviteToken}/join`)
  }
}

export default UserChatApi
