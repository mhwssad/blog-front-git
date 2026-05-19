/**
 * 用户管理模块 API
 * 基于 auth-api.md 文档 8.1 节
 * @see docs/api文档/auth-api.md
 */

import { http } from '../request'
import type {
  UserQueryRequest,
  SysUserAdminVO,
  SysUserSaveRequest,
  StatusUpdateRequest,
  PasswordResetRequest,
  UserRoleAssignRequest,
  PageResult,
} from '@/types/api-types'

/**
 * 用户管理 API
 * 提供用户的增删改查和角色分配操作
 */
export class UserApi {
  /**
   * 2.1 分页查询用户列表
   * GET /api/sys/users
   */
  static getUsers(params?: UserQueryRequest) {
    return http.get<PageResult<SysUserAdminVO>>('/sys/users', params)
  }

  /**
   * 2.2 查询用户详情
   * GET /api/sys/users/{id}
   */
  static getUserById(id: number) {
    return http.get<SysUserAdminVO>(`/sys/users/${id}`)
  }

  /**
   * 2.3 新增用户
   * POST /api/sys/users
   */
  static createUser(data: SysUserSaveRequest) {
    return http.post<void>('/sys/users', data)
  }

  /**
   * 2.4 修改用户
   * PUT /api/sys/users/{id}
   */
  static updateUser(id: number, data: SysUserSaveRequest) {
    return http.put<void>(`/sys/users/${id}`, data)
  }

  /**
   * 2.5 修改用户状态
   * PUT /api/sys/users/{id}/status
   */
  static updateUserStatus(id: number, data: StatusUpdateRequest) {
    return http.put<void>(`/sys/users/${id}/status`, data)
  }

  /**
   * 2.6 重置用户密码
   * PUT /api/sys/users/{id}/password/reset
   */
  static resetUserPassword(id: number, data: PasswordResetRequest) {
    return http.put<void>(`/sys/users/${id}/password/reset`, data)
  }

  /**
   * 2.7 删除用户
   * DELETE /api/sys/users/{id}
   */
  static deleteUser(id: number) {
    return http.delete<void>(`/sys/users/${id}`)
  }

  /**
   * 2.8 查询用户角色列表
   * GET /api/sys/users/{id}/roles
   */
  static getUserRoles(id: number) {
    return http.get<number[]>(`/sys/users/${id}/roles`)
  }

  /**
   * 2.9 分配用户角色
   * PUT /api/sys/users/{id}/roles
   */
  static assignUserRoles(id: number, data: UserRoleAssignRequest) {
    return http.put<void>(`/sys/users/${id}/roles`, data)
  }
}

export default UserApi
