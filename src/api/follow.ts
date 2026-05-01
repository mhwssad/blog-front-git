/**
 * 公开关注关系 API
 * 用于前台页面展示用户关注关系
 */

import { http } from './request'
import type {
  PageResult,
  PublicAuthorProfileVO,
  PublicFollowPageQueryRequest,
  PublicFollowUserVO,
} from '@/types/api-types'

/**
 * 公开关注 API
 * 用于获取用户关注列表、粉丝列表等公开信息
 */
export class FollowApi {
  /**
   * 获取用户的关注列表
   * GET /api/users/{userId}/follows
   */
  static getUserFollows(userId: number, params?: PublicFollowPageQueryRequest) {
    return http.get<PageResult<PublicFollowUserVO>>(`/users/${userId}/follows`, params)
  }

  /**
   * 获取用户的粉丝列表
   * GET /api/users/{userId}/fans
   */
  static getUserFans(userId: number, params?: PublicFollowPageQueryRequest) {
    return http.get<PageResult<PublicFollowUserVO>>(`/users/${userId}/fans`, params)
  }

  /**
   * 查询公开作者主页摘要
   * GET /api/users/{userId}/author-profile
   */
  static getAuthorProfile(userId: number) {
    return http.get<PublicAuthorProfileVO>(`/users/${userId}/author-profile`)
  }
}

export default FollowApi
