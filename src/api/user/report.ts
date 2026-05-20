/**
 * 举报用户侧 API
 * 基于 report-api.md 文档
 * @see docs/api文档/report-api.md
 */

import { http } from '../request'
import type {
  ReportCreateRequest,
  ReportVO,
  PageResult,
} from '@/types/api-types'

export class ReportUserApi {
  /**
   * 3.2 提交举报
   * POST /api/user/reports
   */
  static createReport(data: ReportCreateRequest) {
    return http.post<ReportVO>('/user/reports', data)
  }

  /**
   * 3.3 查询我的举报记录
   * GET /api/user/reports
   */
  static getMyReports(params?: { targetType?: string; current?: number; size?: number }) {
    return http.get<PageResult<ReportVO>>('/user/reports', params)
  }

  /**
   * 3.4 查询举报详情
   * GET /api/user/reports/{id}
   */
  static getReportById(id: number) {
    return http.get<ReportVO>(`/user/reports/${id}`)
  }
}
