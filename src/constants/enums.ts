/**
 * 集中式枚举 / 常量定义
 * 统一导出所有业务枚举选项与格式化函数
 *
 * 使用方式：import { XXX_OPTIONS, formatXxx } from '@/constants/enums'
 */

// ==================== 从已有模块 re-export ====================
export {
  // 文章
  ARTICLE_STATUS_OPTIONS,
  formatArticleStatus,
  // 分类
  CATEGORY_STATUS_OPTIONS,
  formatCategoryStatus,
  // 评论
  COMMENT_STATUS_OPTIONS,
  formatCommentStatus,
  // 访问级别
  ACCESS_LEVEL_OPTIONS,
  formatAccessLevel,
  ACCESS_TYPE_OPTIONS,
  formatAccessType,
  // 目标类型
  TARGET_TYPE_OPTIONS,
  formatTargetType,
  // 互动
  INTERACTION_TYPE_OPTIONS,
  formatInteractionType,
  // 布尔值
  BOOLEAN_TEXT_OPTIONS,
  formatBooleanText,
  // 可见性
  VISIBILITY_OPTIONS,
  formatVisibility,
  // 默认标记
  DEFAULT_FLAG_OPTIONS,
  formatDefaultFlag,
  // 关注
  FOLLOW_STATUS_OPTIONS,
  formatFollowStatus,
  // 文件
  FILE_STATUS_OPTIONS,
  formatFileStatus,
  FILE_TASK_STATUS_OPTIONS,
  formatFileTaskStatus,
  // 聊天
  CHAT_CONVERSATION_TYPE_OPTIONS,
  formatChatConversationType,
  CHAT_CONVERSATION_STATUS_OPTIONS,
  formatChatConversationStatus,
  CHAT_MESSAGE_TYPE_OPTIONS,
  formatChatMessageType,
  CHAT_DELIVERY_STATUS_OPTIONS,
  formatChatDeliveryStatus,
  CHAT_VISIBLE_STATUS_OPTIONS,
  formatChatVisibleStatus,
  CHAT_MEMBER_ROLE_OPTIONS,
  formatChatMemberRole,
  CHAT_MEMBER_STATUS_OPTIONS,
  formatChatMemberStatus,
  // 通用
  formatContentDate,
  formatCreatedAt,
  formatUpdatedAt,
  formatPublishTime,
  formatOptionalText,
  toStatusSwitchValue,
  type ContentOption,
} from '@/utils/contentAdmin'

export {
  // AI 渠道状态
  AI_CHANNEL_STATUS_OPTIONS,
  // AI 会话状态
  AI_SESSION_STATUS_OPTIONS,
  // AI 成功状态
  AI_SUCCESS_STATUS_OPTIONS,
  // AI 场景类型
  AI_SCENE_TYPE_OPTIONS,
  // 格式化
  formatAiDate,
  formatAiChannelStatus,
  formatAiSessionStatus,
  formatAiSuccessStatus,
  formatAiSceneType,
} from '@/utils/aiAdmin'

// ==================== 补充散落在各页面的枚举 ====================

export const REVIEW_STATUS_OPTIONS = [
  { label: '未送审', value: 0 },
  { label: '审核中', value: 1 },
  { label: '审核通过', value: 2 },
  { label: '审核拒绝', value: 3 },
] as const

export const REPORT_STATUS_OPTIONS = [
  { label: '待处理', value: 0 },
  { label: '处理中', value: 1 },
  { label: '已处理', value: 2 },
  { label: '已驳回', value: 3 },
] as const

export const REPORT_TARGET_TYPE_OPTIONS = [
  { label: '文章', value: 'article' },
  { label: '评论', value: 'comment' },
  { label: '消息', value: 'chat_message' },
  { label: '用户', value: 'user' },
] as const

export const APPLY_STATUS_OPTIONS = [
  { label: '待审核', value: 0 },
  { label: '已通过', value: 1 },
  { label: '已拒绝', value: 2 },
] as const

export const AUTHOR_APPLY_STATUS_OPTIONS = [
  { label: '待审核', value: 0 },
  { label: '已通过', value: 1 },
  { label: '已拒绝', value: 2 },
  { label: '已撤回', value: 3 },
] as const

export const USER_STATUS_OPTIONS = [
  { label: '禁用', value: 0 },
  { label: '正常', value: 1 },
] as const

export const ROLE_STATUS_OPTIONS = [
  { label: '禁用', value: 0 },
  { label: '启用', value: 1 },
] as const

export const GENDER_OPTIONS = [
  { label: '未知', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 },
] as const

export const NOTICE_TYPE_OPTIONS = [
  { label: '通知', value: 0 },
  { label: '公告', value: 1 },
] as const

export const NOTICE_PUBLISH_STATUS_OPTIONS = [
  { label: '未发布', value: 0 },
  { label: '已发布', value: 1 },
] as const

export const REPORT_HANDLE_RESULT_OPTIONS = [
  { label: '删除内容', value: 'delete_content' },
  { label: '撤销消息', value: 'revoke_message' },
  { label: '禁言用户', value: 'mute_user' },
  { label: '封禁账号', value: 'ban_user' },
  { label: '仅记录', value: 'record_only' },
] as const
