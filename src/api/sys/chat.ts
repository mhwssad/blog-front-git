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

export const sysChatApi = {
  getConversations: (params?: SysChatConversationQueryRequest) =>
    http.get<PageResult<ChatConversationVO>>('/sys/chats/conversations', params),

  getConversationById: (conversationId: number) =>
    http.get<ChatConversationVO>(`/sys/chats/conversations/${conversationId}`),

  getConversationMembers: (conversationId: number) =>
    http.get<ChatGroupMemberVO[]>(`/sys/chats/conversations/${conversationId}/members`),

  getMessages: (conversationId: number, params?: SysChatMessageQueryRequest) =>
    http.get<PageResult<ChatMessageVO>>(`/sys/chats/conversations/${conversationId}/messages`, params),

  getMessageById: (conversationId: number, messageId: number) =>
    http.get<ChatMessageVO>(`/sys/chats/conversations/${conversationId}/messages/${messageId}`),

  getMessageReceipts: (
    conversationId: number,
    messageId: number,
    params?: SysChatReceiptQueryRequest
  ) =>
    http.get<PageResult<SysChatReceiptVO>>(
      `/sys/chats/conversations/${conversationId}/messages/${messageId}/receipts`,
      params
    ),

  updateMemberRole: (
    conversationId: number,
    memberUserId: number,
    data: SysChatMemberRoleUpdateRequest
  ) => http.put<void>(`/sys/chats/conversations/${conversationId}/members/${memberUserId}/role`, data),

  updateMemberStatus: (
    conversationId: number,
    memberUserId: number,
    data: SysChatMemberStatusUpdateRequest
  ) => http.put<void>(`/sys/chats/conversations/${conversationId}/members/${memberUserId}/status`, data),

  updateMemberMute: (conversationId: number, memberUserId: number, data: ChatGroupMuteRequest) =>
    http.put<void>(`/sys/chats/conversations/${conversationId}/members/${memberUserId}/mute`, data),

  revokeMessage: (conversationId: number, messageId: number) =>
    http.post<void>(`/sys/chats/conversations/${conversationId}/messages/${messageId}/revoke`),

  updateConversationStatus: (conversationId: number, data: SysChatConversationStatusUpdateRequest) =>
    http.put<void>(`/sys/chats/conversations/${conversationId}/status`, data),
}

export default sysChatApi
