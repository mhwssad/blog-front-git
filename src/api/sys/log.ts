/**
 * 日志管理模块 API
 * 基于 auth-api.md 文档 第8节
 */

import { http } from '../request'
import type { LogQueryRequest, SysLogAdminVO, SysLogCleanRequest, PageResult } from '../types'

/**
 * 日志管理 API
 * 提供系统日志的查询和清理操作
 */
export class LogApi {
  /**
   * 8.1 分页查询日志列表
   * GET /api/sys/logs
   */
  static getLogs(params?: LogQueryRequest) {
    return http.get<PageResult<SysLogAdminVO>>('/sys/logs', params)
  }

  /**
   * 8.2 查询日志详情
   * GET /api/sys/logs/{id}
   */
  static getLogById(id: number) {
    return http.get<SysLogAdminVO>(`/sys/logs/${id}`)
  }

  /**
   * 8.3 删除日志
   * DELETE /api/sys/logs/{id}
   */
  static deleteLog(id: number) {
    return http.delete<void>(`/sys/logs/${id}`)
  }

  /**
   * 8.4 按条件清理日志
   * POST /api/sys/logs/clean
   */
  static cleanLogs(data: SysLogCleanRequest) {
    return http.post<number>('/sys/logs/clean', data)
  }
}

export default LogApi
