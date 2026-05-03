import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import type { App } from 'vue'
import { createScopedLogger } from '@/composables/useLogger'

const logger = createScopedLogger('element-plus')

/**
 * 注册 Element Plus 所有图标
 * @param app Vue 应用实例
 */
export function registerElementPlusIcons(app: App) {
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
}

/**
 * 按需注册 Element Plus 图标
 * @param app Vue 应用实例
 * @param icons 要注册的图标名称数组
 */
export function registerElementPlusIconsByNames(app: App, icons: string[]) {
  for (const name of icons) {
    const component = (ElementPlusIconsVue as Record<string, unknown>)[name]
    if (component) {
      app.component(name, component)
    } else {
      logger.warn(`Icon "${name}" not found`)
    }
  }
}

/**
 * 获取 Element Plus 图标组件
 * @param name 图标名称
 */
export function getElementPlusIcon(name: string) {
  return (ElementPlusIconsVue as Record<string, unknown>)[name] || null
}

/**
 * 检查图标是否存在
 * @param name 图标名称
 */
export function hasElementPlusIcon(name: string): boolean {
  return name in ElementPlusIconsVue
}

/**
 * 获取所有可用的图标名称
 */
export function getElementPlusIconNames(): string[] {
  return Object.keys(ElementPlusIconsVue)
}

/**
 * 常用图标名称集合
 */
export const CommonIconNames = {
  // 方向性图标
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  ArrowUpBold: 'ArrowUpBold',
  ArrowDownBold: 'ArrowDownBold',
  ArrowLeftBold: 'ArrowLeftBold',
  ArrowRightBold: 'ArrowRightBold',
  Back: 'Back',
  Right: 'Right',
  Up: 'Up',
  Down: 'Down',
  Sort: 'Sort',
  SortUp: 'SortUp',
  SortDown: 'SortDown',

  // 操作类图标
  Edit: 'Edit',
  Delete: 'Delete',
  Search: 'Search',
  Close: 'Close',
  Check: 'Check',
  Plus: 'Plus',
  Minus: 'Minus',
  Refresh: 'Refresh',
  Download: 'Download',
  Upload: 'Upload',
  CopyDocument: 'CopyDocument',
  DocumentCopy: 'DocumentCopy',
  Folder: 'Folder',
  FolderOpened: 'FolderOpened',
  FolderAdd: 'FolderAdd',
  FolderDelete: 'FolderDelete',
  FolderChecked: 'FolderChecked',

  // 文件类图标
  Document: 'Document',
  Files: 'Files',
  DocumentAdd: 'DocumentAdd',
  DocumentDelete: 'DocumentDelete',
  DocumentRemove: 'DocumentRemove',
  EditPen: 'EditPen',
  Finished: 'Finished',
  Notebook: 'Notebook',

  // 数据类图标
  DataLine: 'DataLine',
  DataAnalysis: 'DataAnalysis',
  DataBoard: 'DataBoard',
  PieChart: 'PieChart',
  Histogram: 'Histogram',
  TrendCharts: 'TrendCharts',
  List: 'List',
  Grid: 'Grid',
  Menu: 'Menu',

  // 设置类图标
  Setting: 'Setting',
  Tools: 'Tools',
  Operation: 'Operation',
  Management: 'Management',
  Monitor: 'Monitor',
  Notification: 'Notification',
  Bell: 'Bell',
  InfoFilled: 'InfoFilled',
  Warning: 'Warning',
  WarningFilled: 'WarningFilled',
  SuccessFilled: 'SuccessFilled',
  CircleCheck: 'CircleCheck',
  CircleClose: 'CircleClose',
  CircleCloseFilled: 'CircleCloseFilled',
  CircleCheckFilled: 'CircleCheckFilled',

  // 用户类图标
  User: 'User',
  UserFilled: 'UserFilled',
  Avatar: 'Avatar',
  Lock: 'Lock',
  Unlock: 'Unlock',
  Key: 'Key',
  View: 'View',
  Hide: 'Hide',

  // 消息类图标
  Message: 'Message',
  MessageBox: 'MessageBox',
  ChatDotRound: 'ChatDotRound',
  ChatLineRound: 'ChatLineRound',
  ChatDotSquare: 'ChatDotSquare',
  ChatLineSquare: 'ChatLineSquare',
  Phone: 'Phone',
  PhoneFilled: 'PhoneFilled',

  // 时间类图标
  Clock: 'Clock',
  Timer: 'Timer',
  Calendar: 'Calendar',
  Date: 'Date',

  // 其他常用图标
  HomeFilled: 'HomeFilled',
  House: 'House',
  Link: 'Link',
  LinkBreak: 'LinkBreak',
  Connection: 'Connection',
  Flag: 'Flag',
  Star: 'Star',
  StarFilled: 'StarFilled',
  Heart: 'Heart',
  HeartFilled: 'HeartFilled',
  Share: 'Share',
  ZoomIn: 'ZoomIn',
  ZoomOut: 'ZoomOut',
  FullScreen: 'FullScreen',
  Crop: 'Crop',
  Printer: 'Printer',
  Filter: 'Filter',
  More: 'More',
  MoreFilled: 'MoreFilled',
} as const

export type CommonIconName = (typeof CommonIconNames)[keyof typeof CommonIconNames]
