import { DateUtils } from './dateUtils'

type NumericLike = number | string | null | undefined

export interface ContentOption<T extends string | number = number> {
  label: string
  value: T
}

export const ARTICLE_STATUS_OPTIONS = [
  { label: '草稿', value: 0 },
  { label: '已发布', value: 1 },
  { label: '待发布', value: 2 },
  { label: '已下架', value: 3 },
] as const satisfies readonly ContentOption<number>[]

export const CATEGORY_STATUS_OPTIONS = [
  { label: '禁用', value: 0 },
  { label: '启用', value: 1 },
] as const satisfies readonly ContentOption<number>[]

export const COMMENT_STATUS_OPTIONS = [
  { label: '隐藏', value: 0 },
  { label: '展示', value: 1 },
] as const satisfies readonly ContentOption<number>[]

export const ACCESS_LEVEL_OPTIONS = [
  { label: '公开', value: 0 },
  { label: '登录可见', value: 1 },
  { label: '付费可见', value: 2 },
  { label: 'VIP 可见', value: 3 },
  { label: '指定用户可见', value: 4 },
] as const satisfies readonly ContentOption<number>[]

export const ACCESS_TYPE_OPTIONS = [
  { label: '白名单', value: 1 },
  { label: '黑名单', value: 2 },
] as const satisfies readonly ContentOption<number>[]

export const TARGET_TYPE_OPTIONS = [
  { label: '文章', value: 'article' },
  { label: '评论', value: 'comment' },
] as const satisfies readonly ContentOption<string>[]

export const INTERACTION_TYPE_OPTIONS = [
  { label: '点赞', value: 'like' },
] as const satisfies readonly ContentOption<string>[]

export const BOOLEAN_TEXT_OPTIONS = [
  { label: '否', value: 0 },
  { label: '是', value: 1 },
] as const satisfies readonly ContentOption<number>[]

export const VISIBILITY_OPTIONS = [
  { label: '私有', value: 0 },
  { label: '公开', value: 1 },
] as const satisfies readonly ContentOption<number>[]

export const DEFAULT_FLAG_OPTIONS = [
  { label: '普通', value: 0 },
  { label: '默认', value: 1 },
] as const satisfies readonly ContentOption<number>[]

export const FOLLOW_STATUS_OPTIONS = [
  { label: '已取关', value: 0 },
  { label: '关注中', value: 1 },
  { label: '异常关系', value: 2 },
] as const satisfies readonly ContentOption<number>[]

export const FILE_STATUS_OPTIONS = [
  { label: '待校验', value: 0 },
  { label: '可用', value: 1 },
  { label: '禁用', value: 2 },
  { label: '已删除', value: 3 },
] as const satisfies readonly ContentOption<number>[]

export const FILE_TASK_STATUS_OPTIONS = [
  { label: '待上传', value: 0 },
  { label: '上传中', value: 1 },
  { label: '成功', value: 2 },
  { label: '失败', value: 3 },
] as const satisfies readonly ContentOption<number>[]

export const CHAT_CONVERSATION_TYPE_OPTIONS = [
  { label: '单聊', value: 'single' },
  { label: '群聊', value: 'group' },
  { label: '全站', value: 'global' },
] as const satisfies readonly ContentOption<string>[]

export const CHAT_SCENE_TYPE_OPTIONS = [
  { label: '单聊', value: 'single_chat' },
  { label: '群聊', value: 'group_chat' },
  { label: '用户群', value: 'user_group' },
  { label: '大厅频道', value: 'hall_channel' },
  { label: '主题频道', value: 'topic_channel' },
  { label: '公开频道', value: 'public_channel' },
  { label: '全局频道', value: 'global_channel' },
] as const satisfies readonly ContentOption<string>[]

export const CHAT_CONVERSATION_STATUS_OPTIONS = [
  { label: '冻结', value: 0 },
  { label: '正常', value: 1 },
] as const satisfies readonly ContentOption<number>[]

export const CHAT_VISIBILITY_SCOPE_OPTIONS = [
  { label: '公开', value: 'public' },
  { label: '成员可见', value: 'member' },
  { label: '私密', value: 'private' },
] as const satisfies readonly ContentOption<string>[]

export const CHAT_JOIN_RULE_OPTIONS = [
  { label: '自由加入', value: 'free' },
  { label: '审批加入', value: 'approval' },
  { label: '邀请制', value: 'invite_only' },
] as const satisfies readonly ContentOption<string>[]

export const CHAT_MESSAGE_TYPE_OPTIONS = [
  { label: '文本', value: 'text' },
  { label: '文件', value: 'file' },
  { label: '图片', value: 'image' },
  { label: '语音', value: 'voice' },
] as const satisfies readonly ContentOption<string>[]

export const CHAT_DELIVERY_STATUS_OPTIONS = [
  { label: '待送达', value: 0 },
  { label: '已送达', value: 1 },
  { label: '已读', value: 2 },
] as const satisfies readonly ContentOption<number>[]

export const CHAT_VISIBLE_STATUS_OPTIONS = [
  { label: '隐藏', value: 0 },
  { label: '可见', value: 1 },
] as const satisfies readonly ContentOption<number>[]

export const CHAT_MEMBER_ROLE_OPTIONS = [
  { label: '群主', value: 'owner' },
  { label: '管理员', value: 'admin' },
  { label: '成员', value: 'member' },
] as const satisfies readonly ContentOption<string>[]

export const CHAT_MEMBER_STATUS_OPTIONS = [
  { label: '禁用', value: 0 },
  { label: '正常', value: 1 },
] as const satisfies readonly ContentOption<number>[]

function normalizeNumericValue(value: NumericLike): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const normalized = Number(value)
  return Number.isNaN(normalized) ? null : normalized
}

function findOptionLabel<T extends string | number>(
  options: readonly ContentOption<T>[],
  value: T | NumericLike
): string {
  const targetValue =
    typeof options[0]?.value === 'number'
      ? normalizeNumericValue(value)
      : String(value ?? '').trim()

  const matched = options.find(option => {
    if (typeof option.value === 'number') {
      return option.value === targetValue
    }

    return option.value === targetValue
  })

  return matched?.label ?? '-'
}

export function formatContentDate(
  value: string | number | Date | null | undefined,
  format = 'yyyy-MM-dd HH:mm:ss'
): string {
  if (!value) {
    return '-'
  }

  const formatted = DateUtils.formatDate(value, format)
  return formatted || '-'
}

export function formatCreatedAt(value: string | number | Date | null | undefined): string {
  return formatContentDate(value)
}

export function formatUpdatedAt(value: string | number | Date | null | undefined): string {
  return formatContentDate(value)
}

export function formatPublishTime(value: string | number | Date | null | undefined): string {
  return formatContentDate(value)
}

export function formatVisitedAt(value: string | number | Date | null | undefined): string {
  return formatContentDate(value)
}

export function formatArticleStatus(value: NumericLike): string {
  return findOptionLabel(ARTICLE_STATUS_OPTIONS, value)
}

export function formatCategoryStatus(value: NumericLike): string {
  return findOptionLabel(CATEGORY_STATUS_OPTIONS, value)
}

export function formatCommentStatus(value: NumericLike): string {
  return findOptionLabel(COMMENT_STATUS_OPTIONS, value)
}

export function formatAccessLevel(value: NumericLike): string {
  return findOptionLabel(ACCESS_LEVEL_OPTIONS, value)
}

export function formatAccessType(value: NumericLike): string {
  return findOptionLabel(ACCESS_TYPE_OPTIONS, value)
}

export function formatTargetType(value: string | null | undefined): string {
  return findOptionLabel(TARGET_TYPE_OPTIONS, value ?? '')
}

export function formatInteractionType(value: string | null | undefined): string {
  return findOptionLabel(INTERACTION_TYPE_OPTIONS, value ?? '')
}

export function formatBooleanText(value: NumericLike): string {
  return findOptionLabel(BOOLEAN_TEXT_OPTIONS, value)
}

export function formatVisibility(value: NumericLike): string {
  return findOptionLabel(VISIBILITY_OPTIONS, value)
}

export function formatDefaultFlag(value: NumericLike): string {
  return findOptionLabel(DEFAULT_FLAG_OPTIONS, value)
}

export function formatFollowStatus(value: NumericLike): string {
  return findOptionLabel(FOLLOW_STATUS_OPTIONS, value)
}

export function formatFileStatus(value: NumericLike): string {
  return findOptionLabel(FILE_STATUS_OPTIONS, value)
}

export function formatFileTaskStatus(value: NumericLike): string {
  return findOptionLabel(FILE_TASK_STATUS_OPTIONS, value)
}

export function formatChatConversationType(value: string | null | undefined): string {
  return findOptionLabel(CHAT_CONVERSATION_TYPE_OPTIONS, value ?? '')
}

export function formatChatSceneType(value: string | null | undefined): string {
  return findOptionLabel(CHAT_SCENE_TYPE_OPTIONS, value ?? '')
}

export function formatChatConversationStatus(value: NumericLike): string {
  return findOptionLabel(CHAT_CONVERSATION_STATUS_OPTIONS, value)
}

export function formatChatVisibilityScope(value: string | null | undefined): string {
  return findOptionLabel(CHAT_VISIBILITY_SCOPE_OPTIONS, value ?? '')
}

export function formatChatJoinRule(value: string | null | undefined): string {
  return findOptionLabel(CHAT_JOIN_RULE_OPTIONS, value ?? '')
}

export function formatChatMessageType(value: string | null | undefined): string {
  return findOptionLabel(CHAT_MESSAGE_TYPE_OPTIONS, value ?? '')
}

export function formatChatDeliveryStatus(value: NumericLike): string {
  return findOptionLabel(CHAT_DELIVERY_STATUS_OPTIONS, value)
}

export function formatChatVisibleStatus(value: NumericLike): string {
  return findOptionLabel(CHAT_VISIBLE_STATUS_OPTIONS, value)
}

export function formatChatMemberRole(value: string | null | undefined): string {
  return findOptionLabel(CHAT_MEMBER_ROLE_OPTIONS, value ?? '')
}

export function formatChatMemberStatus(value: NumericLike): string {
  return findOptionLabel(CHAT_MEMBER_STATUS_OPTIONS, value)
}

export function formatOptionalText(value: string | null | undefined): string {
  const normalized = value?.trim()
  return normalized ? normalized : '-'
}

export function toStatusSwitchValue(value: NumericLike, fallback = 0): number {
  return normalizeNumericValue(value) ?? fallback
}
