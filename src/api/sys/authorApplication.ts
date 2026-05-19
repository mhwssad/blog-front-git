/**
 * 作者申请后台管理 API
 * 基于 auth-api.md 文档 8.7 节
 * @see docs/api文档/auth-api.md
 */

import { http } from '../request'
import type {
  PageResult,
  SysAuthorApplicationAdminPageQuery,
  SysAuthorApplicationAdminVO,
  SysAuthorApplicationAdminReviewRequest,
  SysAuthorApplicationRepairRequest,
} from '@/types/api-types'

export class AuthorApplicationSysApi {
  /**
   * 分页查询作者申请
   * GET /api/sys/author-applications
   */
  static getApplications(params?: SysAuthorApplicationAdminPageQuery) {
    return http.get<PageResult<SysAuthorApplicationAdminVO>>('/sys/author-applications', params)
  }

  /**
   * 查询作者申请详情
   * GET /api/sys/author-applications/{id}
   */
  static getApplicationById(id: number) {
    return http.get<SysAuthorApplicationAdminVO>(`/sys/author-applications/${id}`)
  }

  /**
   * 审核作者申请
   * PUT /api/sys/author-applications/{id}/review
   */
  static reviewApplication(id: number, data: SysAuthorApplicationAdminReviewRequest) {
    return http.put<void>(`/sys/author-applications/${id}/review`, data)
  }

  /**
   * 修正作者申请状态
   * PUT /api/sys/author-applications/{id}/repair
   */
  static repairApplication(id: number, data: SysAuthorApplicationRepairRequest) {
    return http.put<void>(`/sys/author-applications/${id}/repair`, data)
  }
}

export default AuthorApplicationSysApi
