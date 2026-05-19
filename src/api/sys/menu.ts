/**
 * 菜单管理模块 API
 * 基于 auth-api.md 文档 8.3 节
 * @see docs/api文档/auth-api.md
 */

import { http } from '../request'
import type { SysMenuAdminVO, SysMenuSaveRequest } from '@/types/api-types'

/**
 * 菜单管理 API
 * 提供菜单的增删改查操作
 */
export class MenuApi {
  /**
   * 4.1 查询菜单树
   * GET /api/sys/menus/tree
   */
  static getMenuTree() {
    return http.get<SysMenuAdminVO[]>('/sys/menus/tree')
  }

  /**
   * 4.2 查询菜单详情
   * GET /api/sys/menus/{id}
   */
  static getMenuById(id: number) {
    return http.get<SysMenuAdminVO>(`/sys/menus/${id}`)
  }

  /**
   * 4.3 新增菜单
   * POST /api/sys/menus
   */
  static createMenu(data: SysMenuSaveRequest) {
    return http.post<void>('/sys/menus', data)
  }

  /**
   * 4.4 修改菜单
   * PUT /api/sys/menus/{id}
   */
  static updateMenu(id: number, data: SysMenuSaveRequest) {
    return http.put<void>(`/sys/menus/${id}`, data)
  }

  /**
   * 4.5 删除菜单
   * DELETE /api/sys/menus/{id}
   */
  static deleteMenu(id: number) {
    return http.delete<void>(`/sys/menus/${id}`)
  }
}

export default MenuApi
