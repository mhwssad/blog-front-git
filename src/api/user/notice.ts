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
 * 用于前台页面展示当前登录用户的通知
 */
export class UserNoticeApi {
  /**
   * 7.1 分页查询我的通知列表
   * GET /api/user/notices
   */
  static getMyNotices(params?: UserNoticeQueryRequest) {
    return http.get<PageResult<UserNoticeVO>>('/user/notices', params)
  }

  /**
   * 7.2 获取通知详情
   * GET /api/user/notices/{id}
   */
  static getMyNoticeById(id: number) {
    return http.get<UserNoticeVO>(`/user/notices/${id}`)
  }

  /**
   * 7.3 获取未读通知数量
   * GET /api/user/notices/unread-count
   */
  static getUnreadCount() {
    return http.get<number>('/user/notices/unread-count')
  }

  /**
   * 7.4 标记单条通知为已读
   * POST /api/user/notices/{id}/read
   */
  static markAsRead(id: number) {
    return http.post<void>(`/user/notices/${id}/read`)
  }

  /**
   * 7.5 标记全部通知为已读
   * POST /api/user/notices/read-all
   */
  static markAllAsRead() {
    return http.post<void>('/user/notices/read-all')
  }
}

export default UserNoticeApi
