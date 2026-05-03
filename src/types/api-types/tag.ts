/**
 * 标签管理类型（后台 + 前台公开）
 * @module api-types/tag
 * @see docs/api文档/content-api.md
 */

// ==================== 后台标签管理 ====================

/**
 * 后台标签视图对象
 * @description 后台标签完整信息
 * @interface TagVO
 * @see GET /api/sys/tags - 响应项
 * @see GET /api/sys/tags/{id} - 响应
 */
export interface TagVO {
  /** 标签ID */
  id: number
  /** 标签名称 */
  name: string
  /** 标签颜色 */
  color?: string | null
  /** 创建时间 */
  createdAt?: string
}

/**
 * 保存标签请求
 * @description 创建或更新标签
 * @interface TagSaveRequest
 * @see POST /api/sys/tags - 请求体
 * @see PUT /api/sys/tags/{id} - 请求体
 */
export interface TagSaveRequest {
  /** 标签名称，全局唯一 */
  name: string
  /** 标签颜色 */
  color?: string
}

// ==================== 前台公开标签 ====================

/**
 * 前台标签查询请求
 * @description 前台查询标签列表
 * @interface PublicTagQueryRequest
 * @see GET /api/tags - 查询参数
 */
export interface PublicTagQueryRequest {
  /** 目标类型，默认article */
  targetType?: string
}

/**
 * 公开标签视图对象
 * @description 前台公开的标签信息
 * @interface PublicTagVO
 * @see GET /api/tags - 响应项
 */
export interface PublicTagVO {
  /** 标签ID */
  id: number
  /** 标签名称 */
  name: string
  /** 标签颜色 */
  color?: string | null
}