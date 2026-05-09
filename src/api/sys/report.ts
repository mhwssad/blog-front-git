/**
 * 举报后台管理 API
 * 基于 report-api.md 文档
 */

import { http } from '../request'
import type {
  ReportAdminVO,
  ReportHandleRequest,
  ReportRejectRequest,
  ReportRepairRequest,
  ReportHandleLogVO,
  PageResult,
} from '@/types/api-types'

export const reportSysApi = {
  /**
   * 4.2 分页筛选举报
   * GET /api/sys/reports
   */
  getReports: (params?: {
    status?: number
    reportTargetType?: string
    reporterUserId?: number
    reportedStart?: string
    reportedEnd?: string
    current?: number
    size?: number
  }) =>
    http.get<PageResult<ReportAdminVO>>('/sys/reports', { params }),

  /**
   * 4.3 举报详情
   * GET /api/sys/reports/{id}
   */
  getReportById: (id: number) =>
    http.get<ReportAdminVO>(`/sys/reports/${id}`),

  /**
   * 4.4 接手举报
   * PUT /api/sys/reports/{id}/take
   */
  takeReport: (id: number) =>
    http.put<void>(`/sys/reports/${id}/take`),

  /**
   * 4.5 处理举报
   * PUT /api/sys/reports/{id}/handle
   */
  handleReport: (id: number, data: ReportHandleRequest) =>
    http.put<void>(`/sys/reports/${id}/handle`, data),

  /**
   * 4.6 驳回举报
   * PUT /api/sys/reports/{id}/reject
   */
  rejectReport: (id: number, data: ReportRejectRequest) =>
    http.put<void>(`/sys/reports/${id}/reject`, data),

  /**
   * 修复举报状态
   * PUT /api/sys/reports/{id}/repair
   */
  repairReport: (id: number, data: ReportRepairRequest) =>
    http.put<void>(`/sys/reports/${id}/repair`, data),

  /**
   * 4.7 超管接管举报
   * PUT /api/sys/reports/{id}/override
   */
  overrideReport: (id: number) =>
    http.put<void>(`/sys/reports/${id}/override`),

  /**
   * 4.8 处理日志
   * GET /api/sys/reports/{id}/logs
   */
  getReportLogs: (id: number) =>
    http.get<ReportHandleLogVO[]>(`/sys/reports/${id}/logs`),
}
