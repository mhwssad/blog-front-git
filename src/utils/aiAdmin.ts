import { DateUtils } from './dateUtils'
import type { ContentOption } from './contentAdmin'

type NumericLike = number | string | null | undefined

export const AI_CHANNEL_STATUS_OPTIONS = [
  { label: '停用', value: 0 },
  { label: '启用', value: 1 },
] as const satisfies readonly ContentOption<number>[]

export const AI_SESSION_STATUS_OPTIONS = [
  { label: '已关闭', value: 0 },
  { label: '正常', value: 1 },
] as const satisfies readonly ContentOption<number>[]

export const AI_SUCCESS_STATUS_OPTIONS = [
  { label: '失败', value: 0 },
  { label: '成功', value: 1 },
] as const satisfies readonly ContentOption<number>[]

export const AI_SCENE_TYPE_OPTIONS = [
  { label: '通用', value: 'general' },
  { label: '文章', value: 'article' },
  { label: '聊天', value: 'chat' },
  { label: '资料', value: 'profile' },
] as const satisfies readonly ContentOption<string>[]

function findOptionLabel<T extends string | number>(
  options: readonly ContentOption<T>[],
  value: T | NumericLike,
): string {
  const targetValue =
    typeof options[0]?.value === 'number' ? (Number(value) || null) : String(value ?? '').trim()
  const matched = options.find(option => option.value === (targetValue as T))
  return matched?.label ?? '-'
}

export function formatAiDate(
  value: string | number | Date | null | undefined,
  format = 'yyyy-MM-dd HH:mm:ss',
): string {
  if (!value) return '-'
  return DateUtils.formatDate(value, format) || '-'
}

export function formatAiChannelStatus(value: NumericLike): string {
  return findOptionLabel(AI_CHANNEL_STATUS_OPTIONS, value)
}

export function formatAiSessionStatus(value: NumericLike): string {
  return findOptionLabel(AI_SESSION_STATUS_OPTIONS, value)
}

export function formatAiSuccessStatus(value: NumericLike): string {
  return findOptionLabel(AI_SUCCESS_STATUS_OPTIONS, value)
}

export function formatAiSceneType(value: string | null | undefined): string {
  return findOptionLabel(AI_SCENE_TYPE_OPTIONS, value ?? '')
}
