/**
 * 文章相关类型（后台管理 + 前台公开 + 审核 + 系列 + 用户文章）
 * @module api-types/article
 * @see docs/api文档/content-api.md
 */

// ==================== 后台文章管理 ====================

/**
 * 后台文章查询请求
 * @description 后台分页查询文章列表
 * @interface ArticleQueryRequest
 * @see GET /api/sys/articles - 查询参数
 */
export interface ArticleQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10 */
  size?: number
  /** 标题/摘要关键字 */
  keyword?: string
  /** 作者ID */
  authorId?: number
  /** 文章状态：0-草稿，1-已发布 */
  status?: number
  /** 审核状态：0-未送审，1-审核中，2-审核通过，3-审核拒绝 */
  reviewStatus?: number
  /** 访问级别 */
  accessLevel?: number
  /** 可见范围：0-公开，1-仅自己可见，2-白名单可见，3-登录可见 */
  visibilityScope?: number
  /** 分类ID */
  categoryId?: number
  /** 标签ID */
  tagId?: number
  /** 是否置顶：0/1 */
  isTop?: number
  /** 发布时间起 */
  publishTimeStart?: string
  /** 发布时间止 */
  publishTimeEnd?: string
}

/**
 * 文章访问控制项
 * @description 文章白名单/黑名单访问控制
 * @interface ArticleAccessItem
 * @see ArticleDetailVO.accessList
 * @see PUT /api/sys/articles/{id}/access - 请求体
 */
export interface ArticleAccessItem {
  /** 用户ID */
  userId: number
  /** 访问类型：1-白名单，2-黑名单 */
  accessType: number
  /** 过期时间，为空表示长期有效 */
  expireTime?: string | null
  /** 授权原因 */
  grantReason?: string | null
}

/**
 * 后台文章视图对象
 * @description 后台文章列表项
 * @interface ArticleAdminVO
 * @see GET /api/sys/articles - 响应
 * @see GET /api/sys/article-reviews - 响应
 */
export interface ArticleAdminVO {
  /** 文章ID */
  id: number
  /** 标题 */
  title: string
  /** 摘要 */
  summary?: string | null
  /** 封面地址 */
  coverImage?: string | null
  /** 作者ID */
  authorId: number
  /** 作者名 */
  authorName: string
  /** 是否置顶：0-否，1-是 */
  isTop: number
  /** 是否原创：0-否，1-是 */
  isOriginal: number
  /** 文章状态：0-草稿，1-已发布 */
  status: number
  /** 审核状态：0-未送审，1-审核中，2-审核通过，3-审核拒绝 */
  reviewStatus: number
  /** 访问级别 */
  accessLevel: number
  /** 可见范围：0-公开，1-仅自己可见，2-白名单可见，3-登录可见 */
  visibilityScope?: number
  /** 浏览数 */
  viewCount: number
  /** 点赞数 */
  likeCount: number
  /** 评论数 */
  commentCount: number
  /** 收藏数 */
  collectCount: number
  /** 分享数 */
  shareCount: number
  /** 发布时间 */
  publishTime?: string | null
  /** 定时发布时间 */
  scheduledPublishTime?: string | null
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt?: string | null
  /** 备注 */
  remark?: string | null
}

/**
 * 文章详情视图对象
 * @description 后台文章详情，包含正文内容
 * @interface ArticleDetailVO
 * @extends ArticleAdminVO
 * @see GET /api/sys/articles/{id} - 响应
 */
export interface ArticleDetailVO extends ArticleAdminVO {
  /** 正文内容 */
  content?: string | null
  /** 原文地址 */
  sourceUrl?: string | null
  /** 分类ID列表 */
  categoryIds?: number[]
  /** 标签ID列表 */
  tagIds?: number[]
  /** 访问控制列表 */
  accessList?: ArticleAccessItem[]
}

/**
 * 保存文章请求
 * @description 创建或更新文章
 * @interface ArticleSaveRequest
 * @see POST /api/sys/articles - 请求体
 * @see PUT /api/sys/articles/{id} - 请求体
 */
export interface ArticleSaveRequest {
  /** 标题，最长128字符 */
  title: string
  /** 作者ID */
  authorId: number
  /** 摘要，最长2000字符 */
  summary?: string
  /** 正文内容 */
  content?: string
  /** 封面地址，最长512字符 */
  coverImage?: string
  /** 是否置顶：0-否，1-是 */
  isTop?: number
  /** 是否原创：0-否，1-是，默认1 */
  isOriginal?: number
  /** 原文地址，非原创时必填 */
  sourceUrl?: string
  /** 文章状态：0-草稿，1-已发布 */
  status?: number
  /** 定时发布时间，未来时间会先以草稿保存 */
  scheduledPublishTime?: string
  /** 发布时间 */
  publishTime?: string
  /** 访问级别 */
  accessLevel?: number
  /** 可见范围：0-公开，1-仅自己可见，2-白名单可见，3-登录可见 */
  visibilityScope?: number
  /** 备注，最长256字符 */
  remark?: string
  /** 分类ID列表 */
  categoryIds?: number[]
  /** 标签ID列表 */
  tagIds?: number[]
  /** 访问控制列表，accessLevel=4或visibilityScope=2时使用 */
  accessList?: ArticleAccessItem[]
}

/**
 * 保存文章访问名单请求
 * @description 后台配置文章访问名单
 * @interface ArticleAccessSaveRequest
 * @see PUT /api/sys/articles/{id}/access - 请求体
 */
export interface ArticleAccessSaveRequest {
  /** 访问控制列表 */
  accessList: ArticleAccessItem[]
}

/**
 * 分配文章访问名单请求
 * @description 用户侧配置自己文章的访问名单
 * @interface ArticleAccessAssignRequest
 * @see PUT /api/user/articles/{id}/access - 请求体
 */
export interface ArticleAccessAssignRequest {
  /** 访问控制列表 */
  accessList: ArticleAccessItem[]
}

// ==================== 前台公开文章 ====================

/**
 * 前台文章查询请求
 * @description 前台分页查询文章列表
 * @interface PublicArticleQueryRequest
 * @see GET /api/articles - 查询参数
 */
export interface PublicArticleQueryRequest {
  /** 页码 */
  current?: number
  /** 每页数量 */
  size?: number
  /** 标题/摘要关键字 */
  keyword?: string
  /** 分类ID */
  categoryId?: number
  /** 标签ID */
  tagId?: number
  /** 排序方式：latest/top/hot */
  sort?: 'latest' | 'top' | 'hot'
}

/**
 * 前台文章卡片视图对象
 * @description 前台文章列表项
 * @interface PublicArticleCardVO
 * @see GET /api/articles - 响应
 */
export interface PublicArticleCardVO {
  /** 文章ID */
  id: number
  /** 标题 */
  title: string
  /** 摘要 */
  summary?: string | null
  /** 封面地址 */
  coverImage?: string | null
  /** 作者ID */
  authorId: number
  /** 作者名 */
  authorName: string
  /** 是否置顶：0-否，1-是 */
  isTop: number
  /** 访问级别 */
  accessLevel: number
  /** 浏览数 */
  viewCount: number
  /** 点赞数 */
  likeCount: number
  /** 评论数 */
  commentCount: number
  /** 收藏数 */
  collectCount: number
  /** 发布时间 */
  publishTime?: string | null
}

/**
 * 前台文章详情视图对象
 * @description 前台文章详情页
 * @interface PublicArticleDetailVO
 * @see GET /api/articles/{id} - 响应
 */
export interface PublicArticleDetailVO {
  /** 文章ID */
  id: number
  /** 标题 */
  title: string
  /** 摘要 */
  summary?: string | null
  /** 正文内容 */
  content?: string | null
  /** 封面地址 */
  coverImage?: string | null
  /** 作者ID */
  authorId: number
  /** 作者名 */
  authorName: string
  /** 是否置顶：0-否，1-是 */
  isTop: number
  /** 是否原创：0-否，1-是 */
  isOriginal: number
  /** 原文地址 */
  sourceUrl?: string | null
  /** 访问级别 */
  accessLevel: number
  /** 可见范围：0-公开，1-仅自己可见，2-白名单可见，3-登录可见 */
  visibilityScope: number
  /** 浏览数 */
  viewCount: number
  /** 点赞数 */
  likeCount: number
  /** 评论数 */
  commentCount: number
  /** 收藏数 */
  collectCount: number
  /** 分享数 */
  shareCount: number
  /** 发布时间 */
  publishTime?: string | null
  /** 分类列表 */
  categories?: import('./category').PublicCategoryTreeVO[]
  /** 标签列表 */
  tags?: import('./tag').PublicTagVO[]
  /** 当前登录用户是否已点赞 */
  liked?: boolean
  /** 当前登录用户是否已收藏 */
  collected?: boolean
  /** 当前用户是否允许评论 */
  canComment?: boolean
  /** 所属系列摘要列表 */
  seriesList?: ArticleSeriesSummaryVO[]
}

// ==================== 用户文章 ====================

/**
 * 用户文章查询请求
 * @description 用户分页查询自己的文章
 * @interface UserArticleQueryRequest
 * @see GET /api/user/articles - 查询参数
 */
export interface UserArticleQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页数量，默认10 */
  size?: number
  /** 标题/摘要关键字 */
  keyword?: string
  /** 文章状态：0-草稿，1-已发布，2-已下线 */
  status?: number
  /** 审核状态：0-未送审，1-审核中，2-审核通过，3-审核拒绝 */
  reviewStatus?: number
  /** 可见范围：0-公开，1-仅自己可见，2-白名单可见，3-登录可见 */
  visibilityScope?: number
  /** 分类ID */
  categoryId?: number
  /** 标签ID */
  tagId?: number
}

/**
 * 用户文章视图对象
 * @description 用户文章列表项
 * @interface UserArticleVO
 * @see GET /api/user/articles - 响应
 */
export interface UserArticleVO {
  /** 文章ID */
  id: number
  /** 标题 */
  title: string
  /** 摘要 */
  summary?: string | null
  /** 封面 */
  coverImage?: string | null
  /** 是否置顶：0-否，1-是 */
  isTop: number
  /** 是否原创：0-否，1-是 */
  isOriginal: number
  /** 文章状态：0-草稿，1-已发布，2-已下线 */
  status: number
  /** 审核状态：0-未送审，1-审核中，2-审核通过，3-审核拒绝 */
  reviewStatus: number
  /** 访问级别 */
  accessLevel: number
  /** 可见范围 */
  visibilityScope?: number
  /** 浏览数 */
  viewCount: number
  /** 点赞数 */
  likeCount: number
  /** 评论数 */
  commentCount: number
  /** 收藏数 */
  collectCount: number
  /** 分享数 */
  shareCount: number
  /** 发布时间 */
  publishTime?: string | null
  /** 定时发布时间 */
  scheduledPublishTime?: string | null
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt?: string | null
  /** 备注 */
  remark?: string | null
}

/**
 * 用户文章详情视图对象
 * @description 用户查看自己文章详情
 * @interface UserArticleDetailVO
 * @extends UserArticleVO
 * @see GET /api/user/articles/{id} - 响应
 */
export interface UserArticleDetailVO extends UserArticleVO {
  /** 正文 */
  content?: string | null
  /** 作者ID */
  authorId: number
  /** 作者名称 */
  authorName: string
  /** 原文地址 */
  sourceUrl?: string | null
  /** 分类ID列表 */
  categoryIds?: number[]
  /** 标签ID列表 */
  tagIds?: number[]
  /** 访问控制列表 */
  accessList?: ArticleAccessItem[]
  /** 所属系列摘要列表 */
  seriesList?: ArticleSeriesSummaryVO[]
}

// ==================== 文章审核 ====================

/**
 * 文章审核日志视图对象
 * @description 文章审核操作记录
 * @interface ArticleReviewLogVO
 * @see GET /api/user/articles/{id}/review-log - 响应
 * @see GET /api/sys/article-reviews/{id} - 响应.reviewLogs
 */
export interface ArticleReviewLogVO {
  /** 日志ID */
  id: number
  /** 文章ID */
  articleId: number
  /** 动作类型：submit/resubmit/approve/reject */
  actionType: string
  /** 动作标签 */
  actionTypeLabel: string
  /** 变更前审核状态 */
  fromReviewStatus: number
  /** 变更前审核状态标签 */
  fromReviewStatusLabel: string
  /** 变更后审核状态 */
  toReviewStatus: number
  /** 变更后审核状态标签 */
  toReviewStatusLabel: string
  /** 操作人ID */
  operatorUserId: number
  /** 操作人用户名 */
  operatorUsername: string
  /** 操作人昵称 */
  operatorNickname: string
  /** 审核说明/备注 */
  reviewComment?: string | null
  /** 操作时间 */
  operatedAt: string
}

/**
 * 提交审核请求
 * @description 用户提交文章审核
 * @interface ArticleReviewSubmitRequest
 * @see POST /api/user/articles/{id}/submit-review - 请求体
 */
export interface ArticleReviewSubmitRequest {
  /** 审核说明/备注 */
  reviewComment?: string
}

/**
 * 审核决策请求
 * @description 后台审核通过或拒绝
 * @interface ArticleReviewDecisionRequest
 * @see PUT /api/sys/article-reviews/{id}/approve - 请求体
 * @see PUT /api/sys/article-reviews/{id}/reject - 请求体
 */
export interface ArticleReviewDecisionRequest {
  /** 审核说明/备注 */
  reviewComment?: string
}

/**
 * 修复审核状态请求
 * @description 超级管理员修正异常审核状态
 * @interface ArticleReviewRepairRequest
 * @see PUT /api/sys/article-reviews/{id}/repair-status - 请求体
 */
export interface ArticleReviewRepairRequest {
  /** 目标审核状态：0-未送审，1-审核中，2-审核通过，3-审核拒绝 */
  targetReviewStatus: number
  /** 修复备注 */
  reviewComment: string
}

/**
 * 文章审核详情视图对象
 * @description 后台查看文章审核详情
 * @interface ArticleReviewAdminDetailVO
 * @see GET /api/sys/article-reviews/{id} - 响应
 */
export interface ArticleReviewAdminDetailVO {
  /** 文章详情 */
  article: ArticleDetailVO
  /** 审核日志列表 */
  reviewLogs: ArticleReviewLogVO[]
}

// ==================== 文章系列 ====================

/**
 * 文章系列摘要视图对象
 * @description 文章所属系列简要信息
 * @interface ArticleSeriesSummaryVO
 * @see PublicArticleDetailVO.seriesList
 * @see UserArticleDetailVO.seriesList
 */
export interface ArticleSeriesSummaryVO {
  /** 系列ID */
  id: number
  /** 系列标题 */
  title: string
  /** 系列封面 */
  coverImage: string | null
  /** 系列文章数 */
  articleCount: number
  /** 排序值 */
  sortOrder: number
  /** 可见范围：0-公开，1-仅自己可见，3-登录可见 */
  visibilityScope: number
}

/**
 * 保存系列请求
 * @description 创建或更新文章系列
 * @interface ArticleSeriesSaveRequest
 * @see POST /api/user/article-series - 请求体
 * @see PUT /api/user/article-series/{id} - 请求体
 */
export interface ArticleSeriesSaveRequest {
  /** 系列标题 */
  title: string
  /** 系列描述 */
  description?: string
  /** 系列封面 */
  coverImage?: string
  /** 状态：0-禁用，1-启用 */
  status?: number
  /** 可见范围：0-公开，1-仅自己可见，3-登录可见 */
  visibilityScope?: number
  /** 排序值 */
  sortOrder?: number
}

/**
 * 系列中添加文章请求
 * @description 向系列中添加文章
 * @interface ArticleSeriesArticleRequest
 * @see POST /api/user/article-series/{id}/articles - 请求体
 */
export interface ArticleSeriesArticleRequest {
  /** 文章ID */
  articleId: number
}

/**
 * 系列文章排序请求
 * @description 调整系列内文章的顺序
 * @interface ArticleSeriesSortRequest
 * @see PUT /api/user/article-series/{id}/articles/sort - 请求体
 */
export interface ArticleSeriesSortRequest {
  /** 文章ID列表，按新顺序排列 */
  articleIds: number[]
}

/**
 * 公开系列视图对象
 * @description 前台系列列表项
 * @interface PublicArticleSeriesVO
 * @see GET /api/public/authors/{authorId}/series - 响应
 */
export interface PublicArticleSeriesVO {
  /** 系列ID */
  id: number
  /** 系列标题 */
  title: string
  /** 系列描述 */
  description: string | null
  /** 系列封面 */
  coverImage: string | null
  /** 创建人ID */
  ownerUserId: number
  /** 创建人名称 */
  ownerName: string
  /** 可见范围：0-公开，1-仅自己可见，3-登录可见 */
  visibilityScope: number
  /** 系列文章数 */
  articleCount: number
  /** 排序值 */
  sortOrder: number
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt?: string
}

/**
 * 公开系列详情视图对象
 * @description 前台系列详情页
 * @interface PublicArticleSeriesDetailVO
 * @extends PublicArticleSeriesVO
 * @see GET /api/public/article-series/{id} - 响应
 */
export interface PublicArticleSeriesDetailVO extends PublicArticleSeriesVO {
  /** 系列内文章列表 */
  articles: ArticleSeriesArticleVO[]
}

/**
 * 系列内文章视图对象
 * @description 系列中的文章简要信息
 * @interface ArticleSeriesArticleVO
 * @see PublicArticleSeriesDetailVO.articles
 */
export interface ArticleSeriesArticleVO {
  /** 文章ID */
  id: number
  /** 文章标题 */
  title: string
  /** 文章摘要 */
  summary: string | null
  /** 文章封面 */
  coverImage: string | null
  /** 文章状态：0-草稿，1-已发布 */
  status: number
  /** 审核状态：0-未送审，1-审核中，2-审核通过，3-审核拒绝 */
  reviewStatus: number
  /** 可见范围 */
  visibilityScope: number
  /** 发布时间 */
  publishTime: string | null
  /** 系列内顺序 */
  seqNo: number
}

/**
 * 用户系列视图对象
 * @description 用户系列列表项，同PublicArticleSeriesVO
 * @interface UserArticleSeriesVO
 * @see GET /api/user/article-series - 响应
 */
export interface UserArticleSeriesVO extends PublicArticleSeriesVO {}

/**
 * 用户系列详情视图对象
 * @description 用户系列详情页，同PublicArticleSeriesDetailVO
 * @interface UserArticleSeriesDetailVO
 * @see GET /api/user/article-series/{id} - 响应
 */
export interface UserArticleSeriesDetailVO extends PublicArticleSeriesDetailVO {}