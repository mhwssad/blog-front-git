/**
 * WebSocket 通信类型定义
 */

export type WsConnectionState = 'disconnected' | 'connecting' | 'connected'

export interface WsEnvelope<T = unknown> {
  type: string
  requestId: string | null
  timestamp?: number
  code?: number
  message?: string
  payload: T
}

export interface WsReadyPayload {
  sessionId: string
  userId: number
  username: string
  supportedRequestTypes: string[]
}

export interface WsSendMessagePayload {
  conversationId?: number
  targetUserId?: number
  content: string
  clientMessageId?: string
  replyMessageId?: number
}

export interface WsMarkReadPayload {
  conversationId: number
  readMessageId: number
}

export interface WsMessageDeletedPayload {
  conversationId: number
  messageId: number
  userId: number
  unreadCount: number
}

export interface WsConversationUpdatedPayload {
  action: string
  conversationId: number
  conversationType: string
  name?: string
  avatar?: string
  ownerId?: number
  notice?: string
  status?: number
  memberCount?: number
}

export interface WsMembersUpdatedPayload {
  action: string
  conversationId: number
  affectedUserId: number
  members: Array<{
    userId: number
    username: string
    nickname: string
    avatar: string
    role: string
    status: number
    joinedAt: string
    muteUntil: string | null
  }>
}

export interface WsReadUpdatedPayload {
  conversationId: number
  userId: number
  readMessageId: number
  readAt: string
  deliveredMessageId: number
  deliveredAt: string
  unreadCount: number
}

export type WsEventHandler = (envelope: WsEnvelope) => void
