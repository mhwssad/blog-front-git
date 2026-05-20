/**
 * AI 用户侧 API
 * @see docs/api文档/ai-api.md
 */

import { http } from '../request'
import instance from '../request'
import type {
  AiSessionCreateRequest,
  AiSessionVO,
  AiSessionDetailVO,
  AiMessageVO,
  AiMessageSendRequest,
  AiQuotaVO,
  AiAgentTaskVO,
  AiAgentTaskCreateRequest,
  AiAgentTaskQueryRequest,
  PageResult,
} from '@/types/api-types'

export class AiUserApi {
  // ==================== 会话管理 ====================
  static createSession(data: AiSessionCreateRequest) {
    return http.post<AiSessionVO>('/user/ai/sessions', data)
  }

  static getSessions(params?: { current?: number; size?: number }) {
    return http.get<PageResult<AiSessionVO>>('/user/ai/sessions', params)
  }

  static getSessionById(id: number) {
    return http.get<AiSessionDetailVO>(`/user/ai/sessions/${id}`)
  }

  static getSessionMessages(id: number, params?: { current?: number; size?: number }) {
    return http.get<PageResult<AiMessageVO>>(`/user/ai/sessions/${id}/messages`, params)
  }

  static sendMessage(sessionId: number, data: AiMessageSendRequest) {
    return http.post<AiMessageVO>(`/user/ai/sessions/${sessionId}/messages`, data)
  }

  /**
   * 流式发送消息（SSE）
   * POST /api/user/ai/sessions/{id}/messages/stream
   * 返回 EventSource 实例用于接收流式响应
   */
  static sendMessageStream(sessionId: number, data: AiMessageSendRequest) {
    const baseURL = instance.defaults.baseURL || '/api'
    const url = `${baseURL}/user/ai/sessions/${sessionId}/messages/stream`
    const token = localStorage.getItem('access_token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
  }

  static closeSession(id: number) {
    return http.delete<void>(`/user/ai/sessions/${id}`)
  }

  static getQuota() {
    return http.get<AiQuotaVO>('/user/ai/sessions/quota')
  }

  // ==================== Agent 任务 ====================
  static createAgentTask(data: AiAgentTaskCreateRequest) {
    return http.post<AiAgentTaskVO>('/user/ai/agents/tasks', data)
  }

  static getAgentTasks(params?: AiAgentTaskQueryRequest) {
    return http.get<PageResult<AiAgentTaskVO>>('/user/ai/agents/tasks', params)
  }

  static getAgentTaskById(id: number) {
    return http.get<AiAgentTaskVO>(`/user/ai/agents/tasks/${id}`)
  }

  static cancelAgentTask(id: number) {
    return http.put<void>(`/user/ai/agents/tasks/${id}/cancel`)
  }
}
