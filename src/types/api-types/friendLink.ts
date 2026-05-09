/**
 * 友情链接类型
 * @module api-types/friendLink
 * @see docs/api文档/content-api.md
 */

/**
 * 友情链接视图对象（公开）
 * @see GET /api/public/friend-links - 响应项
 */
export interface FriendLinkVO {
  /** ID */
  id: number
  /** 站点名称 */
  name: string
  /** 站点地址 */
  url: string
  /** 图标地址 */
  iconUrl?: string
  /** 站点描述 */
  description?: string
  /** 排序值 */
  sortOrder?: number
  /** 状态：0-停用，1-启用 */
  status?: number
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
}

/**
 * 保存友情链接请求
 * @see POST /api/sys/friend-links - 请求体
 * @see PUT /api/sys/friend-links/{id} - 请求体
 */
export interface FriendLinkSaveRequest {
  /** 站点名称，最多64字符 */
  name: string
  /** 站点地址，需以http://或https://开头 */
  url: string
  /** 图标地址 */
  iconUrl?: string
  /** 站点描述，最多255字符 */
  description?: string
  /** 排序值 */
  sortOrder?: number
}

/**
 * 友情链接查询请求
 * @see GET /api/sys/friend-links - 查询参数
 */
export interface FriendLinkQueryRequest {
  current?: number
  size?: number
  /** 站点名称（模糊匹配） */
  name?: string
  /** 状态：0-停用，1-启用 */
  status?: number
}
