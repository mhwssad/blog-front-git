/**
 * 用户个人资料 API
 * @see docs/api文档/auth-api.md - 个人中心
 */

import { http } from '../request'
import type { UserProfileVO, UserProfileUpdateRequest, PasswordChangeRequest } from '@/types/api-types'

export class ProfileApi {
  /** 查看个人资料 GET /api/user/profile */
  static getProfile() {
    return http.get<UserProfileVO>('/user/profile')
  }

  /** 更新个人资料 PUT /api/user/profile */
  static updateProfile(data: UserProfileUpdateRequest) {
    return http.put<UserProfileVO>('/user/profile', data)
  }

  /** 修改密码 PUT /api/user/profile/password */
  static changePassword(data: PasswordChangeRequest) {
    return http.put<void>('/user/profile/password', data)
  }
}

export default ProfileApi
