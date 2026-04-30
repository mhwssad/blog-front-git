/**
 * 用户通知设置 API
 * 基于 auth-api.md 文档 7.1 节
 */

import { http } from '../request'
import type {
  UserNotificationSettingItemVO,
  UserNotificationSettingBatchUpdateRequest,
  UserNotificationSettingStatusUpdateRequest,
} from '@/types/api-types'

export class NotificationSettingsApi {
  /**
   * 查询我的通知设置
   * GET /api/user/notification-settings
   */
  static getSettings() {
    return http.get<UserNotificationSettingItemVO[]>('/user/notification-settings')
  }

  /**
   * 批量更新通知设置
   * PUT /api/user/notification-settings
   */
  static batchUpdateSettings(data: UserNotificationSettingBatchUpdateRequest) {
    return http.put<void>('/user/notification-settings', data)
  }

  /**
   * 更新单类通知设置
   * PUT /api/user/notification-settings/{type}
   */
  static updateSettingByType(type: string, data: UserNotificationSettingStatusUpdateRequest) {
    return http.put<void>(`/user/notification-settings/${type}`, data)
  }
}

export default NotificationSettingsApi
