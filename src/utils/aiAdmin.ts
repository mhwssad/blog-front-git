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
  { label: '论坛', value: 'forum' },
  { label: '知识库', value: 'knowledge' },
  { label: '代码', value: 'code' },
] as const satisfies readonly ContentOption<string>[]

export const AI_KNOWLEDGE_SOURCE_TYPE_OPTIONS = [
  { label: '公开文章', value: 'public_article' },
  { label: '公开资料', value: 'public_profile' },
  { label: '外部文档', value: 'external_doc' },
] as const satisfies readonly ContentOption<string>[]

export const AI_TOOL_SOURCE_TYPE_OPTIONS = [
  { label: '内置', value: 'builtin' },
  { label: 'MCP', value: 'mcp' },
  { label: '自定义', value: 'custom' },
] as const satisfies readonly ContentOption<string>[]

export const AI_TOOL_RISK_LEVEL_OPTIONS = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
] as const satisfies readonly ContentOption<string>[]

export const AI_MCP_TRANSPORT_TYPE_OPTIONS = [
  { label: 'HTTP', value: 'http' },
  { label: 'SSE', value: 'sse' },
  { label: 'Stdio', value: 'stdio' },
] as const satisfies readonly ContentOption<string>[]

export const AI_SYNC_TASK_STATUS_OPTIONS = [
  { label: '待处理', value: 0 },
  { label: '进行中', value: 1 },
  { label: '已完成', value: 2 },
  { label: '失败', value: 3 },
] as const satisfies readonly ContentOption<number>[]

export const AI_AGENT_TASK_STATUS_OPTIONS = [
  { label: '待处理', value: 0 },
  { label: '运行中', value: 1 },
  { label: '已完成', value: 2 },
  { label: '失败', value: 3 },
  { label: '已取消', value: 4 },
] as const satisfies readonly ContentOption<number>[]

export const AI_KNOWLEDGE_ENTRY_STATUS_OPTIONS = [
  { label: '待索引', value: 0 },
  { label: '已索引', value: 1 },
  { label: '索引失败', value: 2 },
] as const satisfies readonly ContentOption<number>[]

export const AI_AUTHORIZATION_TYPE_OPTIONS = [
  { label: 'API Key', value: 'api_key' },
  { label: 'OAuth', value: 'oauth' },
  { label: '自定义', value: 'custom' },
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

export function formatAiSourceType(value: string | null | undefined): string {
  return findOptionLabel(AI_KNOWLEDGE_SOURCE_TYPE_OPTIONS, value ?? '')
}

export function formatAiToolRiskLevel(value: string | null | undefined): string {
  return findOptionLabel(AI_TOOL_RISK_LEVEL_OPTIONS, value ?? '')
}

export function formatAiTransportType(value: string | null | undefined): string {
  return findOptionLabel(AI_MCP_TRANSPORT_TYPE_OPTIONS, value ?? '')
}

export function formatAiSyncTaskStatus(value: NumericLike): string {
  return findOptionLabel(AI_SYNC_TASK_STATUS_OPTIONS, value)
}

export function formatAiAgentTaskStatus(value: NumericLike): string {
  return findOptionLabel(AI_AGENT_TASK_STATUS_OPTIONS, value)
}

export function formatAiEntryStatus(value: NumericLike): string {
  return findOptionLabel(AI_KNOWLEDGE_ENTRY_STATUS_OPTIONS, value)
}

export function formatAiAuthType(value: string | null | undefined): string {
  return findOptionLabel(AI_AUTHORIZATION_TYPE_OPTIONS, value ?? '')
}
