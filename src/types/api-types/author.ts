/**
 * 作者申请 + 公开作者主页类型
 * @module api-types/author
 * @see docs/api文档/auth-api.md
 */

// ==================== 公开作者主页 ====================

/**
 * 公开作者主页摘要
 * @description 前台公开的作者主页摘要信息
 * @interface PublicAuthorProfileVO
 * @see GET /api/users/{userId}/author-profile - 响应
 */
export interface PublicAuthorProfileVO {
  /** 用户ID */
  userId: number
  /** 用户名 */
  username: string
  /** 昵称 */
  nickname: string
  /** 头像 */
  avatar: string
  /** 用户等级 */
  userLevel: number
  /** 是否具备作者身份 */
  author: boolean
  /** 作者标识，当前作者固定返回 author，普通用户返回 null */
  authorBadge: string | null
  /** 当前可公开展示的文章数 */
  publicArticleCount: number
  /** 当前可公开展示的系列数 */
  publicSeriesCount: number
  /** 作品展示位文章ID列表，当前阶段预留为空 */
  showcaseArticleIds: number[]
  /** 代表内容文章ID列表，当前阶段预留为空 */
  representativeArticleIds: number[]
  /** 系列展示位系列ID列表，当前阶段预留为空 */
  featuredSeriesIds: number[]
  /** 专栏展示位ID列表，当前阶段预留为空 */
  featuredColumnIds: number[]
}

// ==================== 用户侧作者申请 ====================

/**
 * 提交作者申请请求
 * @description 用户提交作者申请
 * @interface UserAuthorApplicationSubmitRequest
 * @see POST /api/user/author-applications - 请求体
 */
export interface UserAuthorApplicationSubmitRequest {
  /** 申请说明，最长512字符 */
  applyReason: string
  /** 擅长内容方向，最长128字符 */
  contentDirection: string
  /** 个人简介，最长1024字符 */
  introduction?: string
  /** 示例链接，最多10条，需为http/https */
  sampleLinks?: string[]
}

/**
 * 用户作者申请视图对象
 * @description 用户查看自己的作者申请记录
 * @interface UserAuthorApplicationVO
 * @see GET /api/user/author-applications/latest - 响应
 * @see GET /api/user/author-applications - 响应项
 */
export interface UserAuthorApplicationVO {
  /** 申请ID */
  id: number
  /** 申请状态：0-待审核，1-已通过，2-已拒绝，3-待补充 */
  applyStatus: number
  /** 状态文案 */
  applyStatusLabel: string
  /** 申请说明 */
  applyReason: string
  /** 擅长内容方向 */
  contentDirection: string
  /** 个人简介 */
  introduction?: string | null
  /** 示例链接列表 */
  sampleLinks?: string[]
  /** 审核人ID */
  reviewerId?: number
  /** 审核备注 */
  reviewComment?: string | null
  /** 提交时间 */
  submittedAt: string
  /** 审核时间 */
  reviewedAt?: string
}

// ==================== 后台作者申请管理 ====================

/**
 * 后台作者申请分页查询
 * @description 后台分页查询作者申请列表
 * @interface SysAuthorApplicationAdminPageQuery
 * @see GET /api/sys/author-applications - 查询参数
 */
export interface SysAuthorApplicationAdminPageQuery {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10，最大100 */
  size?: number
  /** 申请用户ID */
  userId?: number
  /** 申请状态 */
  applyStatus?: number
  /** 关键词，匹配申请说明、内容方向和个人简介 */
  keyword?: string
}

/**
 * 后台作者申请视图对象
 * @description 后台作者申请列表项
 * @interface SysAuthorApplicationAdminVO
 * @see GET /api/sys/author-applications - 响应项
 * @see GET /api/sys/author-applications/{id} - 响应
 */
export interface SysAuthorApplicationAdminVO {
  /** 申请ID */
  id: number
  /** 申请用户ID */
  userId: number
  /** 申请用户名 */
  username: string
  /** 申请用户昵称 */
  nickname: string
  /** 申请状态：0-待审核，1-已通过，2-已拒绝，3-待补充 */
  applyStatus: number
  /** 状态文案 */
  applyStatusLabel: string
  /** 申请说明 */
  applyReason: string
  /** 擅长内容方向 */
  contentDirection: string
  /** 个人简介 */
  introduction?: string | null
  /** 示例链接列表 */
  sampleLinks?: string[]
  /** 审核人ID */
  reviewerId?: number
  /** 审核人用户名 */
  reviewerUsername?: string
  /** 审核人昵称 */
  reviewerNickname?: string
  /** 审核备注 */
  reviewComment?: string | null
  /** 提交时间 */
  submittedAt: string
  /** 审核时间 */
  reviewedAt?: string
}

/**
 * 后台审核作者申请请求
 * @description 后台审核作者申请
 * @interface SysAuthorApplicationAdminReviewRequest
 * @see PUT /api/sys/author-applications/{id}/review - 请求体
 */
export interface SysAuthorApplicationAdminReviewRequest {
  /** 审核状态：1-通过，2-拒绝，3-待补充 */
  reviewStatus: 1 | 2 | 3
  /** 审核备注，最长512字符 */
  reviewComment?: string
}

/**
 * 修复作者申请状态请求
 * @description 超级管理员修正异常作者申请状态
 * @interface SysAuthorApplicationRepairRequest
 * @see PUT /api/sys/author-applications/{id}/repair - 请求体
 */
export interface SysAuthorApplicationRepairRequest {
  /** 目标状态：0-待审核，1-已通过，2-已拒绝，3-待补充 */
  targetStatus: 0 | 1 | 2 | 3
  /** 修正备注，最长512字符 */
  reviewComment: string
}