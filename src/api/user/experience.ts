/**
 * 用户经验等级 API
 * 基于 auth-api.md 文档 7.2 节
 */

import { http } from '../request'
import type { UserLevelInfoVO } from '@/types/api-types'

export class ExperienceUserApi {
  /**
   * 查看当前等级信息
   * GET /api/user/experience/level
   */
  static getLevelInfo() {
    return http.get<UserLevelInfoVO>('/user/experience/level')
  }
}

export default ExperienceUserApi
