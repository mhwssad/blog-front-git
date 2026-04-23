/**
 * 日志管理模块 API
 * 基于 auth-api.md 文档 第8节
 */

import { http } from '../request'
import type {
  LogQueryRequest,
  SysLogAdminVO,
  SysLogCleanRequest,
  PageResult
} from '../types'

/**
 * 日志管理 API
 */
export const logApi = {
  /**
   * 8.1 分页查询日志
   * GET /api/sys/logs
   */
  getLogs: (params?: LogQueryRequest) =>
    http.get<PageResult<SysLogAdminVO>>('/sys/logs', params),

  /**
   * 8.2 查询日志详情
   * GET /api/sys/logs/{id}
   */
  getLogById: (id: number) =>
    http.get<SysLogAdminVO>(`/sys/logs/${id}`),

  /**
   * 8.3 删除日志
   * DELETE /api/sys/logs/{id}
   */
  deleteLog: (id: number) =>
    http.delete<void>(`/sys/logs/${id}`),

  /**
   * 8.4 按条件清理日志
   * POST /api/sys/logs/clean
   */
  cleanLogs: (data: SysLogCleanRequest) =>
    http.post<number>('/sys/logs/clean', data)
}

export default logApi
