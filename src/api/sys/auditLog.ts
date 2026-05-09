/**
 * 审计日志后台管理 API
 * @see docs/api文档/auth-api.md - 审计日志后台管理
 */

import { http } from '../request'
import type { AuditLogVO, AuditLogQueryRequest, PageResult } from '@/types/api-types'

export class AuditLogApi {
  /** 分页查询审计日志 GET /api/sys/audit-logs */
  static getAuditLogs(params?: AuditLogQueryRequest) {
    return http.get<PageResult<AuditLogVO>>('/sys/audit-logs', params)
  }

  /** 查询审计日志详情 GET /api/sys/audit-logs/{id} */
  static getAuditLogById(id: number) {
    return http.get<AuditLogVO>(`/sys/audit-logs/${id}`)
  }
}

export default AuditLogApi
