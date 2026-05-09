/**
 * AI 模块类型
 * @module api-types/ai
 * @see docs/api文档/ai-api.md
 */

// ==================== 用户侧接口 ====================

/**
 * 创建AI会话请求
 * @description 用户创建新的AI会话
 * @interface AiSessionCreateRequest
 * @see POST /api/user/ai/sessions
 *
 * @example
 * ```typescript
 * {
 *   channelConfigId: 1,  // 可选，不填则使用默认渠道
 *   title: "我的对话",    // 可选，会话标题
 *   sceneType: "general" // 可选，默认 general
 * }
 * ```
 */
export interface AiSessionCreateRequest {
  /** 渠道配置ID，不填则使用默认渠道 */
  channelConfigId?: number
  /** 会话标题 */
  title?: string
  /** 会话场景，默认 general */
  sceneType?: string
}

/**
 * AI会话视图对象
 * @description 用户AI会话基本信息
 * @interface AiSessionVO
 * @see GET /api/user/ai/sessions - 响应
 * @see GET /api/user/ai/sessions/{id} - 响应
 */
export interface AiSessionVO {
  /** 会话ID */
  id: number
  /** 会话标题 */
  title: string
  /** 渠道配置ID */
  channelConfigId: number
  /** 会话场景 */
  sceneType: string
  /** 状态：0-关闭，1-正常 */
  status: number
  /** 最后消息时间 */
  lastMessageAt?: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt?: string
}

/**
 * AI会话详情视图对象
 * @description 继承AiSessionVO，额外包含渠道名称和模型名称
 * @interface AiSessionDetailVO
 * @extends AiSessionVO
 * @see GET /api/user/ai/sessions/{id} - 响应
 */
export interface AiSessionDetailVO extends AiSessionVO {
  /** 渠道名称 */
  channelName: string
  /** 模型名称 */
  modelName: string
}

/**
 * AI消息RAG引用视图对象
 * @description AI消息中引用的知识库条目
 * @interface AiRagReferenceVO
 */
export interface AiRagReferenceVO {
  /** 来源类型：public_article 等 */
  sourceType: string
  /** 来源ID */
  sourceId: number
  /** 条目ID */
  entryId: number
  /** 标题 */
  title: string
  /** 来源URL */
  sourceUrl?: string
  /** 分块索引 */
  chunkIndex?: number
  /** 相似度得分 */
  score?: number
}

/**
 * AI消息附件视图对象
 * @description AI消息中的附件
 * @interface AiAttachmentVO
 */
export interface AiAttachmentVO {
  /** 文件ID */
  fileId: number
  /** 文件类型 */
  fileType: string
  /** MIME类型 */
  mimeType: string
  /** 文件访问URL */
  fileUrl: string
}

/**
 * AI消息视图对象
 * @description AI会话中的消息记录
 * @interface AiMessageVO
 * @see GET /api/user/ai/sessions/{id}/messages - 响应
 * @see POST /api/user/ai/sessions/{id}/messages - 响应
 */
export interface AiMessageVO {
  /** 消息ID */
  id: number
  /** 角色类型：user/assistant/system */
  roleType: string
  /** 消息内容 */
  content: string
  /** 消息token数 */
  tokenCount?: number
  /** 响应状态：0-失败，1-成功 */
  responseStatus: number
  /** 错误信息 */
  errorMessage?: string | null
  /** RAG引用列表 */
  ragReferences?: AiRagReferenceVO[] | null
  /** 附件列表（发送消息时返回） */
  attachments?: AiAttachmentVO[]
  /** 创建时间 */
  createdAt: string
}

/**
 * 发送消息请求
 * @description 用户向AI会话发送消息
 * @interface AiMessageSendRequest
 * @see POST /api/user/ai/sessions/{id}/messages - 请求体
 */
export interface AiMessageSendRequest {
  /** 消息内容，最大2000字符 */
  content: string
  /** 请求场景类型，默认 general */
  requestSceneType?: string
  /** 关联目标ID */
  requestTargetId?: number
  /** 附件文件ID列表（目前仅支持图片），最多5个 */
  attachmentFileIds?: number[]
}

/**
 * AI配额视图对象
 * @description 用户AI配额信息
 * @interface AiQuotaVO
 * @see GET /api/user/ai/sessions/quota - 响应
 */
export interface AiQuotaVO {
  /** 每日限额 */
  dailyLimit: number
  /** 今日已用 */
  usedToday: number
  /** 今日剩余 */
  remainingToday: number
}

// ==================== 后台管理接口 ====================

/**
 * AI渠道配置视图对象
 * @description 后台AI渠道配置完整信息
 * @interface AiChannelConfigVO
 * @see GET /api/sys/ai/channels - 响应
 * @see GET /api/sys/ai/channels/{id} - 响应
 */
export interface AiChannelConfigVO {
  /** 渠道ID */
  id: number
  /** 渠道编码 */
  channelCode: string
  /** 渠道名称 */
  channelName: string
  /** 提供方 */
  provider: string
  /** 模型名称 */
  modelName: string
  /** 接口基础地址 */
  apiBaseUrl?: string
  /** 加密后的API Key */
  apiKeyEncrypted?: string
  /** 全局每日额度，0表示不限制 */
  dailyQuota: number
  /** 单用户每日额度，0表示不限制 */
  userDailyQuota: number
  /** 上下文长度上限，0表示不限制 */
  maxContextTokens: number
  /** 可读取数据范围配置JSON */
  dataScopeJson?: string
  /** 系统提示词模板 */
  systemPromptTemplate?: string
  /** 状态：0-停用，1-启用 */
  status: number
  /** 是否默认渠道：0-否，1-是 */
  isDefault: number
  /** 创建人ID */
  createdBy?: number
  /** 更新人ID */
  updatedBy?: number
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt?: string
}

/**
 * 保存渠道配置请求
 * @description 创建或更新AI渠道配置
 * @interface AiChannelConfigSaveRequest
 * @see POST /api/sys/ai/channels - 请求体
 * @see PUT /api/sys/ai/channels/{id} - 请求体
 */
export interface AiChannelConfigSaveRequest {
  /** 渠道编码 */
  channelCode: string
  /** 渠道名称 */
  channelName: string
  /** 提供方 */
  provider: string
  /** 模型名称 */
  modelName: string
  /** 接口基础地址 */
  apiBaseUrl?: string
  /** 加密后的API Key */
  apiKeyEncrypted?: string
  /** 全局每日额度，0表示不限制 */
  dailyQuota?: number
  /** 单用户每日额度，0表示不限制 */
  userDailyQuota?: number
  /** 上下文长度上限，0表示不限制 */
  maxContextTokens?: number
  /** 可读取数据范围配置JSON */
  dataScopeJson?: string
  /** 系统提示词模板 */
  systemPromptTemplate?: string
  /** 状态：0-停用，1-启用 */
  status?: number
  /** 是否默认渠道：0-否，1-是 */
  isDefault?: number
  /** 二次验证票据（修改高风险字段时必填） */
  mfaTicket?: string
}

/**
 * 更新渠道状态请求
 * @description 启用或禁用AI渠道
 * @interface AiChannelStatusRequest
 * @see PUT /api/sys/ai/channels/{id}/status - 请求体
 */
export interface AiChannelStatusRequest {
  /** 状态：0-停用，1-启用 */
  status: number
}

/**
 * 后台AI会话视图对象
 * @description 后台查看的用户AI会话
 * @interface AiSessionAdminVO
 * @see GET /api/sys/ai/sessions - 响应
 * @see GET /api/sys/ai/sessions/{id} - 响应
 */
export interface AiSessionAdminVO {
  /** 会话ID */
  id: number
  /** 用户ID */
  userId: number
  /** 用户名 */
  username: string
  /** 用户昵称 */
  nickname: string
  /** 渠道配置ID */
  channelConfigId: number
  /** 渠道名称 */
  channelName: string
  /** 会话标题 */
  title: string
  /** 场景类型 */
  sceneType: string
  /** 状态：0-关闭，1-正常 */
  status: number
  /** 最后消息时间 */
  lastMessageAt?: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt?: string
}

/**
 * AI使用日志视图对象
 * @description AI调用记录详情
 * @interface AiUsageLogVO
 * @see GET /api/sys/ai/usage-logs - 响应
 */
export interface AiUsageLogVO {
  /** 日志ID */
  id: number
  /** 用户ID */
  userId: number
  /** 渠道配置ID */
  channelConfigId: number
  /** 会话ID */
  sessionId: number
  /** 请求场景类型 */
  requestSceneType: string
  /** 请求token数 */
  requestTokens: number
  /** 响应token数 */
  responseTokens: number
  /** 总token数 */
  totalTokens: number
  /** 额度消耗 */
  quotaCost: number
  /** 成功状态：0-失败，1-成功 */
  successStatus: number
  /** 错误码 */
  errorCode?: string
  /** 调用时间 */
  createdAt: string
}

/**
 * AI使用统计视图对象
 * @description AI使用汇总统计
 * @interface AiUsageStatsVO
 * @see GET /api/sys/ai/usage-logs/stats - 响应
 */
export interface AiUsageStatsVO {
  /** 总调用次数 */
  totalCalls: number
  /** 成功调用次数 */
  successCalls: number
  /** 失败调用次数 */
  failedCalls: number
  /** 总token数 */
  totalTokens: number
  /** 总额度消耗 */
  totalQuotaCost: number
}

/**
 * AI使用日志查询请求
 * @see GET /api/sys/ai/usage-logs - 查询参数
 */
export interface AiUsageLogQueryRequest {
  current?: number
  size?: number
  userId?: number
  channelConfigId?: number
  successStatus?: number
  startTime?: string
  endTime?: string
}

/**
 * 后台AI会话查询请求
 * @see GET /api/sys/ai/sessions - 查询参数
 */
export interface AiSessionAdminQueryRequest {
  current?: number
  size?: number
  userId?: number
  channelConfigId?: number
  status?: number
  startTime?: string
  endTime?: string
}

// ==================== 渠道账号池 ====================

export interface AiChannelAccountVO {
  id: number
  channelConfigId: number
  accountName: string
  provider: string
  modelName: string
  apiBaseUrl: string
  apiKeyEncrypted?: string
  weight: number
  status: number
  dailyQuota: number
  consecutiveErrors: number
  maxConsecutiveErrors: number
  lastErrorAt?: string
  lastErrorMessage?: string
  disabledAt?: string
  autoRecoverAt?: string
  totalCallCount: number
  lastUsedAt?: string
  createdBy?: number
  updatedBy?: number
  createdAt: string
  updatedAt: string
}

export interface AiChannelAccountSaveRequest {
  accountName: string
  provider: string
  modelName: string
  apiBaseUrl: string
  apiKeyEncrypted: string
  weight?: number
  status?: number
  dailyQuota?: number
  maxConsecutiveErrors?: number
  mfaTicket?: string
}

// ==================== 知识源配置 ====================

export interface AiKnowledgeSourceConfigVO {
  id: number
  sourceType: string
  enabled: number
  syncInterval: number
  lastSyncedAt?: string
  lastSyncStatus?: string
  configJson?: string
  updatedBy?: number
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface AiKnowledgeSourceConfigUpdateRequest {
  syncInterval: number
  configJson?: string
  remark?: string
}

// ==================== 知识条目 ====================

export interface AiKnowledgeEntryVO {
  id: number
  sourceType: string
  sourceId: number
  title: string
  summary?: string
  sourceUrl?: string
  authorId?: number
  status: number
  version: number
  chunkCount: number
  sourceUpdatedAt?: string
  syncedAt?: string
  tagJson?: string
  createdAt: string
  updatedAt: string
}

export interface AiKnowledgeEntryQueryRequest {
  current?: number
  size?: number
  sourceType?: string
  status?: number
  keyword?: string
}

export interface AiKnowledgeSyncRequest {
  sourceType: string
  taskType?: string
  sourceId?: number
  remark?: string
}

export interface AiKnowledgeSyncTaskVO {
  id: number
  taskType: string
  sourceType: string
  status: number
  totalCount: number
  successCount: number
  failCount: number
  skipCount: number
  errorMessage?: string
  retryCount: number
  maxRetry: number
  startedAt?: string
  completedAt?: string
  triggeredBy?: string
  operatorId?: number
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface AiKnowledgeSyncTaskQueryRequest {
  current?: number
  size?: number
  sourceType?: string
  status?: number
}

// ==================== Agent 定义 ====================

export interface AiAgentDefinitionVO {
  id: number
  name: string
  description?: string
  systemPrompt: string
  channelConfigId: number
  dataScopeJson?: string
  enabled: number
  maxTurns: number
  extraConfigJson?: string
  createdBy?: number
  updatedBy?: number
  createdAt: string
  updatedAt: string
}

export interface AiAgentDefinitionSaveRequest {
  name: string
  description?: string
  systemPrompt: string
  channelConfigId: number
  dataScopeJson?: string
  maxTurns?: number
  extraConfigJson?: string
}

export interface AiAgentDefinitionQueryRequest {
  current?: number
  size?: number
  keyword?: string
  enabled?: number
}

// ==================== Agent 任务 ====================

export interface AiAgentTaskVO {
  id: number
  userId?: number
  agentId: number
  agentName?: string
  status: number
  inputContent: string
  outputContent?: string
  errorMessage?: string
  tokenCount?: number
  startedAt?: string
  completedAt?: string
  createdAt: string
}

export interface AiAgentTaskCreateRequest {
  agentId: number
  inputContent: string
}

export interface AiAgentTaskQueryRequest {
  current?: number
  size?: number
  agentId?: number
  status?: number
}

// ==================== 工具管理 ====================

export interface AiToolVO {
  id: number
  toolCode: string
  toolName: string
  sourceType: string
  mcpServerId?: number
  mcpToolName?: string
  description?: string
  parametersSchema?: string
  resultSchema?: string
  riskLevel: string
  useScenarios?: string
  enabled: number
  createdBy?: number
  updatedBy?: number
  createdAt: string
  updatedAt: string
}

export interface AiToolSaveRequest {
  toolCode: string
  toolName: string
  sourceType: string
  mcpServerId?: number
  mcpToolName?: string
  description?: string
  parametersSchema?: string
  resultSchema?: string
  riskLevel: string
  useScenarios?: string
  enabled: number
  mfaTicket?: string
}

export interface AiToolQueryRequest {
  current?: number
  size?: number
  toolCode?: string
  toolName?: string
  sourceType?: string
  enabled?: number
}

export interface AiToolExecuteRequest {
  toolCode?: string
  arguments?: string
  agentId?: number
  sessionId?: number
  taskId?: number
  sceneType?: string
  dataScope?: string
}

export interface AiToolExecuteResultVO {
  success: boolean
  resultText?: string
  errorMessage?: string
  elapsedMs: number
  callLogId?: number
}

export interface AiToolCallLogVO {
  id: number
  userId: number
  agentId?: number
  sessionId?: number
  taskId?: number
  toolId: number
  toolCode: string
  toolName: string
  requestSceneType?: string
  requestSummary?: string
  responseSummary?: string
  successStatus: number
  elapsedMs: number
  errorMessage?: string
  createdAt: string
}

export interface AiToolCallLogQueryRequest {
  current?: number
  size?: number
  toolId?: number
  userId?: number
  agentId?: number
  taskId?: number
  successStatus?: number
}

// ==================== 工具授权 ====================

export interface AiToolAuthorizationVO {
  id: number
  toolId: number
  authorizationType: string
  authorizationKey: string
  dataScope?: string
  enabled: number
  createdBy?: number
  updatedBy?: number
  createdAt: string
  updatedAt: string
}

export interface AiToolAuthorizationSaveRequest {
  toolId: number
  authorizationType: string
  authorizationKey: string
  dataScope?: string
  enabled: number
}

export interface AiToolAuthorizationQueryRequest {
  current?: number
  size?: number
  toolId?: number
  authorizationType?: string
  authorizationKey?: string
  enabled?: number
}

// ==================== MCP 服务 ====================

export interface AiMcpServerVO {
  id: number
  serverName: string
  transportType: string
  connectionConfigJson: string
  timeoutSeconds: number
  enabled: number
  lastHealthStatus?: string
  lastDiscoveredAt?: string
  lastErrorSummary?: string
  createdBy?: number
  updatedBy?: number
  createdAt: string
  updatedAt: string
}

export interface AiMcpServerSaveRequest {
  serverName: string
  transportType: string
  connectionConfigJson: string
  authConfigJson?: string
  timeoutSeconds: number
  enabled: number
  mfaTicket?: string
}

export interface AiMcpServerQueryRequest {
  current?: number
  size?: number
  serverName?: string
  transportType?: string
  enabled?: number
}

export interface AiMcpDiscoverResultVO {
  discoveredCount: number
  syncedCount: number
}

export interface AiMcpToolSnapshotVO {
  id: number
  mcpServerId: number
  mcpToolName: string
  toolCode: string
  toolName: string
  description?: string
  parametersSchema?: string
  resultSchema?: string
  riskLevel?: string
  useScenarios?: string
  enabled: number
  discoveredAt?: string
  rawDefinitionJson?: string
  lastErrorSummary?: string
  createdAt: string
  updatedAt: string
}

export interface AiMcpHealthVO {
  healthy: boolean
  status: string
  errorSummary?: string
}
