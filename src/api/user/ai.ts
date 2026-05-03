/**
 * AI 用户侧 API
 * 基于 ai-api.md 文档
 */

import { http } from '../request'
import type {
  AiSessionCreateRequest,
  AiSessionVO,
  AiSessionDetailVO,
  AiMessageVO,
  AiMessageSendRequest,
  AiQuotaVO,
  PageResult,
} from '@/types/api-types'

export const aiUserApi = {
  /**
   * 3.2 创建AI会话
   * POST /api/user/ai/sessions
   */
  createSession: (data: AiSessionCreateRequest) =>
    http.post<AiSessionVO>('/user/ai/sessions', data),

  /**
   * 3.3 查询我的AI会话列表
   * GET /api/user/ai/sessions
   */
  getSessions: (params?: { current?: number; size?: number }) =>
    http.get<PageResult<AiSessionVO>>('/user/ai/sessions', params),

  /**
   * 3.4 查询AI会话详情
   * GET /api/user/ai/sessions/{id}
   */
  getSessionById: (id: number) =>
    http.get<AiSessionDetailVO>(`/user/ai/sessions/${id}`),

  /**
   * 3.5 分页查询会话消息
   * GET /api/user/ai/sessions/{id}/messages
   */
  getSessionMessages: (id: number, params?: { current?: number; size?: number }) =>
    http.get<PageResult<AiMessageVO>>(`/user/ai/sessions/${id}/messages`, params),

  /**
   * 3.6 发送消息
   * POST /api/user/ai/sessions/{id}/messages
   */
  sendMessage: (sessionId: number, data: AiMessageSendRequest) =>
    http.post<AiMessageVO>(`/user/ai/sessions/${sessionId}/messages`, data),

  /**
   * 3.7 关闭会话
   * DELETE /api/user/ai/sessions/{id}
   */
  closeSession: (id: number) =>
    http.delete<void>(`/user/ai/sessions/${id}`),

  /**
   * 3.8 查询我的AI配额
   * GET /api/user/ai/sessions/quota
   */
  getQuota: () =>
    http.get<AiQuotaVO>('/user/ai/sessions/quota'),
}
