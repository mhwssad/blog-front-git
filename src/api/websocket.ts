/**
 * 聊天 WebSocket 连接管理
 * 基于 websocket-api.md 文档
 * @see docs/api文档/websocket-api.md
 *
 * 功能：自动重连、心跳保活、Token 鉴权、消息分发
 */

import type {
  WsConnectionState,
  WsEnvelope,
  WsEventHandler,
} from '@/types/websocket'

export type {
  WsConnectionState,
  WsEnvelope,
  WsReadyPayload,
  WsSendMessagePayload,
  WsMarkReadPayload,
  WsMessageDeletedPayload,
  WsConversationUpdatedPayload,
  WsMembersUpdatedPayload,
  WsReadUpdatedPayload,
  WsEventHandler,
} from '@/types/websocket'

// ==================== WebSocket 客户端 ====================

export class ChatWebSocket {
  private ws: WebSocket | null = null
  private url: string
  private getToken: () => string | null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private reconnectAttempts = 0
  private maxReconnectDelay = 30_000
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private requestIdCounter = 0
  private pendingRequests = new Map<
    string,
    { resolve: (envelope: WsEnvelope) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> }
  >()

  private _state: WsConnectionState = 'disconnected'
  private stateListeners = new Set<(state: WsConnectionState) => void>()
  private eventHandlers = new Map<string, Set<WsEventHandler>>()

  constructor(url: string, getToken: () => string | null) {
    this.url = url
    this.getToken = getToken
  }

  get state(): WsConnectionState {
    return this._state
  }

  private setState(state: WsConnectionState): void {
    this._state = state
    for (const listener of this.stateListeners) {
      listener(state)
    }
  }

  // ==================== 连接管理 ====================

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return
    }

    const token = this.getToken()
    if (!token) return

    this.setState('connecting')
    this.ws = new WebSocket(`${this.url}?accessToken=${token}`)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.startHeartbeat()
    }

    this.ws.onmessage = (event: MessageEvent) => {
      if (typeof event.data === 'string' && event.data === 'pong') return

      try {
        const envelope = JSON.parse(event.data)
        this.handleEnvelope(envelope)
      } catch {
        // ignore malformed messages
      }
    }

    this.ws.onclose = () => {
      this.stopHeartbeat()
      this.clearPendingRequests(new Error('Connection closed'))
      this.setState('disconnected')
      this.scheduleReconnect()
    }

    this.ws.onerror = () => {
      // onclose fires after onerror, reconnection handled there
    }
  }

  disconnect(): void {
    this.stopReconnect()
    this.stopHeartbeat()
    this.clearPendingRequests(new Error('Manual disconnect'))
    if (this.ws) {
      this.ws.onclose = null
      this.ws.onerror = null
      this.ws.onmessage = null
      this.ws.close()
      this.ws = null
    }
    this.setState('disconnected')
  }

  // ==================== 发送消息 ====================

  send(type: string, payload?: unknown): Promise<WsEnvelope> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'))
        return
      }

      const requestId = `req-${++this.requestIdCounter}`
      const timer = setTimeout(() => {
        this.pendingRequests.delete(requestId)
        reject(new Error(`Request ${requestId} timed out`))
      }, 10_000)

      this.pendingRequests.set(requestId, { resolve, reject, timer })

      const message = JSON.stringify({ type, requestId, payload })
      this.ws.send(message)
    })
  }

  sendTextPing(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send('ping')
    }
  }

  // ==================== 事件监听 ====================

  onStateChange(listener: (state: WsConnectionState) => void): () => void {
    this.stateListeners.add(listener)
    return () => this.stateListeners.delete(listener)
  }

  on(eventType: string, handler: WsEventHandler): () => void {
    let handlers = this.eventHandlers.get(eventType)
    if (!handlers) {
      handlers = new Set()
      this.eventHandlers.set(eventType, handlers)
    }
    handlers.add(handler)
    return () => handlers.delete(handler)
  }

  // ==================== 内部方法 ====================

  private handleEnvelope(envelope: WsEnvelope): void {
    // Handle connection ready
    if (envelope.type === 'ready') {
      this.setState('connected')
    }

    // Resolve pending request
    if (envelope.requestId && this.pendingRequests.has(envelope.requestId)) {
      const pending = this.pendingRequests.get(envelope.requestId)!
      clearTimeout(pending.timer)
      this.pendingRequests.delete(envelope.requestId)
      if (envelope.code === 200) {
        pending.resolve(envelope)
      } else {
        pending.reject(new Error(envelope.message || `Error code: ${envelope.code}`))
      }
    }

    // Dispatch to event handlers
    const handlers = this.eventHandlers.get(envelope.type)
    if (handlers) {
      for (const handler of handlers) {
        handler(envelope)
      }
    }

    // Also dispatch to wildcard handlers
    const wildcardHandlers = this.eventHandlers.get('*')
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        handler(envelope)
      }
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      this.sendTextPing()
    }, 30_000)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay)
    this.reconnectAttempts++

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectAttempts = 0
  }

  private clearPendingRequests(error: Error): void {
    for (const [, pending] of this.pendingRequests) {
      clearTimeout(pending.timer)
      pending.reject(error)
    }
    this.pendingRequests.clear()
  }
}

// ==================== 单例工厂 ====================

let instance: ChatWebSocket | null = null

export function getChatWebSocket(): ChatWebSocket {
  if (!instance) {
    const baseUrl = import.meta.env.VITE_DEV_PROXY_TARGET || window.location.host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${baseUrl}/ws/chat`

    instance = new ChatWebSocket(wsUrl, () => {
      return localStorage.getItem('accessToken')
    })
  }
  return instance
}

export function destroyChatWebSocket(): void {
  if (instance) {
    instance.disconnect()
    instance = null
  }
}
