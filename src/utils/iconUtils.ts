import * as ElementPlusIconsVue from '@element-plus/icons-vue'

/**
 * 图标工具类
 */
export class IconUtils {
  private static readonly ALIASES: Record<string, string> = {
    Home: 'House',
    Files: 'Folder',
  }

  /**
   * 获取图标组件
   */
  static getIcon(name: string) {
    const resolved = this.ALIASES[name] ?? name
    return (ElementPlusIconsVue as Record<string, unknown>)[resolved] || null
  }

  /**
   * 检查图标是否存在
   */
  static hasIcon(name: string): boolean {
    return name in ElementPlusIconsVue
  }

  /**
   * 获取所有图标名称
   */
  static getAllIconNames(): string[] {
    return Object.keys(ElementPlusIconsVue)
  }

  /**
   * 搜索图标（支持模糊搜索）
   */
  static searchIcons(keyword: string): string[] {
    if (!keyword) return []
    const lowerKeyword = keyword.toLowerCase()
    return this.getAllIconNames().filter(name =>
      name.toLowerCase().includes(lowerKeyword),
    )
  }

  /**
   * 获取图标分类
   */
  static getIconsByCategory(): Record<string, string[]> {
    const categories: Record<string, string[]> = {
      // 基础
      basic: [
        'Close',
        'Check',
        'Delete',
        'Edit',
        'Search',
        'Plus',
        'Minus',
        'Refresh',
        'Download',
        'Upload',
      ],
      // 方向
      direction: [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Back',
        'Right',
        'Up',
        'Down',
        'CaretUp',
        'CaretDown',
        'CaretLeft',
        'CaretRight',
      ],
      // 操作
      operation: [
        'Setting',
        'Tools',
        'Operation',
        'Management',
        'Monitor',
        'Filter',
        'Sort',
        'SortUp',
        'SortDown',
      ],
      // 数据
      data: [
        'DataLine',
        'DataAnalysis',
        'DataBoard',
        'PieChart',
        'Histogram',
        'TrendCharts',
        'List',
        'Grid',
      ],
      // 媒体
      media: [
        'Picture',
        'PictureFilled',
        'PictureRounded',
        'VideoCamera',
        'VideoCameraFilled',
        'Microphone',
        'MicrophoneFilled',
      ],
      // 文件
      file: [
        'Document',
        'DocumentAdd',
        'DocumentDelete',
        'DocumentCopy',
        'Files',
        'Folder',
        'FolderOpened',
        'FolderAdd',
        'FolderDelete',
        'FolderChecked',
      ],
      // 用户
      user: [
        'User',
        'UserFilled',
        'Avatar',
        'Lock',
        'Unlock',
        'Key',
        'View',
        'Hide',
      ],
      // 通信
      communication: [
        'Message',
        'MessageBox',
        'ChatDotRound',
        'ChatLineRound',
        'ChatDotSquare',
        'ChatLineSquare',
        'Phone',
        'PhoneFilled',
        'Bell',
        'Notification',
      ],
      // 时间
      time: ['Calendar', 'Clock', 'Timer', 'Date', 'AlarmClock', 'Watch'],
      // 地点
      location: ['Location', 'LocationFilled', 'Place', 'Position', 'MapLocation'],
      // 状态
      status: [
        'InfoFilled',
        'Warning',
        'WarningFilled',
        'SuccessFilled',
        'CircleCheck',
        'CircleClose',
        'CircleCheckFilled',
        'CircleCloseFilled',
        'Loading',
      ],
      // 其他
      other: [
        'Star',
        'StarFilled',
        'Heart',
        'HeartFilled',
        'Share',
        'Flag',
        'HomeFilled',
        'House',
        'Link',
        'LinkBreak',
        'Connection',
        'ZoomIn',
        'ZoomOut',
        'FullScreen',
        'Crop',
        'Printer',
        'More',
        'MoreFilled',
      ],
    }
    return categories
  }

  /**
   * 获取某个分类下的图标列表
   */
  static getIconsByCategoryName(category: string): string[] {
    const categories = this.getIconsByCategory()
    return categories[category] || []
  }

  /**
   * 常用图标列表
   */
  static getCommonIcons(): string[] {
    return [
      'Edit',
      'Delete',
      'Search',
      'Close',
      'Check',
      'Plus',
      'Minus',
      'Refresh',
      'Download',
      'Upload',
      'Setting',
      'User',
      'Lock',
      'View',
      'Hide',
      'Message',
      'Bell',
      'Star',
      'Heart',
      'Share',
      'HomeFilled',
      'Folder',
      'Document',
      'Calendar',
      'Clock',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Back',
      'More',
      'Filter',
      'Sort',
      'List',
      'Grid',
      'Menu',
      'InfoFilled',
      'Warning',
      'SuccessFilled',
      'CircleCheck',
      'CircleClose',
      'Loading',
    ]
  }
}

export default IconUtils
