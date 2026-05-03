/**
 * 收藏管理类型
 * @module api-types/collection
 * @see docs/api文档/content-api.md
 */

// ==================== 后台收藏管理 ====================

/**
 * 后台收藏夹查询请求
 * @description 后台分页查询收藏夹列表
 * @interface CollectionFolderQueryRequest
 * @see GET /api/sys/collections/folders - 查询参数
 */
export interface CollectionFolderQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10 */
  size?: number
  /** 用户ID */
  userId?: number
  /** 收藏夹ID */
  folderId?: number
  /** 目标ID（如文章ID） */
  targetId?: number
  /** 目标类型，当前固定为 article */
  targetType?: string
}

/**
 * 收藏夹视图对象
 * @description 收藏夹完整信息
 * @interface CollectionFolderVO
 * @see GET /api/sys/collections/folders - 响应项
 * @see GET /api/user/collection-folders - 响应项
 */
export interface CollectionFolderVO {
  /** 收藏夹ID */
  id: number
  /** 用户ID */
  userId: number
  /** 收藏夹名称 */
  folderName: string
  /** 收藏夹类型，当前固定为 article */
  folderType: string
  /** 描述 */
  description?: string | null
  /** 是否公开：0-否，1-是 */
  isPublic: number
  /** 是否默认收藏夹：0-否，1-是 */
  isDefault: number
  /** 排序值 */
  sortOrder: number
  /** 收藏数量 */
  collectionCount: number
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
}

/**
 * 收藏记录视图对象
 * @description 收藏记录详情
 * @interface CollectionVO
 * @see GET /api/sys/collections - 响应项
 * @see GET /api/user/collections - 响应项
 */
export interface CollectionVO {
  /** 收藏记录ID */
  id: number
  /** 用户ID */
  userId: number
  /** 收藏夹ID */
  folderId: number
  /** 目标ID（如文章ID） */
  targetId: number
  /** 目标类型，当前固定为 article */
  targetType: string
  /** 备注 */
  remark?: string | null
  /** 目标标题 */
  targetTitle?: string | null
  /** 目标链接 */
  targetUrl?: string | null
  /** 创建时间 */
  createdAt: string
}

// ==================== 用户收藏请求 ====================

/**
 * 保存收藏夹请求
 * @description 用户创建或更新收藏夹
 * @interface CollectionFolderSaveRequest
 * @see POST /api/user/collection-folders - 请求体
 * @see PUT /api/user/collection-folders/{id} - 请求体
 */
export interface CollectionFolderSaveRequest {
  /** 收藏夹名称 */
  folderName: string
  /** 收藏夹类型，当前固定为 article */
  folderType: string
  /** 描述 */
  description?: string
  /** 是否公开：0-否，1-是 */
  isPublic?: number
  /** 是否默认收藏夹：0-否，1-是 */
  isDefault?: number
  /** 排序值 */
  sortOrder?: number
}

/**
 * 保存收藏请求
 * @description 用户添加收藏
 * @interface CollectionSaveRequest
 * @see POST /api/user/collections - 请求体
 */
export interface CollectionSaveRequest {
  /** 收藏夹ID，不传时自动落入默认收藏夹 */
  folderId?: number
  /** 目标ID（如文章ID） */
  targetId: number
  /** 目标类型，当前固定为 article */
  targetType: string
  /** 备注 */
  remark?: string
}

/**
 * 用户收藏夹查询请求
 * @description 用户分页查询自己的收藏夹
 * @interface UserCollectionQueryRequest
 * @see GET /api/user/collection-folders - 查询参数
 */
export interface UserCollectionQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10 */
  size?: number
}