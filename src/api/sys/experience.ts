/**
 * 经验体系管理 API
 * 基于 auth-api.md 文档 8.8 节
 */

import { http } from '../request'
import type {
  PageResult,
  UserExperienceSummaryVO,
  ExperienceLogVO,
  UserLevelAdjustRequest,
  ExperienceSourceConfigVO,
  ExperienceSourceConfigRequest,
} from '@/types/api-types'

export class ExperienceSysApi {
  /**
   * 查看用户经验来源汇总
   * GET /api/sys/experience/users/{userId}/summary
   */
  static getUserSummary(userId: number) {
    return http.get<UserExperienceSummaryVO>(`/sys/experience/users/${userId}/summary`)
  }

  /**
   * 经验流水分页查询
   * GET /api/sys/experience/logs
   */
  static getLogs(params?: { current?: number; size?: number; userId?: number; sourceType?: string }) {
    return http.get<PageResult<ExperienceLogVO>>('/sys/experience/logs', params)
  }

  /**
   * 手动调整等级或经验
   * POST /api/sys/experience/users/{userId}/adjust
   */
  static adjustUserLevel(userId: number, data: UserLevelAdjustRequest) {
    return http.post<void>(`/sys/experience/users/${userId}/adjust`, data)
  }

  /**
   * 查看经验来源配置
   * GET /api/sys/experience/config
   */
  static getConfig() {
    return http.get<ExperienceSourceConfigVO[]>('/sys/experience/config')
  }

  /**
   * 更新经验来源配置
   * PUT /api/sys/experience/config
   */
  static updateConfig(data: ExperienceSourceConfigRequest) {
    return http.put<void>('/sys/experience/config', data)
  }
}

export default ExperienceSysApi
