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
