/**
 * 通知管理类型（后台 + 用户侧 + 通知设置）
 * @module api-types/notice
 * @see docs/api文档/auth-api.md
 */

// ==================== 后台通知管理 ====================

/**
 * 后台通知查询请求
 * @description 后台分页查询通知列表
 * @interface NoticeQueryRequest
 * @see GET /api/sys/notices - 查询参数
 */
export interface NoticeQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10 */
  size?: number
  /** 标题关键词 */
  title?: string
  /** 通知类型 */
  type?: number
  /** 发布状态 */
  publishStatus?: number
  /** 目标类型：1-全体，2-指定用户 */
  targetType?: number
}

/**
 * 后台通知视图对象
 * @description 后台通知完整信息
 * @interface SysNoticeAdminVO
 * @see GET /api/sys/notices - 响应项
 * @see GET /api/sys/notices/{id} - 响应
 */
export interface SysNoticeAdminVO {
  /** 通知ID */
  id: number
  /** 标题 */
  title: string
  /** 内容 */
  content: string
  /** 通知类型 */
  type: number
  /** 通知等级 */
  level?: string
  /** 目标类型：1-全体，2-指定用户 */
  targetType?: number
  /** 指定用户ID列表 */
  targetUserIds?: number[]
  /** 发布人ID */
  publisherId?: number
  /** 状态 */
  status: number
  /** 发布状态 */
  publishStatus?: number
  /** 发布时间 */
  publishTime?: string
  /** 撤回时间 */
  revokeTime?: string
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime?: string
}

/**
 * 保存通知请求
 * @description 创建或更新通知
 * @interface SysNoticeSaveRequest
 * @see POST /api/sys/notices - 请求体
 * @see PUT /api/sys/notices/{id} - 请求体
 */
export interface SysNoticeSaveRequest {
  /** 通知标题 */
  title: string
  /** 通知内容 */
  content: string
  /** 通知类型 */
  type?: number
  /** 通知等级 */
  level?: string
  /** 目标类型：1-全体，2-指定用户 */
  targetType?: number
  /** 指定用户ID列表 */
  targetUserIds?: number[]
}

/**
 * 发布通知请求
 * @description 后台发布通知
 * @interface SysNoticePublishRequest
 * @see POST /api/sys/notices/{id}/publish - 请求体
 */
export interface SysNoticePublishRequest {
  // 发布通知接口可能需要
}

/**
 * 撤回通知请求
 * @description 后台撤回通知
 * @interface SysNoticeRevokeRequest
 * @see POST /api/sys/notices/{id}/revoke - 请求体
 */
export interface SysNoticeRevokeRequest {
  // 撤回通知接口可能需要
}

// ==================== 用户通知 ====================

/**
 * 用户通知查询请求
 * @description 用户分页查询自己的通知列表
 * @interface UserNoticeQueryRequest
 * @see GET /api/user/notices - 查询参数
 */
export interface UserNoticeQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10 */
  size?: number
  /** 标题关键词 */
  title?: string
  /** 是否已读：0-未读，1-已读 */
  isRead?: number
}

/**
 * 用户通知视图对象
 * @description 用户通知详情
 * @interface UserNoticeVO
 * @see GET /api/user/notices - 响应项
 * @see GET /api/user/notices/{id} - 响应
 */
export interface UserNoticeVO {
  /** 通知ID（用户通知记录ID） */
  id: number
  /** 通知ID（系统通知ID） */
  noticeId: number
  /** 标题 */
  title: string
  /** 内容 */
  content: string
  /** 通知类型 */
  type?: number
  /** 通知等级 */
  level?: string
  /** 发布时间 */
  publishTime?: string
  /** 是否已读：0-未读，1-已读 */
  isRead: number
  /** 阅读时间 */
  readTime?: string
  /** 创建时间 */
  createTime: string
}

// ==================== 通知设置 ====================

/**
 * 用户通知设置项视图对象
 * @description 单个通知类型的设置
 * @interface UserNotificationSettingItemVO
 * @see GET /api/user/notification-settings - 响应项
 */
export interface UserNotificationSettingItemVO {
  /** 通知类型编码 */
  type: string
  /** 通知类型名称 */
  label: string
  /** 是否启用 */
  enabled: boolean
}

/**
 * 批量更新通知设置请求
 * @description 用户批量更新通知设置
 * @interface UserNotificationSettingBatchUpdateRequest
 * @see PUT /api/user/notification-settings - 请求体
 */
export interface UserNotificationSettingBatchUpdateRequest {
  /** 设置列表 */
  settings: Array<{
    /** 通知类型编码 */
    type: string
    /** 是否启用 */
    enabled: boolean
  }>
}

/**
 * 更新单类通知设置请求
 * @description 用户更新单个通知类型的设置
 * @interface UserNotificationSettingStatusUpdateRequest
 * @see PUT /api/user/notification-settings/{type} - 请求体
 */
export interface UserNotificationSettingStatusUpdateRequest {
  /** 是否启用 */
  enabled: boolean
}