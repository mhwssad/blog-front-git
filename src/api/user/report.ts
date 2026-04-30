/**
 * 举报用户侧 API
 * 基于 report-api.md 文档
 */

import { http } from '../request'
import type {
  ReportCreateRequest,
  ReportVO,
  PageResult,
} from '@/types/api-types'

export const reportUserApi = {
  /**
   * 3.2 提交举报
   * POST /api/user/reports
   */
  createReport: (data: ReportCreateRequest) =>
    http.post<ReportVO>('/user/reports', data),

  /**
   * 3.3 查询我的举报记录
   * GET /api/user/reports
   */
  getMyReports: (params?: { targetType?: string; current?: number; size?: number }) =>
    http.get<PageResult<ReportVO>>('/user/reports', { params }),

  /**
   * 3.4 查询举报详情
   * GET /api/user/reports/{id}
   */
  getReportById: (id: number) =>
    http.get<ReportVO>(`/user/reports/${id}`),
}
