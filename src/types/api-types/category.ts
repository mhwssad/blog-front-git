/**
 * 分类管理类型（后台 + 前台公开）
 * @module api-types/category
 * @see docs/api文档/content-api.md
 */

// ==================== 后台分类管理 ====================

/**
 * 保存分类请求
 * @description 创建或更新分类
 * @interface CategorySaveRequest
 * @see POST /api/sys/categories - 请求体
 * @see PUT /api/sys/categories/{id} - 请求体
 */
export interface CategorySaveRequest {
  /** 父分类ID，根节点传0 */
  parentId: number
  /** 分类名称 */
  name: string
  /** 分类编码 */
  code: string
  /** 分类类型，当前固定为 article */
  type: string
  /** 排序值 */
  sortOrder?: number
  /** 图标 */
  icon?: string
  /** 描述 */
  description?: string
  /** 状态：0-禁用，1-启用 */
  status?: number
}

/**
 * 后台分类视图对象
 * @description 后台分类完整信息
 * @interface CategoryAdminVO
 * @see GET /api/sys/categories/tree - 响应项
 * @see GET /api/sys/categories/{id} - 响应
 */
export interface CategoryAdminVO {
  /** 分类ID */
  id: number
  /** 父分类ID */
  parentId: number
  /** 分类名称 */
  name: string
  /** 分类编码 */
  code: string
  /** 分类类型，当前固定为 article */
  type: string
  /** 祖先路径 */
  ancestors?: string
  /** 层级 */
  level?: number
  /** 排序值 */
  sortOrder?: number
  /** 图标 */
  icon?: string | null
  /** 描述 */
  description?: string | null
  /** 状态：0-禁用，1-启用 */
  status: number
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
  /** 子节点 */
  children?: CategoryAdminVO[]
}

// ==================== 前台公开分类 ====================

/**
 * 公开分类树视图对象
 * @description 前台分类导航树节点
 * @interface PublicCategoryTreeVO
 * @see GET /api/categories/tree - 响应
 */
export interface PublicCategoryTreeVO {
  /** 分类ID */
  id: number
  /** 父分类ID */
  parentId: number
  /** 分类名称 */
  name: string
  /** 分类编码 */
  code: string
  /** 分类类型，当前固定为 article */
  type: string
  /** 层级 */
  level?: number
  /** 排序值 */
  sortOrder?: number
  /** 图标 */
  icon?: string | null
  /** 描述 */
  description?: string | null
  /** 子节点 */
  children?: PublicCategoryTreeVO[]
}