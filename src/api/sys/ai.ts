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

export class AiSysApi {
  // ==================== 渠道配置 ====================
  static getChannels(params?: { channelName?: string; status?: number; current?: number; size?: number }) {
    return http.get<PageResult<AiChannelConfigVO>>('/sys/ai/channels', params)
  }

  static getChannelById(id: number) {
    return http.get<AiChannelConfigVO>(`/sys/ai/channels/${id}`)
  }

  static createChannel(data: AiChannelConfigSaveRequest) {
    return http.post<AiChannelConfigVO>('/sys/ai/channels', data)
  }

  static updateChannel(id: number, data: AiChannelConfigSaveRequest) {
    return http.put<AiChannelConfigVO>(`/sys/ai/channels/${id}`, data)
  }

  static updateChannelStatus(id: number, data: AiChannelStatusRequest) {
    return http.put<void>(`/sys/ai/channels/${id}/status`, data)
  }

  static deleteChannel(id: number) {
    return http.delete<void>(`/sys/ai/channels/${id}`)
  }

  // ==================== 渠道账号池 ====================
  static getChannelAccounts(channelId: number, params?: { current?: number; size?: number }) {
    return http.get<PageResult<AiChannelAccountVO>>(`/sys/ai/channels/${channelId}/accounts`, params)
  }

  static getChannelAccountById(channelId: number, id: number) {
    return http.get<AiChannelAccountVO>(`/sys/ai/channels/${channelId}/accounts/${id}`)
  }

  static createChannelAccount(channelId: number, data: AiChannelAccountSaveRequest) {
    return http.post<AiChannelAccountVO>(`/sys/ai/channels/${channelId}/accounts`, data)
  }

  static updateChannelAccount(channelId: number, id: number, data: AiChannelAccountSaveRequest) {
    return http.put<AiChannelAccountVO>(`/sys/ai/channels/${channelId}/accounts/${id}`, data)
  }

  static updateChannelAccountStatus(channelId: number, id: number, data: { status: number }) {
    return http.put<void>(`/sys/ai/channels/${channelId}/accounts/${id}/status`, data)
  }

  static deleteChannelAccount(channelId: number, id: number) {
    return http.delete<void>(`/sys/ai/channels/${channelId}/accounts/${id}`)
  }

  // ==================== 会话管理 ====================
  static getSessions(params?: {
    userId?: number; status?: number; channelConfigId?: number
    startTime?: string; endTime?: string; current?: number; size?: number
  }) {
    return http.get<PageResult<AiSessionAdminVO>>('/sys/ai/sessions', params)
  }

  static getSessionById(id: number) {
    return http.get<AiSessionAdminVO>(`/sys/ai/sessions/${id}`)
  }

  // ==================== 使用日志 ====================
  static getUsageLogs(params?: {
    userId?: number; channelConfigId?: number; startTime?: string
    endTime?: string; successStatus?: number; current?: number; size?: number
  }) {
    return http.get<PageResult<AiUsageLogVO>>('/sys/ai/usage-logs', params)
  }

  static getUsageStats(params?: {
    userId?: number; channelConfigId?: number; startTime?: string
    endTime?: string; successStatus?: number
  }) {
    return http.get<AiUsageStatsVO>('/sys/ai/usage-logs/stats', params)
  }

  // ==================== 知识源配置 ====================
  static getKnowledgeSourceConfigs() {
    return http.get<AiKnowledgeSourceConfigVO[]>('/sys/ai/knowledge/source-config')
  }

  static getKnowledgeSourceConfigById(id: number) {
    return http.get<AiKnowledgeSourceConfigVO>(`/sys/ai/knowledge/source-config/${id}`)
  }

  static updateKnowledgeSourceConfig(id: number, data: AiKnowledgeSourceConfigUpdateRequest) {
    return http.put<AiKnowledgeSourceConfigVO>(`/sys/ai/knowledge/source-config/${id}`, data)
  }

  static toggleKnowledgeSourceConfig(id: number, enabled: number) {
    return http.put<void>(`/sys/ai/knowledge/source-config/${id}/toggle`, undefined, { params: { enabled } })
  }

  // ==================== 知识条目 ====================
  static getKnowledgeEntries(params?: AiKnowledgeEntryQueryRequest) {
    return http.get<PageResult<AiKnowledgeEntryVO>>('/sys/ai/knowledge/entries', params)
  }

  static getKnowledgeEntryById(id: number) {
    return http.get<AiKnowledgeEntryVO>(`/sys/ai/knowledge/entries/${id}`)
  }

  static updateKnowledgeEntryStatus(id: number, status: number) {
    return http.put<void>(`/sys/ai/knowledge/entries/${id}/status`, undefined, { params: { status } })
  }

  static triggerKnowledgeSync(data: AiKnowledgeSyncRequest) {
    return http.post<void>('/sys/ai/knowledge/entries/sync', data)
  }

  static getKnowledgeSyncTasks(params?: AiKnowledgeSyncTaskQueryRequest) {
    return http.get<PageResult<AiKnowledgeSyncTaskVO>>('/sys/ai/knowledge/entries/sync/tasks', params)
  }

  static getKnowledgeSyncTaskById(taskId: number) {
    return http.get<AiKnowledgeSyncTaskVO>(`/sys/ai/knowledge/entries/sync/tasks/${taskId}`)
  }

  static retryKnowledgeSyncTask(taskId: number) {
    return http.post<void>(`/sys/ai/knowledge/entries/sync/tasks/${taskId}/retry`)
  }

  // ==================== Agent 定义 ====================
  static getAgentDefinitions(params?: AiAgentDefinitionQueryRequest) {
    return http.get<PageResult<AiAgentDefinitionVO>>('/sys/ai/agents/definitions', params)
  }

  static getAgentDefinitionById(id: number) {
    return http.get<AiAgentDefinitionVO>(`/sys/ai/agents/definitions/${id}`)
  }

  static createAgentDefinition(data: AiAgentDefinitionSaveRequest) {
    return http.post<AiAgentDefinitionVO>('/sys/ai/agents/definitions', data)
  }

  static updateAgentDefinition(id: number, data: AiAgentDefinitionSaveRequest) {
    return http.put<AiAgentDefinitionVO>(`/sys/ai/agents/definitions/${id}`, data)
  }

  static toggleAgentDefinition(id: number, enabled: number) {
    return http.put<void>(`/sys/ai/agents/definitions/${id}/toggle`, undefined, { params: { enabled } })
  }

  static deleteAgentDefinition(id: number) {
    return http.delete<void>(`/sys/ai/agents/definitions/${id}`)
  }

  // ==================== Agent 任务（后台） ====================
  static getAgentTasks(params?: AiAgentTaskQueryRequest) {
    return http.get<PageResult<AiAgentTaskVO>>('/sys/ai/agents/tasks', params)
  }

  static getAgentTaskById(id: number) {
    return http.get<AiAgentTaskVO>(`/sys/ai/agents/tasks/${id}`)
  }

  // ==================== 工具管理 ====================
  static getTools(params?: AiToolQueryRequest) {
    return http.get<PageResult<AiToolVO>>('/sys/ai/tools', params)
  }

  static getToolById(id: number) {
    return http.get<AiToolVO>(`/sys/ai/tools/${id}`)
  }

  static createTool(data: AiToolSaveRequest) {
    return http.post<AiToolVO>('/sys/ai/tools', data)
  }

  static updateTool(id: number, data: AiToolSaveRequest) {
    return http.put<AiToolVO>(`/sys/ai/tools/${id}`, data)
  }

  static updateToolStatus(id: number, enabled: number) {
    return http.put<void>(`/sys/ai/tools/${id}/status`, undefined, { params: { enabled } })
  }

  static deleteTool(id: number) {
    return http.delete<void>(`/sys/ai/tools/${id}`)
  }

  static executeTool(id: number, data: AiToolExecuteRequest) {
    return http.post<AiToolExecuteResultVO>(`/sys/ai/tools/${id}/execute`, data)
  }

  // ==================== 工具调用日志 ====================
  static getToolCallLogs(params?: AiToolCallLogQueryRequest) {
    return http.get<PageResult<AiToolCallLogVO>>('/sys/ai/tools/call-logs', params)
  }

  // ==================== 工具授权 ====================
  static getToolAuthorizations(params?: AiToolAuthorizationQueryRequest) {
    return http.get<PageResult<AiToolAuthorizationVO>>('/sys/ai/tools/authorizations', params)
  }

  static createToolAuthorization(data: AiToolAuthorizationSaveRequest) {
    return http.post<AiToolAuthorizationVO>('/sys/ai/tools/authorizations', data)
  }

  static updateToolAuthorization(id: number, data: AiToolAuthorizationSaveRequest) {
    return http.put<AiToolAuthorizationVO>(`/sys/ai/tools/authorizations/${id}`, data)
  }

  static deleteToolAuthorization(id: number) {
    return http.delete<void>(`/sys/ai/tools/authorizations/${id}`)
  }

  // ==================== MCP 服务管理 ====================
  static getMcpServers(params?: AiMcpServerQueryRequest) {
    return http.get<PageResult<AiMcpServerVO>>('/sys/ai/mcp-servers', params)
  }

  static getMcpServerById(id: number) {
    return http.get<AiMcpServerVO>(`/sys/ai/mcp-servers/${id}`)
  }

  static createMcpServer(data: AiMcpServerSaveRequest) {
    return http.post<AiMcpServerVO>('/sys/ai/mcp-servers', data)
  }

  static updateMcpServer(id: number, data: AiMcpServerSaveRequest) {
    return http.put<AiMcpServerVO>(`/sys/ai/mcp-servers/${id}`, data)
  }

  static updateMcpServerStatus(id: number, enabled: number) {
    return http.put<void>(`/sys/ai/mcp-servers/${id}/status`, undefined, { params: { enabled } })
  }

  static deleteMcpServer(id: number) {
    return http.delete<void>(`/sys/ai/mcp-servers/${id}`)
  }

  static discoverMcpTools(id: number) {
    return http.post<AiMcpDiscoverResultVO>(`/sys/ai/mcp-servers/${id}/discover`)
  }

  static getMcpServerTools(id: number) {
    return http.get<AiMcpToolSnapshotVO[]>(`/sys/ai/mcp-servers/${id}/tools`)
  }

  static getMcpServerHealth(id: number) {
    return http.get<AiMcpHealthVO>(`/sys/ai/mcp-servers/${id}/health`)
  }
}
