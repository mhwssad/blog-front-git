/**
 * 足迹管理类型
 * @module api-types/footprint
 * @see docs/api文档/content-api.md
 */

// ==================== 后台足迹管理 ====================

/**
 * 足迹查询请求
 * @description 后台分页查询足迹列表
 * @interface FootprintQueryRequest
 * @see GET /api/sys/footprints - 查询参数
 */
export interface FootprintQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10 */
  size?: number
  /** 用户ID */
  userId?: number
  /** 目标ID（如文章ID） */
  targetId?: number
  /** 目标类型，当前固定为article */
  targetType?: string
  /** 访问开始时间 */
  visitedAtStart?: string
  /** 访问结束时间 */
  visitedAtEnd?: string
}

/**
 * 足迹视图对象
 * @description 足迹记录详情
 * @interface FootprintVO
 * @see GET /api/sys/footprints - 响应项
 * @see DELETE /api/sys/footprints/{id} - 响应
 */
export interface FootprintVO {
  /** 足迹ID */
  id: number
  /** 用户ID */
  userId: number
  /** 目标ID（如文章ID） */
  targetId: number
  /** 目标类型，当前固定为article */
  targetType: string
  /** 目标标题 */
  targetTitle?: string | null
  /** 目标链接 */
  targetUrl?: string | null
  /** IP地址 */
  ipAddress?: string | null
  /** User-Agent */
  userAgent?: string | null
  /** 最近访问时间 */
  visitedAt: string
}

// ==================== 用户足迹 ====================

/**
 * 用户足迹查询请求
 * @description 用户分页查询自己的足迹
 * @interface UserFootprintQueryRequest
 * @see GET /api/user/footprints - 查询参数
 */
export interface UserFootprintQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10 */
  size?: number
  /** 目标类型，当前固定为article */
  targetType?: string
  /** 关键词搜索（匹配标题） */
  keyword?: string
  /** 访问开始时间 */
  visitedAtStart?: string
  /** 访问结束时间 */
  visitedAtEnd?: string
}

/**
 * 用户足迹视图对象
 * @description 用户查看自己的足迹记录
 * @interface UserFootprintVO
 * @see GET /api/user/footprints - 响应项
 * @see DELETE /api/user/footprints/{id} - 响应
 */
export interface UserFootprintVO {
  /** 足迹ID */
  id: number
  /** 目标ID（如文章ID） */
  targetId: number
  /** 目标类型，当前固定为article */
  targetType: string
  /** 目标标题 */
  targetTitle?: string | null
  /** 目标链接 */
  targetUrl?: string | null
  /** 最近访问时间 */
  visitedAt: string
}