/**
 * API 类型统一导出入口
 * 按业务域拆分为独立文件，通过此文件统一导出
 */

// 通用响应结构
export * from './common'

// 认证模块
export * from './auth'

// 用户管理（含等级经验、2FA、经验来源配置）
export * from './user'

// 角色管理
export * from './role'

// 菜单管理
export * from './menu'

// 配置管理
export * from './config'

// 通知管理（含用户通知、通知设置）
export * from './notice'

// 日志管理
export * from './log'

// 文章相关（后台+前台+审核+系列+用户文章）
export * from './article'

// 分类管理
export * from './category'

// 标签管理
export * from './tag'

// 评论管理
export * from './comment'

// 收藏管理
export * from './collection'

// 互动管理
export * from './interaction'

// 足迹管理
export * from './footprint'

// 关注关系
export * from './follow'

// 文件与上传
export * from './file'

// 聊天（含群组、大厅、频道）
export * from './chat'

// AI 模块
export * from './ai'

// 举报模块
export * from './report'

// 作者申请 + 公开作者主页
export * from './author'

// 后台数据看板
export * from './dashboard'
