/**
 * 通知管理模块 API
 * 基于 auth-api.md 文档 第6节
 */

import { http } from '../request'
import type { NoticeQueryRequest, SysNoticeAdminVO, SysNoticeSaveRequest, PageResult } from '@/types/api-types'

/**
 * 通知管理 API
 * 提供通知的增删改查和发布/撤回操作
 */
export class NoticeApi {
  /**
   * 6.1 分页查询通知列表
   * GET /api/sys/notices
   */
  static getNotices(params?: NoticeQueryRequest) {
    return http.get<PageResult<SysNoticeAdminVO>>('/sys/notices', params)
  }

  /**
   * 6.2 查询通知详情
   * GET /api/sys/notices/{id}
   */
  static getNoticeById(id: number) {
    return http.get<SysNoticeAdminVO>(`/sys/notices/${id}`)
  }

  /**
   * 6.3 新增通知
   * POST /api/sys/notices
   */
  static createNotice(data: SysNoticeSaveRequest) {
    return http.post<void>('/sys/notices', data)
  }

  /**
   * 6.4 修改通知
   * PUT /api/sys/notices/{id}
   */
  static updateNotice(id: number, data: SysNoticeSaveRequest) {
    return http.put<void>(`/sys/notices/${id}`, data)
  }

  /**
   * 6.5 发布通知
   * POST /api/sys/notices/{id}/publish
   */
  static publishNotice(id: number) {
    return http.post<void>(`/sys/notices/${id}/publish`)
  }

  /**
   * 6.6 撤回通知
   * POST /api/sys/notices/{id}/revoke
   */
  static revokeNotice(id: number) {
    return http.post<void>(`/sys/notices/${id}/revoke`)
  }

  /**
   * 6.7 删除通知
   * DELETE /api/sys/notices/{id}
   */
  static deleteNotice(id: number) {
    return http.delete<void>(`/sys/notices/${id}`)
  }
}

export default NoticeApi
