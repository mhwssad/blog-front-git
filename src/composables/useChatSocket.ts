/**
 * 聊天 WebSocket 组合式函数
 * 管理连接生命周期，将 WebSocket 事件分发到 userChat store
 */

import { onUnmounted, ref, watch } from 'vue'
import { useUserChatStore } from '@/stores/modules/userChat'
import { getChatWebSocket, destroyChatWebSocket, type ChatWebSocket } from '@/api/websocket'
import type {
  WsReadUpdatedPayload,
  WsConversationUpdatedPayload,
  WsMessageDeletedPayload,
  WsConnectionState,
} from '@/types/websocket'
import type { ChatMessageVO } from '@/types/api-types'

export function useChatSocket() {
  const chatStore = useUserChatStore()
  const connectionState = ref<WsConnectionState>('disconnected')
  const ws = ref<ChatWebSocket | null>(null)

  // Unsubscribe handles collected for cleanup
  const unsubscribers: Array<() => void> = []

  function setupEventHandlers(socket: ChatWebSocket): void {
    // Connection state sync
    unsubscribers.push(
      socket.onStateChange((state) => {
        connectionState.value = state
      }),
    )

    // New message received
    unsubscribers.push(
      socket.on('message_created', (envelope) => {
        const msg = envelope.payload as ChatMessageVO
        // Add to messages if viewing the conversation
        if (chatStore.currentConversation?.id === msg.conversationId) {
          const exists = chatStore.messages.some((m) => m.id === msg.id)
          if (!exists) {
            chatStore.messages.push(msg)
          }
        }
        // Update last message in conversation list
        const conv = chatStore.conversations.find((c) => c.id === msg.conversationId)
        if (conv) {
          conv.lastMessage = msg
          if (chatStore.currentConversation?.id !== msg.conversationId) {
            conv.unreadCount = (conv.unreadCount ?? 0) + 1
          }
        }
      }),
    )

    // Message edited
    unsubscribers.push(
      socket.on('message_updated', (envelope) => {
        const updated = envelope.payload as ChatMessageVO
        const idx = chatStore.messages.findIndex((m) => m.id === updated.id)
        if (idx !== -1) {
          chatStore.messages[idx] = updated
        }
      }),
    )

    // Message revoked
    unsubscribers.push(
      socket.on('message_revoked', (envelope) => {
        const revoked = envelope.payload as ChatMessageVO
        const idx = chatStore.messages.findIndex((m) => m.id === revoked.id)
        if (idx !== -1) {
          chatStore.messages[idx] = revoked
        }
      }),
    )

    // Message deleted (only pushed to the deleting user)
    unsubscribers.push(
      socket.on('message_deleted', (envelope) => {
        const { messageId } = envelope.payload as WsMessageDeletedPayload
        chatStore.messages = chatStore.messages.filter((m) => m.id !== messageId)
      }),
    )

    // Read status updated
    unsubscribers.push(
      socket.on('read_updated', (_envelope) => {
        // Can be used to update message read indicators
      }),
    )

    // Conversation updated
    unsubscribers.push(
      socket.on(
        'conversation_updated',
        (envelope) => {
          const data = envelope.payload as WsConversationUpdatedPayload
          const conv = chatStore.conversations.find((c) => c.id === data.conversationId)
          if (conv) {
            if (data.name !== undefined) conv.name = data.name
            if (data.avatar !== undefined) conv.avatar = data.avatar
            if (data.notice !== undefined) conv.notice = data.notice
            if (data.status !== undefined) conv.status = data.status
            if (data.memberCount !== undefined) conv.memberCount = data.memberCount
          }
          if (chatStore.currentConversation?.id === data.conversationId) {
            if (data.name !== undefined) chatStore.currentConversation.name = data.name
            if (data.avatar !== undefined) chatStore.currentConversation.avatar = data.avatar
            if (data.notice !== undefined) chatStore.currentConversation.notice = data.notice
          }
        },
      ),
    )

    // Members updated
    unsubscribers.push(
      socket.on('members_updated', (_envelope) => {
        // Group member changes - store can consume as needed
      }),
    )
  }

  function connect(): void {
    const socket = getChatWebSocket()
    ws.value = socket
    connectionState.value = socket.state
    setupEventHandlers(socket)
    socket.connect()
  }

  function disconnect(): void {
    for (const unsub of unsubscribers) {
      unsub()
    }
    unsubscribers.length = 0
    destroyChatWebSocket()
    ws.value = null
    connectionState.value = 'disconnected'
  }

  onUnmounted(() => {
    // Don't disconnect on component unmount - keep connection alive across page navigations
    // Only cleanup event handlers
    for (const unsub of unsubscribers) {
      unsub()
    }
    unsubscribers.length = 0
  })

  return {
    ws,
    connectionState,
    connect,
    disconnect,
  }
}
