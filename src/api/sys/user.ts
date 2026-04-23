import { http } from '../request'
import type {
  UserQueryRequest,
  SysUserAdminVO,
  SysUserSaveRequest,
  StatusUpdateRequest,
  PasswordResetRequest,
  UserRoleAssignRequest,
  PageResult,
} from '../types'

/**
 * 用户管理 API
 */
export const userApi = {
  /**
   * 2.1 分页查询用户
   * GET /api/sys/users
   */
  getUsers: (params?: UserQueryRequest) =>
    http.get<PageResult<SysUserAdminVO>>('/sys/users', params),

  /**
   * 2.2 查询用户详情
   * GET /api/sys/users/{id}
   */
  getUserById: (id: number) => http.get<SysUserAdminVO>(`/sys/users/${id}`),

  /**
   * 2.3 新增用户
   * POST /api/sys/users
   */
  createUser: (data: SysUserSaveRequest) => http.post<void>('/sys/users', data),

  /**
   * 2.4 修改用户
   * PUT /api/sys/users/{id}
   */
  updateUser: (id: number, data: SysUserSaveRequest) => http.put<void>(`/sys/users/${id}`, data),

  /**
   * 2.5 修改用户状态
   * PUT /api/sys/users/{id}/status
   */
  updateUserStatus: (id: number, data: StatusUpdateRequest) =>
    http.put<void>(`/sys/users/${id}/status`, data),

  /**
   * 2.6 重置用户密码
   * PUT /api/sys/users/{id}/password/reset
   */
  resetUserPassword: (id: number, data: PasswordResetRequest) =>
    http.put<void>(`/sys/users/${id}/password/reset`, data),

  /**
   * 2.7 删除用户
   * DELETE /api/sys/users/{id}
   */
  deleteUser: (id: number) => http.delete<void>(`/sys/users/${id}`),

  /**
   * 2.8 查询用户角色
   * GET /api/sys/users/{id}/roles
   */
  getUserRoles: (id: number) => http.get<number[]>(`/sys/users/${id}/roles`),

  /**
   * 2.9 分配用户角色
   * PUT /api/sys/users/{id}/roles
   */
  assignUserRoles: (id: number, data: UserRoleAssignRequest) =>
    http.put<void>(`/sys/users/${id}/roles`, data),
}

export default userApi
