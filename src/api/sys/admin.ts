/**
 * 超级管理员操作 API
 * 基于 auth-api.md 文档第 10 节
 */

import { http } from '../request'
import type {
  MfaVerifyRequest,
  MfaVerifyResponse,
  BanUserRequest,
  AdjustLevelRequest,
  AdjustExperienceRequest,
  AccountTakeoverRequest,
  AccountTakeoverResponse,
  UserRoleAuditAssignRequest,
} from '@/types/api-types'

export class AdminApi {
  /**
   * 发送 2FA 验证码
   * POST /api/admin/2fa/send-code
   */
  static sendMfaCode() {
    return http.post<void>('/admin/2fa/send-code')
  }

  /**
   * 校验 2FA 验证码
   * POST /api/admin/2fa/verify
   */
  static verifyMfa(data: MfaVerifyRequest) {
    return http.post<MfaVerifyResponse>('/admin/2fa/verify', data)
  }

  /**
   * 封禁用户
   * POST /api/admin/users/{id}/ban
   */
  static banUser(id: number, data: BanUserRequest) {
    return http.post<void>(`/admin/users/${id}/ban`, data)
  }

  /**
   * 解封用户
   * POST /api/admin/users/{id}/unban
   */
  static unbanUser(id: number, data: BanUserRequest) {
    return http.post<void>(`/admin/users/${id}/unban`, data)
  }

  /**
   * 调整用户等级
   * PUT /api/admin/users/{id}/level
   */
  static adjustUserLevel(id: number, data: AdjustLevelRequest) {
    return http.put<void>(`/admin/users/${id}/level`, data)
  }

  /**
   * 调整用户经验
   * PUT /api/admin/users/{id}/experience
   */
  static adjustUserExperience(id: number, data: AdjustExperienceRequest) {
    return http.put<void>(`/admin/users/${id}/experience`, data)
  }

  /**
   * 账号接管
   * POST /api/admin/takeover
   */
  static takeoverAccount(data: AccountTakeoverRequest) {
    return http.post<AccountTakeoverResponse>('/admin/takeover', data)
  }

  /**
   * 带审计的角色分配
   * PUT /api/admin/users/{id}/roles
   */
  static assignRolesWithAudit(id: number, data: UserRoleAuditAssignRequest) {
    return http.put<void>(`/admin/users/${id}/roles`, data)
  }
}

export default AdminApi
