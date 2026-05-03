/**
 * 评论管理类型（后台 + 前台公开 + 用户提交）
 * @module api-types/comment
 * @see docs/api文档/content-api.md
 */

// ==================== 后台评论管理 ====================

/**
 * 后台评论查询请求
 * @description 后台分页查询评论列表
 * @interface CommentQueryRequest
 * @see GET /api/sys/comments - 查询参数
 */
export interface CommentQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10 */
  size?: number
  /** 目标ID（如文章ID） */
  targetId?: number
  /** 目标类型，当前固定为 article */
  targetType?: string
  /** 评论用户ID */
  userId?: number
  /** 根评论ID */
  rootId?: number
  /** 父评论ID */
  parentId?: number
  /** 评论状态：0-待审核，1-正常，2-隐藏 */
  status?: number
}

/**
 * 评论视图对象
 * @description 评论完整信息，包含回复树
 * @interface CommentVO
 * @see GET /api/sys/comments - 响应项
 * @see GET /api/sys/comments/{id} - 响应
 */
export interface CommentVO {
  /** 评论ID */
  id: number
  /** 目标ID（如文章ID） */
  targetId: number
  /** 目标类型，当前固定为 article */
  targetType: string
  /** 评论内容 */
  content: string
  /** 图片列表 */
  images?: string[]
  /** 评论用户ID */
  userId: number
  /** 评论用户昵称 */
  userNickname: string
  /** 评论用户头像 */
  userAvatar?: string | null
  /** 根评论ID */
  rootId?: number
  /** 父评论ID */
  parentId?: number
  /** 点赞数 */
  likeCount: number
  /** 回复数 */
  replyCount: number
  /** 评论状态：0-待审核，1-正常，2-隐藏 */
  status: number
  /** 创建时间 */
  createdAt: string
  /** 当前用户是否已点赞 */
  liked?: boolean
  /** 子回复列表 */
  children?: CommentVO[]
}

// ==================== 前台公开评论 ====================

/**
 * 前台评论查询请求
 * @description 前台分页查询评论列表
 * @interface PublicCommentQueryRequest
 * @see GET /api/comments - 查询参数
 */
export interface PublicCommentQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页数量，默认10 */
  size?: number
  /** 目标类型，当前固定为 article */
  targetType?: string
  /** 目标ID（如文章ID） */
  targetId?: number
}

/**
 * 前台评论视图对象
 * @description 前台公开评论，同CommentVO
 * @interface PublicCommentVO
 * @extends CommentVO
 * @see GET /api/comments - 响应项
 */
export interface PublicCommentVO extends CommentVO {}

// ==================== 用户提交评论 ====================

/**
 * 保存评论请求
 * @description 用户发表评论或回复
 * @interface CommentSaveRequest
 * @see POST /api/user/comments - 请求体
 */
export interface CommentSaveRequest {
  /** 目标类型，当前固定为 article */
  targetType: string
  /** 目标ID（如文章ID） */
  targetId: number
  /** 评论内容 */
  content: string
  /** 图片列表 */
  images?: string[]
  /** 根评论ID，顶级评论传0 */
  rootId?: number
  /** 父评论ID，顶级评论传0 */
  parentId?: number
}