/**
 * 通知后台管理模块 API
 * 基于 auth-api.md 文档 第6节
 */

import { http } from '../request'
import type {
  NoticeQueryRequest,
  SysNoticeAdminVO,
  SysNoticeSaveRequest,
  PageResult
} from '../types'

/**
 * 通知管理 API
 */
export const noticeApi = {
  /**
   * 6.1 分页查询通知
   * GET /api/sys/notices
   */
  getNotices: (params?: NoticeQueryRequest) =>
    http.get<PageResult<SysNoticeAdminVO>>('/sys/notices', params),

  /**
   * 6.2 查询通知详情
   * GET /api/sys/notices/{id}
   */
  getNoticeById: (id: number) =>
    http.get<SysNoticeAdminVO>(`/sys/notices/${id}`),

  /**
   * 6.3 新增通知
   * POST /api/sys/notices
   */
  createNotice: (data: SysNoticeSaveRequest) =>
    http.post<void>('/sys/notices', data),

  /**
   * 6.4 修改通知
   * PUT /api/sys/notices/{id}
   */
  updateNotice: (id: number, data: SysNoticeSaveRequest) =>
    http.put<void>(`/sys/notices/${id}`, data),

  /**
   * 6.5 发布通知
   * POST /api/sys/notices/{id}/publish
   */
  publishNotice: (id: number) =>
    http.post<void>(`/sys/notices/${id}/publish`),

  /**
   * 6.6 撤回通知
   * POST /api/sys/notices/{id}/revoke
   */
  revokeNotice: (id: number) =>
    http.post<void>(`/sys/notices/${id}/revoke`),

  /**
   * 6.7 删除通知
   * DELETE /api/sys/notices/{id}
   */
  deleteNotice: (id: number) =>
    http.delete<void>(`/sys/notices/${id}`)
}

export default noticeApi
