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

export const aiUserApi = {
  // ==================== 会话管理 ====================
  createSession: (data: AiSessionCreateRequest) =>
    http.post<AiSessionVO>('/user/ai/sessions', data),

  getSessions: (params?: { current?: number; size?: number }) =>
    http.get<PageResult<AiSessionVO>>('/user/ai/sessions', params),

  getSessionById: (id: number) =>
    http.get<AiSessionDetailVO>(`/user/ai/sessions/${id}`),

  getSessionMessages: (id: number, params?: { current?: number; size?: number }) =>
    http.get<PageResult<AiMessageVO>>(`/user/ai/sessions/${id}/messages`, params),

  sendMessage: (sessionId: number, data: AiMessageSendRequest) =>
    http.post<AiMessageVO>(`/user/ai/sessions/${sessionId}/messages`, data),

  /**
   * 流式发送消息（SSE）
   * POST /api/user/ai/sessions/{id}/messages/stream
   * 返回 EventSource 实例用于接收流式响应
   */
  sendMessageStream: (sessionId: number, data: AiMessageSendRequest) => {
    const baseURL = instance.defaults.baseURL || '/api'
    const url = `${baseURL}/user/ai/sessions/${sessionId}/messages/stream`
    const token = localStorage.getItem('accessToken')
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
  },

  closeSession: (id: number) =>
    http.delete<void>(`/user/ai/sessions/${id}`),

  getQuota: () =>
    http.get<AiQuotaVO>('/user/ai/sessions/quota'),

  // ==================== Agent 任务 ====================
  createAgentTask: (data: AiAgentTaskCreateRequest) =>
    http.post<AiAgentTaskVO>('/user/ai/agents/tasks', data),

  getAgentTasks: (params?: AiAgentTaskQueryRequest) =>
    http.get<PageResult<AiAgentTaskVO>>('/user/ai/agents/tasks', params),

  getAgentTaskById: (id: number) =>
    http.get<AiAgentTaskVO>(`/user/ai/agents/tasks/${id}`),

  cancelAgentTask: (id: number) =>
    http.put<void>(`/user/ai/agents/tasks/${id}/cancel`),
}
