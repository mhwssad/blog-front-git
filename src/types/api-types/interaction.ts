/**
 * 互动管理类型
 * @module api-types/interaction
 * @see docs/api文档/content-api.md
 */

// ==================== 后台互动管理 ====================

/**
 * 互动查询请求
 * @description 后台分页查询互动记录
 * @interface InteractionQueryRequest
 * @see GET /api/sys/interactions - 查询参数
 */
export interface InteractionQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10 */
  size?: number
  /** 用户ID */
  userId?: number
  /** 目标ID（如文章ID） */
  targetId?: number
  /** 目标类型（如article） */
  targetType?: string
  /** 互动类型，当前主要为like */
  actionType?: string
}

/**
 * 互动视图对象
 * @description 互动记录详情
 * @interface InteractionVO
 * @see GET /api/sys/interactions - 响应项
 * @see DELETE /api/sys/interactions/{id} - 响应
 */
export interface InteractionVO {
  /** 互动记录ID */
  id: number
  /** 用户ID */
  userId: number
  /** 目标ID（如文章ID） */
  targetId: number
  /** 目标类型（如article） */
  targetType: string
  /** 互动类型，当前主要为like */
  actionType: string
  /** 创建时间 */
  createdAt: string
}