/**
 * 用户作者申请 API
 * 基于 auth-api.md 文档第 6 节
 */

import { http } from '../request'
import type {
  PageResult,
  UserAuthorApplicationSubmitRequest,
  UserAuthorApplicationVO,
} from '@/types/api-types'

export class AuthorApplicationUserApi {
  /**
   * 提交作者申请
   * POST /api/user/author-applications
   */
  static submitApplication(data: UserAuthorApplicationSubmitRequest) {
    return http.post<void>('/user/author-applications', data)
  }

  /**
   * 查看最近一次申请
   * GET /api/user/author-applications/latest
   */
  static getLatestApplication() {
    return http.get<UserAuthorApplicationVO | null>('/user/author-applications/latest')
  }

  /**
   * 查看我的申请记录
   * GET /api/user/author-applications
   */
  static getApplications(params?: { current?: number; size?: number }) {
    return http.get<PageResult<UserAuthorApplicationVO>>('/user/author-applications', params)
  }
}

export default AuthorApplicationUserApi
