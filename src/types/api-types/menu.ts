/**
 * 菜单管理类型
 * @module api-types/menu
 * @see docs/api文档/auth-api.md
 */

// ==================== 后台菜单管理 ====================

/**
 * 后台菜单视图对象
 * @description 后台菜单树节点
 * @interface SysMenuAdminVO
 * @see GET /api/sys/menus/tree - 响应项
 * @see GET /api/sys/menus/{id} - 响应
 */
export interface SysMenuAdminVO {
  /** 菜单ID */
  id: number
  /** 父菜单ID */
  parentId: number
  /** 树路径 */
  treePath?: string
  /** 菜单名称 */
  name: string
  /** 路由名称 */
  routeName?: string
  /** 路由路径 */
  routePath?: string
  /** 前端组件路径 */
  component?: string | null
  /** 权限标识 */
  perm?: string | null
  /** 是否始终显示：0-否，1-是 */
  alwaysShow?: number
  /** 是否缓存：0-否，1-是 */
  keepAlive?: number
  /** 图标 */
  icon?: string | null
  /** 菜单类型：C-目录，M-菜单，B-按钮 */
  type: 'C' | 'M' | 'B' | string
  /** 排序 */
  sort: number
  /** 是否显示：0-隐藏，1-显示 */
  visible: number
  /** 重定向路径 */
  redirect?: string | null
  /** 额外路由参数 */
  params?: Record<string, string> | null
  /** 菜单状态 */
  status?: number
  /** 子节点 */
  children?: SysMenuAdminVO[]
}

/**
 * 保存菜单请求
 * @description 创建或更新菜单
 * @interface SysMenuSaveRequest
 * @see POST /api/sys/menus - 请求体
 * @see PUT /api/sys/menus/{id} - 请求体
 */
export interface SysMenuSaveRequest {
  /** 父菜单ID，根节点传0 */
  parentId: number
  /** 树路径 */
  treePath?: string
  /** 菜单名称 */
  name: string
  /** 菜单类型：C/M/B */
  type: 'C' | 'M' | 'B' | string
  /** 路由名称 */
  routeName?: string
  /** 路由路径 */
  routePath?: string
  /** 组件路径 */
  component?: string
  /** 权限标识 */
  perm?: string
  /** 是否始终显示：0-否，1-是 */
  alwaysShow?: number
  /** 是否缓存：0-否，1-是 */
  keepAlive?: number
  /** 图标 */
  icon?: string
  /** 排序 */
  sort?: number
  /** 是否显示：0-隐藏，1-显示 */
  visible?: number
  /** 重定向路径 */
  redirect?: string
  /** 额外路由参数 */
  params?: Record<string, string> | null
}