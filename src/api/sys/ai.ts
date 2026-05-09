/**
 * AI 后台管理 API
 * @see docs/api文档/ai-api.md
 */

import { http } from '../request'
import type {
  AiChannelConfigVO,
  AiChannelConfigSaveRequest,
  AiChannelStatusRequest,
  AiChannelAccountVO,
  AiChannelAccountSaveRequest,
  AiSessionAdminVO,
  AiUsageLogVO,
  AiUsageStatsVO,
  AiKnowledgeSourceConfigVO,
  AiKnowledgeSourceConfigUpdateRequest,
  AiKnowledgeEntryVO,
  AiKnowledgeEntryQueryRequest,
  AiKnowledgeSyncRequest,
  AiKnowledgeSyncTaskVO,
  AiKnowledgeSyncTaskQueryRequest,
  AiAgentDefinitionVO,
  AiAgentDefinitionSaveRequest,
  AiAgentDefinitionQueryRequest,
  AiAgentTaskVO,
  AiAgentTaskQueryRequest,
  AiToolVO,
  AiToolSaveRequest,
  AiToolQueryRequest,
  AiToolExecuteRequest,
  AiToolExecuteResultVO,
  AiToolCallLogVO,
  AiToolCallLogQueryRequest,
  AiToolAuthorizationVO,
  AiToolAuthorizationSaveRequest,
  AiToolAuthorizationQueryRequest,
  AiMcpServerVO,
  AiMcpServerSaveRequest,
  AiMcpServerQueryRequest,
  AiMcpDiscoverResultVO,
  AiMcpToolSnapshotVO,
  AiMcpHealthVO,
  PageResult,
} from '@/types/api-types'

export const aiSysApi = {
  // ==================== 渠道配置 ====================
  getChannels: (params?: { channelName?: string; status?: number; current?: number; size?: number }) =>
    http.get<PageResult<AiChannelConfigVO>>('/sys/ai/channels', params),

  getChannelById: (id: number) =>
    http.get<AiChannelConfigVO>(`/sys/ai/channels/${id}`),

  createChannel: (data: AiChannelConfigSaveRequest) =>
    http.post<AiChannelConfigVO>('/sys/ai/channels', data),

  updateChannel: (id: number, data: AiChannelConfigSaveRequest) =>
    http.put<AiChannelConfigVO>(`/sys/ai/channels/${id}`, data),

  updateChannelStatus: (id: number, data: AiChannelStatusRequest) =>
    http.put<void>(`/sys/ai/channels/${id}/status`, data),

  deleteChannel: (id: number) =>
    http.delete<void>(`/sys/ai/channels/${id}`),

  // ==================== 渠道账号池 ====================
  getChannelAccounts: (channelId: number, params?: { current?: number; size?: number }) =>
    http.get<PageResult<AiChannelAccountVO>>(`/sys/ai/channels/${channelId}/accounts`, params),

  getChannelAccountById: (channelId: number, id: number) =>
    http.get<AiChannelAccountVO>(`/sys/ai/channels/${channelId}/accounts/${id}`),

  createChannelAccount: (channelId: number, data: AiChannelAccountSaveRequest) =>
    http.post<AiChannelAccountVO>(`/sys/ai/channels/${channelId}/accounts`, data),

  updateChannelAccount: (channelId: number, id: number, data: AiChannelAccountSaveRequest) =>
    http.put<AiChannelAccountVO>(`/sys/ai/channels/${channelId}/accounts/${id}`, data),

  updateChannelAccountStatus: (channelId: number, id: number, data: { status: number }) =>
    http.put<void>(`/sys/ai/channels/${channelId}/accounts/${id}/status`, data),

  deleteChannelAccount: (channelId: number, id: number) =>
    http.delete<void>(`/sys/ai/channels/${channelId}/accounts/${id}`),

  // ==================== 会话管理 ====================
  getSessions: (params?: {
    userId?: number; status?: number; channelConfigId?: number
    startTime?: string; endTime?: string; current?: number; size?: number
  }) =>
    http.get<PageResult<AiSessionAdminVO>>('/sys/ai/sessions', params),

  getSessionById: (id: number) =>
    http.get<AiSessionAdminVO>(`/sys/ai/sessions/${id}`),

  // ==================== 使用日志 ====================
  getUsageLogs: (params?: {
    userId?: number; channelConfigId?: number; startTime?: string
    endTime?: string; successStatus?: number; current?: number; size?: number
  }) =>
    http.get<PageResult<AiUsageLogVO>>('/sys/ai/usage-logs', params),

  getUsageStats: (params?: {
    userId?: number; channelConfigId?: number; startTime?: string
    endTime?: string; successStatus?: number
  }) =>
    http.get<AiUsageStatsVO>('/sys/ai/usage-logs/stats', params),

  // ==================== 知识源配置 ====================
  getKnowledgeSourceConfigs: () =>
    http.get<AiKnowledgeSourceConfigVO[]>('/sys/ai/knowledge/source-config'),

  getKnowledgeSourceConfigById: (id: number) =>
    http.get<AiKnowledgeSourceConfigVO>(`/sys/ai/knowledge/source-config/${id}`),

  updateKnowledgeSourceConfig: (id: number, data: AiKnowledgeSourceConfigUpdateRequest) =>
    http.put<AiKnowledgeSourceConfigVO>(`/sys/ai/knowledge/source-config/${id}`, data),

  toggleKnowledgeSourceConfig: (id: number, enabled: number) =>
    http.put<void>(`/sys/ai/knowledge/source-config/${id}/toggle`, undefined, { params: { enabled } }),

  // ==================== 知识条目 ====================
  getKnowledgeEntries: (params?: AiKnowledgeEntryQueryRequest) =>
    http.get<PageResult<AiKnowledgeEntryVO>>('/sys/ai/knowledge/entries', params),

  getKnowledgeEntryById: (id: number) =>
    http.get<AiKnowledgeEntryVO>(`/sys/ai/knowledge/entries/${id}`),

  updateKnowledgeEntryStatus: (id: number, status: number) =>
    http.put<void>(`/sys/ai/knowledge/entries/${id}/status`, undefined, { params: { status } }),

  triggerKnowledgeSync: (data: AiKnowledgeSyncRequest) =>
    http.post<void>('/sys/ai/knowledge/entries/sync', data),

  getKnowledgeSyncTasks: (params?: AiKnowledgeSyncTaskQueryRequest) =>
    http.get<PageResult<AiKnowledgeSyncTaskVO>>('/sys/ai/knowledge/entries/sync/tasks', params),

  getKnowledgeSyncTaskById: (taskId: number) =>
    http.get<AiKnowledgeSyncTaskVO>(`/sys/ai/knowledge/entries/sync/tasks/${taskId}`),

  retryKnowledgeSyncTask: (taskId: number) =>
    http.post<void>(`/sys/ai/knowledge/entries/sync/tasks/${taskId}/retry`),

  // ==================== Agent 定义 ====================
  getAgentDefinitions: (params?: AiAgentDefinitionQueryRequest) =>
    http.get<PageResult<AiAgentDefinitionVO>>('/sys/ai/agents/definitions', params),

  getAgentDefinitionById: (id: number) =>
    http.get<AiAgentDefinitionVO>(`/sys/ai/agents/definitions/${id}`),

  createAgentDefinition: (data: AiAgentDefinitionSaveRequest) =>
    http.post<AiAgentDefinitionVO>('/sys/ai/agents/definitions', data),

  updateAgentDefinition: (id: number, data: AiAgentDefinitionSaveRequest) =>
    http.put<AiAgentDefinitionVO>(`/sys/ai/agents/definitions/${id}`, data),

  toggleAgentDefinition: (id: number, enabled: number) =>
    http.put<void>(`/sys/ai/agents/definitions/${id}/toggle`, undefined, { params: { enabled } }),

  deleteAgentDefinition: (id: number) =>
    http.delete<void>(`/sys/ai/agents/definitions/${id}`),

  // ==================== Agent 任务（后台） ====================
  getAgentTasks: (params?: AiAgentTaskQueryRequest) =>
    http.get<PageResult<AiAgentTaskVO>>('/sys/ai/agents/tasks', params),

  getAgentTaskById: (id: number) =>
    http.get<AiAgentTaskVO>(`/sys/ai/agents/tasks/${id}`),

  // ==================== 工具管理 ====================
  getTools: (params?: AiToolQueryRequest) =>
    http.get<PageResult<AiToolVO>>('/sys/ai/tools', params),

  getToolById: (id: number) =>
    http.get<AiToolVO>(`/sys/ai/tools/${id}`),

  createTool: (data: AiToolSaveRequest) =>
    http.post<AiToolVO>('/sys/ai/tools', data),

  updateTool: (id: number, data: AiToolSaveRequest) =>
    http.put<AiToolVO>(`/sys/ai/tools/${id}`, data),

  updateToolStatus: (id: number, enabled: number) =>
    http.put<void>(`/sys/ai/tools/${id}/status`, undefined, { params: { enabled } }),

  deleteTool: (id: number) =>
    http.delete<void>(`/sys/ai/tools/${id}`),

  executeTool: (id: number, data: AiToolExecuteRequest) =>
    http.post<AiToolExecuteResultVO>(`/sys/ai/tools/${id}/execute`, data),

  // ==================== 工具调用日志 ====================
  getToolCallLogs: (params?: AiToolCallLogQueryRequest) =>
    http.get<PageResult<AiToolCallLogVO>>('/sys/ai/tools/call-logs', params),

  // ==================== 工具授权 ====================
  getToolAuthorizations: (params?: AiToolAuthorizationQueryRequest) =>
    http.get<PageResult<AiToolAuthorizationVO>>('/sys/ai/tools/authorizations', params),

  createToolAuthorization: (data: AiToolAuthorizationSaveRequest) =>
    http.post<AiToolAuthorizationVO>('/sys/ai/tools/authorizations', data),

  updateToolAuthorization: (id: number, data: AiToolAuthorizationSaveRequest) =>
    http.put<AiToolAuthorizationVO>(`/sys/ai/tools/authorizations/${id}`, data),

  deleteToolAuthorization: (id: number) =>
    http.delete<void>(`/sys/ai/tools/authorizations/${id}`),

  // ==================== MCP 服务管理 ====================
  getMcpServers: (params?: AiMcpServerQueryRequest) =>
    http.get<PageResult<AiMcpServerVO>>('/sys/ai/mcp-servers', params),

  getMcpServerById: (id: number) =>
    http.get<AiMcpServerVO>(`/sys/ai/mcp-servers/${id}`),

  createMcpServer: (data: AiMcpServerSaveRequest) =>
    http.post<AiMcpServerVO>('/sys/ai/mcp-servers', data),

  updateMcpServer: (id: number, data: AiMcpServerSaveRequest) =>
    http.put<AiMcpServerVO>(`/sys/ai/mcp-servers/${id}`, data),

  updateMcpServerStatus: (id: number, enabled: number) =>
    http.put<void>(`/sys/ai/mcp-servers/${id}/status`, undefined, { params: { enabled } }),

  deleteMcpServer: (id: number) =>
    http.delete<void>(`/sys/ai/mcp-servers/${id}`),

  discoverMcpTools: (id: number) =>
    http.post<AiMcpDiscoverResultVO>(`/sys/ai/mcp-servers/${id}/discover`),

  getMcpServerTools: (id: number) =>
    http.get<AiMcpToolSnapshotVO[]>(`/sys/ai/mcp-servers/${id}/tools`),

  getMcpServerHealth: (id: number) =>
    http.get<AiMcpHealthVO>(`/sys/ai/mcp-servers/${id}/health`),
}
