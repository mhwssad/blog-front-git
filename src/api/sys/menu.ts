/**
 * 菜单管理模块 API
 * 基于 auth-api.md 文档 第4节
 */

import { http } from '../request'
import type {
  SysMenuAdminVO,
  SysMenuSaveRequest
} from '../types'

/**
 * 菜单管理 API
 */
export const menuApi = {
  /**
   * 4.1 查询菜单树
   * GET /api/sys/menus/tree
   */
  getMenuTree: () =>
    http.get<SysMenuAdminVO[]>('/sys/menus/tree'),

  /**
   * 4.2 查询菜单详情
   * GET /api/sys/menus/{id}
   */
  getMenuById: (id: number) =>
    http.get<SysMenuAdminVO>(`/sys/menus/${id}`),

  /**
   * 4.3 新增菜单
   * POST /api/sys/menus
   */
  createMenu: (data: SysMenuSaveRequest) =>
    http.post<void>('/sys/menus', data),

  /**
   * 4.4 修改菜单
   * PUT /api/sys/menus/{id}
   */
  updateMenu: (id: number, data: SysMenuSaveRequest) =>
    http.put<void>(`/sys/menus/${id}`, data),

  /**
   * 4.5 删除菜单
   * DELETE /api/sys/menus/{id}
   */
  deleteMenu: (id: number) =>
    http.delete<void>(`/sys/menus/${id}`)
}

export default menuApi
