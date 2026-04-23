/**
 * 用户通知中心模块 API
 * 基于 auth-api.md 文档 第7节
 */

import { http } from '../request'
import type {
  UserNoticeQueryRequest,
  UserNoticeVO,
  PageResult
} from '../types'

export type { UserNoticeQueryRequest } from '../types'

/**
 * 用户通知中心 API
 */
export const userNoticeApi = {
  /**
   * 7.1 我的通知列表
   * GET /api/user/notices
   */
  getMyNotices: (params?: UserNoticeQueryRequest) =>
    http.get<PageResult<UserNoticeVO>>('/user/notices', params),

  /**
   * 7.2 我的通知详情
   * GET /api/user/notices/{id}
   */
  getMyNoticeById: (id: number) =>
    http.get<UserNoticeVO>(`/user/notices/${id}`),

  /**
   * 7.3 我的未读数
   * GET /api/user/notices/unread-count
   */
  getUnreadCount: () =>
    http.get<number>('/user/notices/unread-count'),

  /**
   * 7.4 单条已读
   * POST /api/user/notices/{id}/read
   */
  markAsRead: (id: number) =>
    http.post<void>(`/user/notices/${id}/read`),

  /**
   * 7.5 全部已读
   * POST /api/user/notices/read-all
   */
  markAllAsRead: () =>
    http.post<void>('/user/notices/read-all')
}

export default userNoticeApi
