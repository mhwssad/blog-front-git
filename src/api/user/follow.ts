/**
 * 用户关注关系 API
 * 基于 follow-api.md 文档
 */

import { http } from '../request'
import type {
  PageResult,
  UserFollowCountVO,
  UserFollowMutualVO,
  UserFollowPageQueryRequest,
  UserFollowRemarkUpdateRequest,
  UserFollowSpecialUpdateRequest,
  UserFollowUserVO,
} from '@/types/api-types'

/**
 * 用户关注 API
 * 提供关注/取关、关注列表、粉丝列表等功能
 */
export class UserFollowApi {
  /**
   * 5.1 关注用户
   * POST /api/user/follows/{userId}
   */
  static followUser(userId: number) {
    return http.post<void>(`/user/follows/${userId}`)
  }

  /**
   * 5.2 取关用户
   * DELETE /api/user/follows/{userId}
   */
  static unfollowUser(userId: number) {
    return http.delete<void>(`/user/follows/${userId}`)
  }

  /**
   * 5.3 获取我的关注列表
   * GET /api/user/follows
   */
  static getMyFollows(params?: UserFollowPageQueryRequest) {
    return http.get<PageResult<UserFollowUserVO>>('/user/follows', params)
  }

  /**
   * 5.4 获取我的粉丝列表
   * GET /api/user/fans
   */
  static getMyFans(params?: Pick<UserFollowPageQueryRequest, 'current' | 'size'>) {
    return http.get<PageResult<UserFollowUserVO>>('/user/fans', params)
  }

  /**
   * 5.5 获取互相关注状态
   * GET /api/user/follows/mutual?targetUserId={targetUserId}
   */
  static getMutualStatus(targetUserId: number) {
    return http.get<UserFollowMutualVO>('/user/follows/mutual', { targetUserId })
  }

  /**
   * 5.6 获取我的关注统计
   * GET /api/user/follows/count
   */
  static getFollowCount() {
    return http.get<UserFollowCountVO>('/user/follows/count')
  }

  /**
   * 5.7 更新特别关注状态
   * PUT /api/user/follows/{userId}/special
   */
  static updateSpecialFollow(userId: number, data: UserFollowSpecialUpdateRequest) {
    return http.put<void>(`/user/follows/${userId}/special`, data)
  }

  /**
   * 5.8 更新关注备注
   * PUT /api/user/follows/{userId}/remark
   */
  static updateFollowRemark(userId: number, data: UserFollowRemarkUpdateRequest) {
    return http.put<void>(`/user/follows/${userId}/remark`, data)
  }
}

export default UserFollowApi
