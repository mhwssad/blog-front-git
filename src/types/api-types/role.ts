/**
 * 角色管理类型
 * @module api-types/role
 * @see docs/api文档/auth-api.md
 */

// ==================== 后台角色管理 ====================

/**
 * 角色查询请求
 * @description 后台分页查询角色列表
 * @interface RoleQueryRequest
 * @see GET /api/sys/roles - 查询参数
 */
export interface RoleQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10 */
  size?: number
  /** 角色名称 */
  name?: string
  /** 角色编码 */
  code?: string
  /** 角色状态 */
  status?: number
}

/**
 * 后台角色视图对象
 * @description 后台角色完整信息
 * @interface SysRoleAdminVO
 * @see GET /api/sys/roles - 响应项
 * @see GET /api/sys/roles/{id} - 响应
 * @see GET /api/sys/roles/{id}/menus - 响应
 */
export interface SysRoleAdminVO {
  /** 角色ID */
  id: number
  /** 角色名称 */
  name: string
  /** 角色编码 */
  code: string
  /** 显示顺序 */
  sort: number
  /** 状态：0-禁用，1-正常 */
  status: number
  /** 数据权限范围 */
  dataScope?: number
  /** 菜单ID列表 */
  menuIds?: number[]
  /** 备注 */
  remark?: string
  /** 创建时间 */
  createTime: string
}

/**
 * 保存角色请求
 * @description 创建或更新角色
 * @interface SysRoleSaveRequest
 * @see POST /api/sys/roles - 请求体
 * @see PUT /api/sys/roles/{id} - 请求体
 */
export interface SysRoleSaveRequest {
  /** 角色名称 */
  name: string
  /** 角色编码 */
  code: string
  /** 显示顺序 */
  sort?: number
  /** 状态：0-禁用，1-正常，默认1 */
  status?: number
  /** 数据权限范围 */
  dataScope?: number
  /** 菜单ID列表 */
  menuIds?: number[]
  /** 备注 */
  remark?: string
}

/**
 * 分配角色菜单请求
 * @description 为角色分配菜单权限
 * @interface RoleMenuAssignRequest
 * @see PUT /api/sys/roles/{id}/menus - 请求体
 */
export interface RoleMenuAssignRequest {
  /** 菜单ID列表 */
  menuIds: number[]
}