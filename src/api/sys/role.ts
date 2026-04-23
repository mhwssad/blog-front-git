import { http } from '../request'
import type {
  RoleQueryRequest,
  SysRoleAdminVO,
  SysRoleSaveRequest,
  StatusUpdateRequest,
  RoleMenuAssignRequest,
  PageResult,
} from '../types'

/**
 * 角色管理 API
 */
export const roleApi = {
  /**
   * 3.1 分页查询角色
   * GET /api/sys/roles
   */
  getRoles: (params?: RoleQueryRequest) =>
    http.get<PageResult<SysRoleAdminVO>>('/sys/roles', params),

  /**
   * 3.2 查询角色详情
   * GET /api/sys/roles/{id}
   */
  getRoleById: (id: number) => http.get<SysRoleAdminVO>(`/sys/roles/${id}`),

  /**
   * 3.3 新增角色
   * POST /api/sys/roles
   */
  createRole: (data: SysRoleSaveRequest) => http.post<void>('/sys/roles', data),

  /**
   * 3.4 修改角色
   * PUT /api/sys/roles/{id}
   */
  updateRole: (id: number, data: SysRoleSaveRequest) => http.put<void>(`/sys/roles/${id}`, data),

  /**
   * 3.5 修改角色状态
   * PUT /api/sys/roles/{id}/status
   */
  updateRoleStatus: (id: number, data: StatusUpdateRequest) =>
    http.put<void>(`/sys/roles/${id}/status`, data),

  /**
   * 3.6 删除角色
   * DELETE /api/sys/roles/{id}
   */
  deleteRole: (id: number) => http.delete<void>(`/sys/roles/${id}`),

  /**
   * 3.7 查询角色菜单
   * GET /api/sys/roles/{id}/menus
   */
  getRoleMenus: (id: number) => http.get<number[]>(`/sys/roles/${id}/menus`),

  /**
   * 3.8 分配角色菜单
   * PUT /api/sys/roles/{id}/menus
   */
  assignRoleMenus: (id: number, data: RoleMenuAssignRequest) =>
    http.put<void>(`/sys/roles/${id}/menus`, data),
}

export default roleApi
