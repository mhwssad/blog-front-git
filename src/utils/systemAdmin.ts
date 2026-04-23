import { DateUtils } from './dateUtils'
import type { ContentOption } from './contentAdmin'

type NumericLike = number | string | null | undefined

export const MENU_TYPE_OPTIONS = [
  { label: '目录', value: 'C' },
  { label: '菜单', value: 'M' },
  { label: '按钮', value: 'B' },
] as const satisfies readonly ContentOption<string>[]

export const MENU_VISIBLE_OPTIONS = [
  { label: '隐藏', value: 0 },
  { label: '显示', value: 1 },
] as const satisfies readonly ContentOption<number>[]

export const NOTICE_TYPE_OPTIONS = [
  { label: '系统通知', value: 1 },
  { label: '活动通知', value: 2 },
] as const satisfies readonly ContentOption<number>[]

export const NOTICE_STATUS_OPTIONS = [
  { label: '草稿', value: 0 },
  { label: '已发布', value: 1 },
  { label: '已撤回', value: 2 },
] as const satisfies readonly ContentOption<number>[]

export const LOG_STATUS_OPTIONS = [
  { label: '失败', value: 0 },
  { label: '成功', value: 1 },
] as const satisfies readonly ContentOption<number>[]

export const SYSTEM_FLAG_OPTIONS = [
  { label: '否', value: 0 },
  { label: '是', value: 1 },
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
      ? normalizeNumericValue(value as NumericLike)
      : String(value ?? '').trim()

  const matched = options.find(option => {
    if (typeof option.value === 'number') {
      return option.value === targetValue
    }

    return option.value === targetValue
  })

  return matched?.label ?? '-'
}

export function formatSystemDate(
  value: string | number | Date | null | undefined,
  format = 'yyyy-MM-dd HH:mm:ss'
): string {
  if (!value) {
    return '-'
  }

  const formatted = DateUtils.formatDate(value, format)
  return formatted || '-'
}

export function formatCreateTime(value: string | number | Date | null | undefined): string {
  return formatSystemDate(value)
}

export function formatUpdateTime(value: string | number | Date | null | undefined): string {
  return formatSystemDate(value)
}

export function formatMenuType(value: string | null | undefined): string {
  return findOptionLabel(MENU_TYPE_OPTIONS, value ?? '')
}

export function formatMenuVisible(value: NumericLike): string {
  return findOptionLabel(MENU_VISIBLE_OPTIONS, value)
}

export function formatSystemFlag(value: NumericLike): string {
  return findOptionLabel(SYSTEM_FLAG_OPTIONS, value)
}

export function formatNoticeType(value: NumericLike): string {
  return findOptionLabel(NOTICE_TYPE_OPTIONS, value)
}

export function formatNoticeStatus(value: NumericLike): string {
  return findOptionLabel(NOTICE_STATUS_OPTIONS, value)
}

export function formatLogStatus(value: NumericLike): string {
  return findOptionLabel(LOG_STATUS_OPTIONS, value)
}

export function formatExecuteTime(value: NumericLike): string {
  const normalized = normalizeNumericValue(value)
  if (normalized === null) {
    return '-'
  }

  return `${normalized} ms`
}
