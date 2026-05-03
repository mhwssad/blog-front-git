/**
 * 角色管理模块 API
 * 基于 auth-api.md 文档 8.2 节
 */

import { http } from '../request'
import type {
  RoleQueryRequest,
  SysRoleAdminVO,
  SysRoleSaveRequest,
  StatusUpdateRequest,
  RoleMenuAssignRequest,
  PageResult,
} from '@/types/api-types'

/**
 * 角色管理 API
 * 提供角色的增删改查和菜单分配操作
 */
export class RoleApi {
  /**
   * 3.1 分页查询角色列表
   * GET /api/sys/roles
   */
  static getRoles(params?: RoleQueryRequest) {
    return http.get<PageResult<SysRoleAdminVO>>('/sys/roles', params)
  }

  /**
   * 3.2 查询角色详情
   * GET /api/sys/roles/{id}
   */
  static getRoleById(id: number) {
    return http.get<SysRoleAdminVO>(`/sys/roles/${id}`)
  }

  /**
   * 3.3 新增角色
   * POST /api/sys/roles
   */
  static createRole(data: SysRoleSaveRequest) {
    return http.post<void>('/sys/roles', data)
  }

  /**
   * 3.4 修改角色
   * PUT /api/sys/roles/{id}
   */
  static updateRole(id: number, data: SysRoleSaveRequest) {
    return http.put<void>(`/sys/roles/${id}`, data)
  }

  /**
   * 3.5 修改角色状态
   * PUT /api/sys/roles/{id}/status
   */
  static updateRoleStatus(id: number, data: StatusUpdateRequest) {
    return http.put<void>(`/sys/roles/${id}/status`, data)
  }

  /**
   * 3.6 删除角色
   * DELETE /api/sys/roles/{id}
   */
  static deleteRole(id: number) {
    return http.delete<void>(`/sys/roles/${id}`)
  }

  /**
   * 3.7 查询角色菜单列表
   * GET /api/sys/roles/{id}/menus
   */
  static getRoleMenus(id: number) {
    return http.get<number[]>(`/sys/roles/${id}/menus`)
  }

  /**
   * 3.8 分配角色菜单
   * PUT /api/sys/roles/{id}/menus
   */
  static assignRoleMenus(id: number, data: RoleMenuAssignRequest) {
    return http.put<void>(`/sys/roles/${id}/menus`, data)
  }
}

export default RoleApi
