/**
 * UI 层通用类型定义
 * 跨页面复用的组件数据类型
 */

// ==================== 标签页 ====================

export interface TabItem {
  path: string
  title: string
  name?: string
  closable?: boolean
}

// ==================== 文章目录 ====================

export interface TocHeading {
  id: string
  text: string
  level: number
}

// ==================== 首页选项 ====================

export interface CategoryOption {
  id: number
  label: string
}

export interface SortOption {
  label: string
  value: 'latest' | 'top' | 'hot'
}

// ==================== 大厅消息 ====================

export interface HallMessage {
  id: number
  username: string
  level: number
  content: string
  time: string
  isSystem: boolean
}

// ==================== 审计日志 ====================

export interface AuditLog {
  id: number
  time: string
  operator: string
  operationType: 'user' | 'content' | 'config' | 'security'
  description: string
  ip: string
  result: 'success' | 'failure'
}

// ==================== 通知摘要 ====================

export interface NoticeSummary {
  id: number
  title: string
  publishTime?: string | null
  createTime?: string | null
}

// ==================== 评论搜索表单 ====================

export interface CommentSearchForm {
  targetId?: number | null
  targetType?: string
  userId?: number | null
  rootId?: number | null
  parentId?: number | null
  status?: number | null
}

// ==================== 系列管理表单 ====================

export interface SeriesFormItem {
  id: number
  name: string
  author: string
  articleCount: number
  totalRead: number
  createTime: string
  description: string
}

// ==================== 频道选择 ====================

export interface ChannelPickOption {
  id: number
  name: string
  memberCount: number
}
