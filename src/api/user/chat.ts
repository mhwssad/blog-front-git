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

export const userChatApi = {
  getConversations: (params?: UserChatConversationQueryRequest) =>
    http.get<PageResult<ChatConversationVO>>('/user/chat/conversations', params),

  getConversationById: (conversationId: number) =>
    http.get<ChatConversationVO>(`/user/chat/conversations/${conversationId}`),

  createSingleConversation: (data: ChatSingleConversationCreateRequest) =>
    http.post<ChatConversationVO>('/user/chat/single-conversations', data),

  getMessages: (conversationId: number, params?: UserChatMessageQueryRequest) =>
    http.get<PageResult<ChatMessageVO>>(`/user/chat/conversations/${conversationId}/messages`, params),

  sendTextMessage: (data: ChatSendTextRequest) =>
    http.post<ChatMessageVO>('/user/chat/messages/text', data),

  sendFileMessage: (data: ChatSendFileRequest) =>
    http.post<ChatMessageVO>('/user/chat/messages/file', data),

  updateMessage: (messageId: number, data: ChatMessageEditRequest) =>
    http.put<ChatMessageVO>(`/user/chat/messages/${messageId}`, data),

  revokeMessage: (messageId: number) =>
    http.post<void>(`/user/chat/messages/${messageId}/revoke`),

  deleteMessage: (messageId: number) =>
    http.delete<void>(`/user/chat/messages/${messageId}`),

  markConversationRead: (conversationId: number, data: ChatConversationReadRequest) =>
    http.post<ChatConversationReadVO>(`/user/chat/conversations/${conversationId}/read`, data),

  createGroup: (data: ChatGroupCreateRequest) =>
    http.post<ChatConversationVO>('/user/chat/groups', data),

  getGroupById: (conversationId: number) =>
    http.get<ChatConversationVO>(`/user/chat/groups/${conversationId}`),

  getGroupMembers: (conversationId: number) =>
    http.get<ChatGroupMemberVO[]>(`/user/chat/groups/${conversationId}/members`),

  inviteGroupMembers: (conversationId: number, data: ChatGroupMemberInviteRequest) =>
    http.post<void>(`/user/chat/groups/${conversationId}/members`, data),

  setGroupAdmin: (conversationId: number, memberUserId: number) =>
    http.put<void>(`/user/chat/groups/${conversationId}/admins/${memberUserId}`),

  removeGroupAdmin: (conversationId: number, memberUserId: number) =>
    http.delete<void>(`/user/chat/groups/${conversationId}/admins/${memberUserId}`),

  transferGroupOwner: (conversationId: number, data: ChatGroupOwnerTransferRequest) =>
    http.put<void>(`/user/chat/groups/${conversationId}/owner`, data),

  updateGroupMemberMute: (conversationId: number, memberUserId: number, data: ChatGroupMuteRequest) =>
    http.put<void>(`/user/chat/groups/${conversationId}/members/${memberUserId}/mute`, data),

  updateGroupNotice: (conversationId: number, data: ChatGroupNoticeUpdateRequest) =>
    http.put<void>(`/user/chat/groups/${conversationId}/notice`, data),

  removeGroupMember: (conversationId: number, memberUserId: number) =>
    http.delete<void>(`/user/chat/groups/${conversationId}/members/${memberUserId}`),

  leaveGroup: (conversationId: number) =>
    http.post<void>(`/user/chat/groups/${conversationId}/leave`),

  dissolveGroup: (conversationId: number) =>
    http.delete<void>(`/user/chat/groups/${conversationId}`),
}

export default userChatApi
