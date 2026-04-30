/**
 * 关注关系管理模块 API
 * 基于 auth-api.md 文档
 */

import { http } from '../request'
import type {
  FollowAdminQueryRequest,
  FollowAdminRelationVO,
  FollowRelationCleanRequest,
  PageResult,
} from '@/types/api-types'

/**
 * 系统关注关系管理 API
 * 提供关注关系的查询和清理操作
 */
export class SysFollowApi {
  /**
   * 分页查询关注关系列表
   * GET /api/sys/follows
   */
  static getFollows(params?: FollowAdminQueryRequest) {
    return http.get<PageResult<FollowAdminRelationVO>>('/sys/follows', params)
  }

  /**
   * 清理关注关系
   * DELETE /api/sys/follows/clean
   */
  static cleanFollows(data: FollowRelationCleanRequest) {
    return http.delete<number>('/sys/follows/clean', undefined, { data })
  }
}

export default SysFollowApi
