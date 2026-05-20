/**
 * 举报后台管理 API
 * 基于 report-api.md 文档
 * @see docs/api文档/report-api.md
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

export class ReportSysApi {
  /**
   * 4.2 分页筛选举报
   * GET /api/sys/reports
   */
  static getReports(params?: {
    status?: number
    reportTargetType?: string
    reporterUserId?: number
    reportedStart?: string
    reportedEnd?: string
    current?: number
    size?: number
  }) {
    return http.get<PageResult<ReportAdminVO>>('/sys/reports', params)
  }

  /**
   * 4.3 举报详情
   * GET /api/sys/reports/{id}
   */
  static getReportById(id: number) {
    return http.get<ReportAdminVO>(`/sys/reports/${id}`)
  }

  /**
   * 4.4 接手举报
   * PUT /api/sys/reports/{id}/take
   */
  static takeReport(id: number) {
    return http.put<void>(`/sys/reports/${id}/take`)
  }

  /**
   * 4.5 处理举报
   * PUT /api/sys/reports/{id}/handle
   */
  static handleReport(id: number, data: ReportHandleRequest) {
    return http.put<void>(`/sys/reports/${id}/handle`, data)
  }

  /**
   * 4.6 驳回举报
   * PUT /api/sys/reports/{id}/reject
   */
  static rejectReport(id: number, data: ReportRejectRequest) {
    return http.put<void>(`/sys/reports/${id}/reject`, data)
  }

  /**
   * 修复举报状态
   * PUT /api/sys/reports/{id}/repair
   */
  static repairReport(id: number, data: ReportRepairRequest) {
    return http.put<void>(`/sys/reports/${id}/repair`, data)
  }

  /**
   * 4.7 超管接管举报
   * PUT /api/sys/reports/{id}/override
   */
  static overrideReport(id: number) {
    return http.put<void>(`/sys/reports/${id}/override`)
  }

  /**
   * 4.8 处理日志
   * GET /api/sys/reports/{id}/logs
   */
  static getReportLogs(id: number) {
    return http.get<ReportHandleLogVO[]>(`/sys/reports/${id}/logs`)
  }
}
