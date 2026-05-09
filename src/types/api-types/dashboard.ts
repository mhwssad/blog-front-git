/**
 * 后台数据看板类型
 * @module api-types/dashboard
 * @see docs/api文档/auth-api.md
 */

// ==================== 数据看板 ====================

/**
 * 数据范围信息
 * @description 看板统计的实际时间范围
 * @interface DashboardRangeVO
 */
export interface DashboardRangeVO {
  /** 开始时间 */
  startTime: string | null
  /** 结束时间 */
  endTime: string | null
  /** 范围类型：today/week/month/all/custom */
  rangeType: string
}

/**
 * 核心概览视图对象
 * @description 后台数据看板核心指标
 * @interface DashboardOverviewVO
 * @see GET /api/sys/dashboard/overview - 响应
 */
export interface DashboardOverviewVO {
  /** 实际统计范围 */
  range: DashboardRangeVO
  /** 范围内注册用户数 */
  registeredUserCount: number
  /** 范围内活跃用户数 */
  activeUserCount: number
  /** 当前作者数量 */
  authorCount: number
  /** 范围内发文数 */
  articleCount: number
  /** 当前待审核文章数 */
  pendingArticleReviewCount: number
  /** 范围内评论数 */
  commentCount: number
  /** 范围内聊天消息数 */
  chatMessageCount: number
  /** 范围内AI调用数 */
  aiCallCount: number
  /** 范围内举报单数 */
  reportCount: number
  /** 当前待处理举报数 */
  pendingReportCount: number
}

/**
 * 内容统计视图对象
 * @description 后台数据看板内容指标
 * @interface DashboardContentVO
 * @see GET /api/sys/dashboard/content - 响应
 */
export interface DashboardContentVO {
  /** 实际统计范围 */
  range: DashboardRangeVO
  /** 范围内发文数 */
  articleCount: number
  /** 当前待审核文章数 */
  pendingArticleReviewCount: number
  /** 范围内评论数 */
  commentCount: number
  /** 范围内点赞数 */
  likeCount: number
  /** 范围内收藏数 */
  collectCount: number
}

/**
 * 热门版块信息
 * @description 社区统计中的热门版块
 * @interface HotSectionVO
 */
export interface HotSectionVO {
  /** 版块ID */
  sectionId: number
  /** 版块名称 */
  sectionName: string
  /** 版块发帖数 */
  postCount: number
  /** 版块回复数 */
  replyCount: number
  /** 热度值（发帖数+回复数） */
  hotValue: number
}

/**
 * 社区统计视图对象
 * @description 后台数据看板社区指标
 * @interface DashboardCommunityVO
 * @see GET /api/sys/dashboard/community - 响应
 */
export interface DashboardCommunityVO {
  /** 实际统计范围 */
  range: DashboardRangeVO
  /** 范围内聊天消息数 */
  chatMessageCount: number
  /** 范围内大厅消息数 */
  lobbyMessageCount: number
  /** 群组数量 */
  groupCount: number
  /** 范围内论坛发帖数（排除已删除） */
  forumPostCount: number
  /** 范围内论坛回复数（排除已删除） */
  forumReplyCount: number
  /** 热门版块 Top 5 */
  hotSections: HotSectionVO[]
}

/**
 * AI统计视图对象
 * @description 后台数据看板AI指标
 * @interface DashboardAiVO
 * @see GET /api/sys/dashboard/ai - 响应
 */
export interface DashboardAiVO {
  /** 实际统计范围 */
  range: DashboardRangeVO
  /** 范围内AI调用数 */
  aiCallCount: number
  /** 范围内AI成功调用数 */
  aiSuccessCallCount: number
  /** 范围内AI失败调用数 */
  aiFailedCallCount: number
  /** 范围内RAG调用次数 */
  ragCallCount: number
  /** 范围内Agent任务总数 */
  agentTaskCount: number
  /** 范围内Agent成功任务数（状态2） */
  agentSuccessTaskCount: number
  /** 范围内Agent失败任务数（状态3） */
  agentFailedTaskCount: number
}

/**
 * 处罚类型分布
 * @description 治理统计中的处罚类型分布
 * @interface PunishmentDistributionVO
 */
export interface PunishmentDistributionVO {
  /** 处罚类型 */
  punishmentType: string
  /** 数量 */
  count: number
}

/**
 * 治理统计视图对象
 * @description 后台数据看板治理指标
 * @interface DashboardGovernanceVO
 * @see GET /api/sys/dashboard/governance - 响应
 */
export interface DashboardGovernanceVO {
  /** 实际统计范围 */
  range: DashboardRangeVO
  /** 范围内举报单数 */
  reportCount: number
  /** 当前待处理举报数（全局，用于侧边栏红点） */
  pendingReportCount: number
  /** 范围内处理中举报数 */
  processingReportCount: number
  /** 范围内已处理举报数 */
  handledReportCount: number
  /** 范围内已驳回举报数 */
  rejectedReportCount: number
  /** 平均处理耗时（分钟） */
  averageHandleDurationMinutes: number
  /** 处罚类型分布 */
  punishmentDistributions: PunishmentDistributionVO[]
}

/**
 * 数据看板查询请求
 * @description 数据看板通用查询参数
 * @interface DashboardQueryRequest
 * @see GET /api/sys/dashboard/overview - 查询参数
 * @see GET /api/sys/dashboard/content - 查询参数
 * @see GET /api/sys/dashboard/community - 查询参数
 * @see GET /api/sys/dashboard/ai - 查询参数
 * @see GET /api/sys/dashboard/governance - 查询参数
 */
export interface DashboardQueryRequest {
  /** 范围类型：today/week/month/all/custom，默认today */
  rangeType?: 'today' | 'week' | 'month' | 'all' | 'custom'
  /** 自定义开始时间，rangeType=custom时必填 */
  startTime?: string
  /** 自定义结束时间，rangeType=custom时必填 */
  endTime?: string
}
