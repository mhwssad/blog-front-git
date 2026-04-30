/**
 * AI 后台管理 API
 * 基于 ai-api.md 文档
 */

import { http } from '../request'
import type {
  AiChannelConfigVO,
  AiChannelConfigSaveRequest,
  AiChannelStatusRequest,
  AiSessionAdminVO,
  AiUsageLogVO,
  AiUsageStatsVO,
  PageResult,
} from '@/types/api-types'

export const aiSysApi = {
  /**
   * 4.1.2 分页查询渠道配置
   * GET /api/sys/ai/channels
   */
  getChannels: (params?: { current?: number; size?: number }) =>
    http.get<PageResult<AiChannelConfigVO>>('/sys/ai/channels', { params }),

  /**
   * 4.1.3 查询渠道配置详情
   * GET /api/sys/ai/channels/{id}
   */
  getChannelById: (id: number) =>
    http.get<AiChannelConfigVO>(`/sys/ai/channels/${id}`),

  /**
   * 4.1.4 创建渠道配置
   * POST /api/sys/ai/channels
   */
  createChannel: (data: AiChannelConfigSaveRequest) =>
    http.post<AiChannelConfigVO>('/sys/ai/channels', data),

  /**
   * 4.1.5 更新渠道配置
   * PUT /api/sys/ai/channels/{id}
   */
  updateChannel: (id: number, data: AiChannelConfigSaveRequest) =>
    http.put<AiChannelConfigVO>(`/sys/ai/channels/${id}`, data),

  /**
   * 4.1.6 更新渠道状态
   * PUT /api/sys/ai/channels/{id}/status
   */
  updateChannelStatus: (id: number, data: AiChannelStatusRequest) =>
    http.put<void>(`/sys/ai/channels/${id}/status`, data),

  /**
   * 4.1.7 删除渠道配置
   * DELETE /api/sys/ai/channels/{id}
   */
  deleteChannel: (id: number) =>
    http.delete<void>(`/sys/ai/channels/${id}`),

  /**
   * 4.2.2 分页查询用户会话
   * GET /api/sys/ai/sessions
   */
  getSessions: (params?: {
    userId?: number
    status?: number
    channelConfigId?: number
    startTime?: string
    endTime?: string
    current?: number
    size?: number
  }) =>
    http.get<PageResult<AiSessionAdminVO>>('/sys/ai/sessions', { params }),

  /**
   * 4.2.3 查询会话详情
   * GET /api/sys/ai/sessions/{id}
   */
  getSessionById: (id: number) =>
    http.get<AiSessionAdminVO>(`/sys/ai/sessions/${id}`),

  /**
   * 4.3.2 分页查询使用日志
   * GET /api/sys/ai/usage-logs
   */
  getUsageLogs: (params?: {
    userId?: number
    channelConfigId?: number
    startTime?: string
    endTime?: string
    successStatus?: number
    current?: number
    size?: number
  }) =>
    http.get<PageResult<AiUsageLogVO>>('/sys/ai/usage-logs', { params }),

  /**
   * 4.3.3 获取使用统计
   * GET /api/sys/ai/usage-logs/stats
   */
  getUsageStats: (params?: {
    userId?: number
    channelConfigId?: number
    startTime?: string
    endTime?: string
    successStatus?: number
  }) =>
    http.get<AiUsageStatsVO>('/sys/ai/usage-logs/stats', { params }),
}
