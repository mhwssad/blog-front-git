import { cp, db, has, me, now, num, ok, page, p } from './shared'

function handleSys(req: any) {
  const path = p(req)
  const method = req.method?.toUpperCase()

  // ==================== 渠道配置 ====================

  // 4.1.2 分页查询渠道配置
  if (method === 'GET' && /^\/api\/sys\/ai\/channels\/?$/.test(path)) {
    let list = cp(db.aiChannels)
    const q = req.query || {}
    if (q.channelName) list = list.filter((i: any) => has(i.channelName, q.channelName))
    if (q.status !== undefined && q.status !== '')
      list = list.filter((i: any) => i.status === num(q.status))
    return ok(page(list, q))
  }

  // 4.1.4 创建渠道配置
  if (method === 'POST' && /^\/api\/sys\/ai\/channels\/?$/.test(path)) {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const id = ++db.seq.aiChannel
    const ch = {
      id,
      channelCode: body.channelCode,
      channelName: body.channelName,
      provider: body.provider,
      modelName: body.modelName,
      apiBaseUrl: body.apiBaseUrl ?? '',
      apiKeyEncrypted: body.apiKeyEncrypted ?? '',
      dailyQuota: body.dailyQuota ?? 0,
      userDailyQuota: body.userDailyQuota ?? 0,
      maxContextTokens: body.maxContextTokens ?? 0,
      dataScopeJson: body.dataScopeJson ?? '[]',
      systemPromptTemplate: body.systemPromptTemplate ?? '',
      status: body.status ?? 1,
      isDefault: body.isDefault ?? 0,
      createdBy: 1,
      updatedBy: null,
      createdAt: now(),
      updatedAt: null,
    }
    db.aiChannels.push(ch)
    return ok(ch)
  }

  // 4.1.6 更新渠道状态 (must be before /:id)
  if (method === 'PUT' && /^\/api\/sys\/ai\/channels\/\d+\/status\/?$/.test(path)) {
    const id = num(path.match(/\/channels\/(\d+)/)?.[1])
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const ch = db.aiChannels.find((i: any) => i.id === id)
    if (!ch) return ok(null, '渠道不存在', 404)
    ch.status = body.status
    ch.updatedAt = now()
    return ok(null)
  }

  // 4.1.3 / 4.1.5 / 4.1.7 渠道详情 / 更新 / 删除
  const chMatch = path.match(/^\/api\/sys\/ai\/channels\/(\d+)\/?$/)
  if (chMatch) {
    const id = num(chMatch[1])
    const idx = db.aiChannels.findIndex((i: any) => i.id === id)
    if (idx < 0) return ok(null, '渠道不存在', 404)

    if (method === 'GET') return ok(cp(db.aiChannels[idx]))

    if (method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      Object.assign(db.aiChannels[idx], {
        channelCode: body.channelCode ?? db.aiChannels[idx].channelCode,
        channelName: body.channelName ?? db.aiChannels[idx].channelName,
        provider: body.provider ?? db.aiChannels[idx].provider,
        modelName: body.modelName ?? db.aiChannels[idx].modelName,
        apiBaseUrl: body.apiBaseUrl ?? db.aiChannels[idx].apiBaseUrl,
        apiKeyEncrypted: body.apiKeyEncrypted ?? db.aiChannels[idx].apiKeyEncrypted,
        dailyQuota: body.dailyQuota ?? db.aiChannels[idx].dailyQuota,
        userDailyQuota: body.userDailyQuota ?? db.aiChannels[idx].userDailyQuota,
        maxContextTokens: body.maxContextTokens ?? db.aiChannels[idx].maxContextTokens,
        dataScopeJson: body.dataScopeJson ?? db.aiChannels[idx].dataScopeJson,
        systemPromptTemplate: body.systemPromptTemplate ?? db.aiChannels[idx].systemPromptTemplate,
        status: body.status ?? db.aiChannels[idx].status,
        isDefault: body.isDefault ?? db.aiChannels[idx].isDefault,
        updatedAt: now(),
      })
      return ok(cp(db.aiChannels[idx]))
    }

    if (method === 'DELETE') {
      db.aiChannels.splice(idx, 1)
      return ok(null)
    }
  }

  // ==================== 渠道账号池 ====================

  const chAcctListMatch = path.match(/^\/api\/sys\/ai\/channels\/(\d+)\/accounts\/?$/)
  if (method === 'GET' && chAcctListMatch) {
    const channelId = num(chAcctListMatch[1])
    let rs = cp((db.aiChannelAccounts || []).filter((i: any) => i.channelId === channelId))
    return ok(page(rs, req.query || {}))
  }

  if (method === 'POST' && chAcctListMatch) {
    const channelId = num(chAcctListMatch[1])
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const item = {
      id: ++db.seq.aiChannelAccount,
      channelId,
      accountName: body.accountName,
      apiKeyEncrypted: body.apiKeyEncrypted ?? '',
      weight: body.weight ?? 5,
      status: body.status ?? 1,
      dailyUsedTokens: 0,
      dailyLimit: body.dailyLimit ?? 50000,
      lastUsedAt: null,
      createdBy: 1,
      createdAt: now(),
      updatedAt: now(),
    }
    if (!db.aiChannelAccounts) db.aiChannelAccounts = []
    db.aiChannelAccounts.push(item)
    return ok(cp(item))
  }

  const chAcctStatusMatch = path.match(/^\/api\/sys\/ai\/channels\/(\d+)\/accounts\/(\d+)\/status$/)
  if (method === 'PUT' && chAcctStatusMatch) {
    const acct = (db.aiChannelAccounts || []).find(
      (i: any) => i.channelId === num(chAcctStatusMatch[1]) && i.id === num(chAcctStatusMatch[2]),
    )
    if (acct) {
      acct.status = req.body.status ?? acct.status
      acct.updatedAt = now()
    }
    return ok(null)
  }

  const chAcctMatch = path.match(/^\/api\/sys\/ai\/channels\/(\d+)\/accounts\/(\d+)\/?$/)
  if (chAcctMatch) {
    const acct = (db.aiChannelAccounts || []).find(
      (i: any) => i.channelId === num(chAcctMatch[1]) && i.id === num(chAcctMatch[2]),
    )
    if (!acct) return ok(null, '账号不存在', 404)
    if (method === 'GET') return ok(cp(acct))
    if (method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      Object.assign(acct, body, { updatedAt: now() })
      return ok(null)
    }
    if (method === 'DELETE') {
      db.aiChannelAccounts = (db.aiChannelAccounts || []).filter((i: any) => i.id !== acct.id)
      return ok(null)
    }
  }

  // ==================== 后台会话管理 ====================

  if (method === 'GET' && /^\/api\/sys\/ai\/sessions\/?$/.test(path)) {
    let list = cp(db.aiSessions).map((s: any) => {
      const user = db.users.find((u: any) => u.id === s.userId) || {}
      const ch = db.aiChannels.find((c: any) => c.id === s.channelConfigId) || {}
      return { ...s, username: user.username ?? '', nickname: user.nickname ?? '', channelName: ch.channelName ?? '' }
    })
    const q = req.query || {}
    if (q.userId) list = list.filter((i: any) => i.userId === num(q.userId))
    if (q.status !== undefined && q.status !== '')
      list = list.filter((i: any) => i.status === num(q.status))
    if (q.channelConfigId)
      list = list.filter((i: any) => i.channelConfigId === num(q.channelConfigId))
    return ok(page(list, q))
  }

  const sessMatch = path.match(/^\/api\/sys\/ai\/sessions\/(\d+)\/?$/)
  if (sessMatch && method === 'GET') {
    const id = num(sessMatch[1])
    const s = db.aiSessions.find((i: any) => i.id === id)
    if (!s) return ok(null, '会话不存在', 404)
    const user = db.users.find((u: any) => u.id === s.userId) || {}
    const ch = db.aiChannels.find((c: any) => c.id === s.channelConfigId) || {}
    return ok({ ...cp(s), username: user.username ?? '', nickname: user.nickname ?? '', channelName: ch.channelName ?? '' })
  }

  // ==================== 使用日志 ====================

  if (method === 'GET' && /^\/api\/sys\/ai\/usage-logs\/stats\/?$/.test(path)) {
    const q = req.query || {}
    let logs = cp(db.aiUsageLogs)
    if (q.userId) logs = logs.filter((i: any) => i.userId === num(q.userId))
    if (q.channelConfigId) logs = logs.filter((i: any) => i.channelConfigId === num(q.channelConfigId))
    if (q.startTime) logs = logs.filter((i: any) => i.createdAt >= q.startTime)
    if (q.endTime) logs = logs.filter((i: any) => i.createdAt <= q.endTime)
    return ok({
      totalCalls: logs.length,
      successCalls: logs.filter((i: any) => i.successStatus === 1).length,
      failedCalls: logs.filter((i: any) => i.successStatus === 0).length,
      totalTokens: logs.reduce((sum: number, i: any) => sum + i.totalTokens, 0),
      totalQuotaCost: logs.reduce((sum: number, i: any) => sum + i.quotaCost, 0),
    })
  }

  if (method === 'GET' && /^\/api\/sys\/ai\/usage-logs\/?$/.test(path)) {
    let list = cp(db.aiUsageLogs)
    const q = req.query || {}
    if (q.userId) list = list.filter((i: any) => i.userId === num(q.userId))
    if (q.channelConfigId) list = list.filter((i: any) => i.channelConfigId === num(q.channelConfigId))
    if (q.startTime) list = list.filter((i: any) => i.createdAt >= q.startTime)
    if (q.endTime) list = list.filter((i: any) => i.createdAt <= q.endTime)
    if (q.successStatus !== undefined && q.successStatus !== '')
      list = list.filter((i: any) => i.successStatus === num(q.successStatus))
    list.sort((a: any, b: any) => b.id - a.id)
    return ok(page(list, q))
  }

  // ==================== 知识库 ====================

  // 知识源配置列表
  if (method === 'GET' && /^\/api\/sys\/ai\/knowledge\/source-config\/?$/.test(path)) {
    let rs = cp(db.aiKnowledgeSources || [])
    if (req.query.sourceName) rs = rs.filter((i: any) => has(i.sourceName, req.query.sourceName))
    if (req.query.status !== undefined && req.query.status !== '')
      rs = rs.filter((i: any) => i.status === num(req.query.status))
    return ok(page(rs, req.query || {}))
  }

  // 知识源详情 / 更新 / 切换
  const srcMatch = path.match(/^\/api\/sys\/ai\/knowledge\/source-config\/(\d+)\/?$/)
  const srcToggleMatch = path.match(/^\/api\/sys\/ai\/knowledge\/source-config\/(\d+)\/toggle$/)

  if (method === 'PUT' && srcToggleMatch) {
    const x = (db.aiKnowledgeSources || []).find((i: any) => i.id === num(srcToggleMatch[1]))
    if (x) { x.status = x.status === 1 ? 0 : 1; x.updatedAt = now() }
    return ok(null)
  }

  if (srcMatch) {
    const x = (db.aiKnowledgeSources || []).find((i: any) => i.id === num(srcMatch[1]))
    if (!x) return ok(null, '知识源不存在', 404)
    if (method === 'GET') return ok(cp(x))
    if (method === 'PUT') {
      Object.assign(x, req.body, { updatedAt: now() })
      return ok(null)
    }
  }

  // 知识条目列表
  if (method === 'GET' && /^\/api\/sys\/ai\/knowledge\/entries\/?$/.test(path)) {
    let rs = cp(db.aiKnowledgeEntries || [])
    if (req.query.sourceConfigId) rs = rs.filter((i: any) => i.sourceConfigId === num(req.query.sourceConfigId))
    if (req.query.status) rs = rs.filter((i: any) => i.status === req.query.status)
    return ok(page(rs, req.query || {}))
  }

  // 知识条目详情
  const entryMatch = path.match(/^\/api\/sys\/ai\/knowledge\/entries\/(\d+)\/?$/)
  if (method === 'GET' && entryMatch) {
    const x = (db.aiKnowledgeEntries || []).find((i: any) => i.id === num(entryMatch[1]))
    return x ? ok(cp(x)) : ok(null, '知识条目不存在', 404)
  }

  // 知识条目状态更新
  const entryStatusMatch = path.match(/^\/api\/sys\/ai\/knowledge\/entries\/(\d+)\/status$/)
  if (method === 'PUT' && entryStatusMatch) {
    const x = (db.aiKnowledgeEntries || []).find((i: any) => i.id === num(entryStatusMatch[1]))
    if (x) { x.status = req.body.status ?? x.status; x.updatedAt = now() }
    return ok(null)
  }

  // 触发同步
  if (method === 'POST' && path === '/api/sys/ai/knowledge/entries/sync') {
    return ok({ taskId: ++db.seq.aiSyncTask, status: 'pending' })
  }

  // 同步任务列表
  if (method === 'GET' && /^\/api\/sys\/ai\/knowledge\/entries\/sync\/tasks\/?$/.test(path)) {
    let rs = cp(db.aiSyncTasks || [])
    if (req.query.sourceConfigId) rs = rs.filter((i: any) => i.sourceConfigId === num(req.query.sourceConfigId))
    return ok(page(rs, req.query || {}))
  }

  // 同步任务详情
  const syncTaskMatch = path.match(/^\/api\/sys\/ai\/knowledge\/entries\/sync\/tasks\/(\d+)$/)
  if (method === 'GET' && syncTaskMatch) {
    const x = (db.aiSyncTasks || []).find((i: any) => i.id === num(syncTaskMatch[1]))
    return x ? ok(cp(x)) : ok(null, '同步任务不存在', 404)
  }

  // 重试同步任务
  const syncRetryMatch = path.match(/^\/api\/sys\/ai\/knowledge\/entries\/sync\/tasks\/(\d+)\/retry$/)
  if (method === 'POST' && syncRetryMatch) {
    const x = (db.aiSyncTasks || []).find((i: any) => i.id === num(syncRetryMatch[1]))
    if (x) { x.status = 'running'; x.startedAt = now() }
    return ok(null)
  }

  // ==================== Agent 定义 ====================

  if (method === 'GET' && /^\/api\/sys\/ai\/agents\/definitions\/?$/.test(path)) {
    let rs = cp(db.aiAgentDefinitions || [])
    if (req.query.agentName) rs = rs.filter((i: any) => has(i.agentName, req.query.agentName))
    if (req.query.status !== undefined && req.query.status !== '')
      rs = rs.filter((i: any) => i.status === num(req.query.status))
    return ok(page(rs, req.query || {}))
  }

  if (method === 'POST' && /^\/api\/sys\/ai\/agents\/definitions\/?$/.test(path)) {
    const item = {
      id: ++db.seq.aiAgentDef,
      agentName: req.body.agentName,
      description: req.body.description ?? '',
      agentType: req.body.agentType ?? 'general',
      systemPrompt: req.body.systemPrompt ?? '',
      modelConfig: req.body.modelConfig ?? '{}',
      tools: req.body.tools ?? '[]',
      status: 1,
      createdBy: 1,
      createdAt: now(),
      updatedAt: now(),
    }
    if (!db.aiAgentDefinitions) db.aiAgentDefinitions = []
    db.aiAgentDefinitions.push(item)
    return ok(cp(item))
  }

  const agentDefMatch = path.match(/^\/api\/sys\/ai\/agents\/definitions\/(\d+)$/)
  const agentToggleMatch = path.match(/^\/api\/sys\/ai\/agents\/definitions\/(\d+)\/toggle$/)

  if (method === 'PUT' && agentToggleMatch) {
    const x = (db.aiAgentDefinitions || []).find((i: any) => i.id === num(agentToggleMatch[1]))
    if (x) { x.status = x.status === 1 ? 0 : 1; x.updatedAt = now() }
    return ok(null)
  }

  if (agentDefMatch) {
    const x = (db.aiAgentDefinitions || []).find((i: any) => i.id === num(agentDefMatch[1]))
    if (!x) return ok(null, 'Agent 定义不存在', 404)
    if (method === 'GET') return ok(cp(x))
    if (method === 'PUT') {
      Object.assign(x, req.body, { updatedAt: now() })
      return ok(null)
    }
    if (method === 'DELETE') {
      db.aiAgentDefinitions = (db.aiAgentDefinitions || []).filter((i: any) => i.id !== x.id)
      return ok(null)
    }
  }

  // Agent 任务
  if (method === 'GET' && /^\/api\/sys\/ai\/agents\/tasks\/?$/.test(path)) {
    let rs = cp(db.aiAgentTasks || [])
    if (req.query.agentDefId) rs = rs.filter((i: any) => i.agentDefId === num(req.query.agentDefId))
    if (req.query.status) rs = rs.filter((i: any) => i.status === req.query.status)
    return ok(page(rs, req.query || {}))
  }

  const agentTaskMatch = path.match(/^\/api\/sys\/ai\/agents\/tasks\/(\d+)$/)
  if (method === 'GET' && agentTaskMatch) {
    const x = (db.aiAgentTasks || []).find((i: any) => i.id === num(agentTaskMatch[1]))
    return x ? ok(cp(x)) : ok(null, 'Agent 任务不存在', 404)
  }

  // ==================== 工具管理 ====================

  if (method === 'GET' && /^\/api\/sys\/ai\/tools\/?$/.test(path)) {
    let rs = cp(db.aiTools || [])
    if (req.query.toolName) rs = rs.filter((i: any) => has(i.toolName, req.query.toolName))
    if (req.query.status !== undefined && req.query.status !== '')
      rs = rs.filter((i: any) => i.status === num(req.query.status))
    return ok(page(rs, req.query || {}))
  }

  if (method === 'POST' && /^\/api\/sys\/ai\/tools\/?$/.test(path)) {
    const item = {
      id: ++db.seq.aiTool,
      toolName: req.body.toolName,
      toolKey: req.body.toolKey,
      description: req.body.description ?? '',
      toolType: req.body.toolType ?? 'builtin',
      inputSchema: req.body.inputSchema ?? '{}',
      status: 1,
      callCount: 0,
      lastCalledAt: null,
      createdBy: 1,
      createdAt: now(),
      updatedAt: now(),
    }
    if (!db.aiTools) db.aiTools = []
    db.aiTools.push(item)
    return ok(cp(item))
  }

  const toolStatusMatch = path.match(/^\/api\/sys\/ai\/tools\/(\d+)\/status$/)
  if (method === 'PUT' && toolStatusMatch) {
    const x = (db.aiTools || []).find((i: any) => i.id === num(toolStatusMatch[1]))
    if (x) { x.status = req.body.status ?? x.status; x.updatedAt = now() }
    return ok(null)
  }

  const toolExecMatch = path.match(/^\/api\/sys\/ai\/tools\/(\d+)\/execute$/)
  if (method === 'POST' && toolExecMatch) {
    const x = (db.aiTools || []).find((i: any) => i.id === num(toolExecMatch[1]))
    if (x) { x.callCount++; x.lastCalledAt = now() }
    return ok({ result: 'Mock 执行成功', executionTime: 150 })
  }

  const toolMatch = path.match(/^\/api\/sys\/ai\/tools\/(\d+)$/)
  if (toolMatch) {
    const x = (db.aiTools || []).find((i: any) => i.id === num(toolMatch[1]))
    if (!x) return ok(null, '工具不存在', 404)
    if (method === 'GET') return ok(cp(x))
    if (method === 'PUT') {
      Object.assign(x, req.body, { updatedAt: now() })
      return ok(null)
    }
    if (method === 'DELETE') {
      db.aiTools = (db.aiTools || []).filter((i: any) => i.id !== x.id)
      return ok(null)
    }
  }

  // 工具调用日志
  if (method === 'GET' && /^\/api\/sys\/ai\/tools\/call-logs\/?$/.test(path)) {
    return ok(page([], req.query || {}))
  }

  // 工具授权
  if (method === 'GET' && /^\/api\/sys\/ai\/tools\/authorizations\/?$/.test(path)) {
    let rs = cp(db.aiToolAuthorizations || [])
    if (req.query.agentDefId) rs = rs.filter((i: any) => i.agentDefId === num(req.query.agentDefId))
    return ok(page(rs, req.query || {}))
  }

  if (method === 'POST' && /^\/api\/sys\/ai\/tools\/authorizations\/?$/.test(path)) {
    const item = {
      id: ++db.seq.aiToolAuth,
      agentDefId: req.body.agentDefId,
      toolId: req.body.toolId,
      grantedBy: 1,
      grantedAt: now(),
      status: 1,
      createdAt: now(),
    }
    if (!db.aiToolAuthorizations) db.aiToolAuthorizations = []
    db.aiToolAuthorizations.push(item)
    return ok(cp(item))
  }

  const toolAuthMatch = path.match(/^\/api\/sys\/ai\/tools\/authorizations\/(\d+)$/)
  if (toolAuthMatch) {
    const x = (db.aiToolAuthorizations || []).find((i: any) => i.id === num(toolAuthMatch[1]))
    if (!x) return ok(null, '授权不存在', 404)
    if (method === 'PUT') {
      Object.assign(x, req.body, { updatedAt: now() })
      return ok(null)
    }
    if (method === 'DELETE') {
      db.aiToolAuthorizations = (db.aiToolAuthorizations || []).filter((i: any) => i.id !== x.id)
      return ok(null)
    }
  }

  // ==================== MCP 服务 ====================

  if (method === 'GET' && /^\/api\/sys\/ai\/mcp-servers\/?$/.test(path)) {
    let rs = cp(db.aiMcpServers || [])
    if (req.query.serverName) rs = rs.filter((i: any) => has(i.serverName, req.query.serverName))
    if (req.query.status !== undefined && req.query.status !== '')
      rs = rs.filter((i: any) => i.status === num(req.query.status))
    return ok(page(rs, req.query || {}))
  }

  if (method === 'POST' && /^\/api\/sys\/ai\/mcp-servers\/?$/.test(path)) {
    const item = {
      id: ++db.seq.aiMcpServer,
      serverName: req.body.serverName,
      serverUrl: req.body.serverUrl,
      description: req.body.description ?? '',
      transportType: req.body.transportType ?? 'sse',
      status: 1,
      toolCount: 0,
      lastHealthCheck: null,
      healthStatus: 'unknown',
      createdBy: 1,
      createdAt: now(),
      updatedAt: now(),
    }
    if (!db.aiMcpServers) db.aiMcpServers = []
    db.aiMcpServers.push(item)
    return ok(cp(item))
  }

  const mcpStatusMatch = path.match(/^\/api\/sys\/ai\/mcp-servers\/(\d+)\/status$/)
  if (method === 'PUT' && mcpStatusMatch) {
    const x = (db.aiMcpServers || []).find((i: any) => i.id === num(mcpStatusMatch[1]))
    if (x) { x.status = req.body.status ?? x.status; x.updatedAt = now() }
    return ok(null)
  }

  const mcpDiscoverMatch = path.match(/^\/api\/sys\/ai\/mcp-servers\/(\d+)\/discover$/)
  if (method === 'POST' && mcpDiscoverMatch) {
    const x = (db.aiMcpServers || []).find((i: any) => i.id === num(mcpDiscoverMatch[1]))
    if (x) { x.toolCount = 5; x.updatedAt = now() }
    return ok({ discoveredTools: 5 })
  }

  const mcpToolsMatch = path.match(/^\/api\/sys\/ai\/mcp-servers\/(\d+)\/tools$/)
  if (method === 'GET' && mcpToolsMatch) {
    return ok([
      { name: 'read_file', description: '读取文件内容' },
      { name: 'write_file', description: '写入文件' },
      { name: 'list_dir', description: '列出目录' },
      { name: 'search', description: '搜索内容' },
      { name: 'execute', description: '执行命令' },
    ])
  }

  const mcpHealthMatch = path.match(/^\/api\/sys\/ai\/mcp-servers\/(\d+)\/health$/)
  if (method === 'GET' && mcpHealthMatch) {
    const x = (db.aiMcpServers || []).find((i: any) => i.id === num(mcpHealthMatch[1]))
    return ok({
      serverId: num(mcpHealthMatch[1]),
      status: x?.status === 1 ? 'healthy' : 'unhealthy',
      responseTime: 45,
      lastCheck: now(),
    })
  }

  const mcpMatch = path.match(/^\/api\/sys\/ai\/mcp-servers\/(\d+)$/)
  if (mcpMatch) {
    const x = (db.aiMcpServers || []).find((i: any) => i.id === num(mcpMatch[1]))
    if (!x) return ok(null, 'MCP 服务不存在', 404)
    if (method === 'GET') return ok(cp(x))
    if (method === 'PUT') {
      Object.assign(x, req.body, { updatedAt: now() })
      return ok(null)
    }
    if (method === 'DELETE') {
      db.aiMcpServers = (db.aiMcpServers || []).filter((i: any) => i.id !== x.id)
      return ok(null)
    }
  }

  return ok(null, '未匹配的 AI 管理接口', 404)
}

function handleUser(req: any) {
  const path = p(req)
  const method = req.method?.toUpperCase()

  // ==================== 用户 AI 会话 ====================

  if (method === 'GET' && /^\/api\/user\/ai\/sessions\/quota\/?$/.test(path)) {
    const defaultChannel = db.aiChannels.find((c: any) => c.isDefault === 1) || db.aiChannels[0]
    const dailyLimit = defaultChannel?.userDailyQuota ?? 50
    const today = new Date().toISOString().slice(0, 10)
    const usedToday = db.aiUsageLogs.filter(
      (l: any) => l.userId === me(req).id && l.createdAt?.slice(0, 10) === today,
    ).length
    return ok({ dailyLimit, usedToday, remainingToday: Math.max(0, dailyLimit - usedToday) })
  }

  if (method === 'POST' && /^\/api\/user\/ai\/sessions\/?$/.test(path)) {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const id = ++db.seq.aiSession
    const session = {
      id,
      userId: me(req).id,
      channelConfigId: body.channelConfigId ?? 1,
      title: body.title ?? '新对话',
      sceneType: body.sceneType ?? 'general',
      status: 1,
      lastMessageAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    db.aiSessions.push(session)
    return ok(session)
  }

  if (method === 'GET' && /^\/api\/user\/ai\/sessions\/?$/.test(path)) {
    const uid = me(req).id
    const list = cp(db.aiSessions).filter((s: any) => s.userId === uid).sort((a: any, b: any) => b.id - a.id)
    return ok(page(list, req.query || {}))
  }

  const msgMatch = path.match(/^\/api\/user\/ai\/sessions\/(\d+)\/messages\/?$/)
  if (msgMatch && method === 'GET') {
    const sessionId = num(msgMatch[1])
    const list = cp(db.aiMessages)
      .filter((m: any) => m.sessionId === sessionId)
      .sort((a: any, b: any) => a.id - b.id)
    return ok(page(list, req.query || {}))
  }

  if (msgMatch && method === 'POST') {
    const sessionId = num(msgMatch[1])
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const session = db.aiSessions.find((item: any) => item.id === sessionId)
    const attachments = (body.attachmentFileIds ?? []).slice(0, 5).map((fileId: number) => {
      const file = (db.files || []).find((item: any) => item.id === fileId) || {}
      return {
        fileId,
        fileType: file.fileType ?? 'image',
        mimeType: file.mimeType ?? 'image/png',
        fileUrl:
          file.fileUrl ?? `https://api.dicebear.com/7.x/identicon/svg?seed=ai-file-${fileId}`,
      }
    })

    const userMsgId = ++db.seq.aiMessage
    const userMsg = {
      id: userMsgId,
      sessionId,
      roleType: 'user',
      content: body.content,
      requestSceneType: body.requestSceneType ?? 'general',
      tokenCount: Math.ceil(body.content.length / 4),
      responseStatus: 1,
      errorMessage: null,
      attachments: attachments.length ? attachments : null,
      createdAt: now(),
    }
    db.aiMessages.push(userMsg)

    const referenceSeed = body.requestSceneType === 'forum'
      ? [
          {
            sourceType: 'forum_post',
            sourceId: 3101,
            entryId: 9101,
            title: '社区帖子：如何整理 AI 回复模板',
            sourceUrl: '/forum/posts/3101',
            chunkIndex: 0,
            score: 0.8721,
          },
          {
            sourceType: 'public_article',
            sourceId: 2102,
            entryId: 9102,
            title: 'AI 请求页交互设计实践',
            sourceUrl: '/articles/2102',
            chunkIndex: 1,
            score: 0.8514,
          },
        ]
      : [
          {
            sourceType: 'public_article',
            sourceId: 2101,
            entryId: 9101,
            title: '前端 AI 请求页标准布局',
            sourceUrl: '/articles/2101',
            chunkIndex: 0,
            score: 0.9132,
          },
          {
            sourceType: 'forum_post',
            sourceId: 3102,
            entryId: 9103,
            title: '论坛帖子：消息输入区的附件处理',
            sourceUrl: '/forum/posts/3102',
            chunkIndex: 1,
            score: 0.8038,
          },
        ]

    const assistantContent = [
      `# 已收到`,
      '',
      `- 场景：${body.requestSceneType ?? 'general'}`,
      `- 目标：${body.requestTargetId ?? '无'}`,
      `- 附件：${attachments.length}`,
      '',
      '我会基于当前上下文给出可直接执行的答案。',
    ].join('\n')

    const aiMsgId = ++db.seq.aiMessage
    const aiMsg = {
      id: aiMsgId,
      sessionId,
      roleType: 'assistant',
      content: assistantContent,
      requestSceneType: null,
      tokenCount: Math.ceil(assistantContent.length / 3),
      responseStatus: 1,
      errorMessage: null,
      ragReferences: referenceSeed,
      createdAt: now(),
    }
    db.aiMessages.push(aiMsg)
    db.aiUsageLogs.push({
      id: ++db.seq.aiUsageLog,
      userId: me(req).id,
      channelConfigId: session?.channelConfigId ?? 1,
      sessionId,
      requestSceneType: body.requestSceneType ?? 'general',
      requestTokens: Math.ceil(body.content.length / 4) + attachments.length * 20,
      responseTokens: aiMsg.tokenCount,
      totalTokens: Math.ceil(body.content.length / 4) + attachments.length * 20 + aiMsg.tokenCount,
      quotaCost: Math.max(1, Math.ceil(aiMsg.tokenCount / 300)),
      successStatus: 1,
      errorCode: null,
      createdAt: aiMsg.createdAt,
    })

    if (session) {
      session.lastMessageAt = aiMsg.createdAt
      session.updatedAt = aiMsg.createdAt
      if ((!session.title || session.title === '新对话') && body.content) {
        session.title = body.content.replace(/\s+/g, ' ').trim().slice(0, 20) || '新对话'
      }
    }
    return ok(aiMsg)
  }

  const sessMatch = path.match(/^\/api\/user\/ai\/sessions\/(\d+)\/?$/)
  if (sessMatch && method === 'DELETE') {
    const id = num(sessMatch[1])
    const s = db.aiSessions.find((i: any) => i.id === id)
    if (s) { s.status = 0; s.updatedAt = now() }
    return ok(null)
  }

  if (sessMatch && method === 'GET') {
    const id = num(sessMatch[1])
    const s = db.aiSessions.find((i: any) => i.id === id)
    if (!s) return ok(null, '会话不存在', 404)
    const ch = db.aiChannels.find((c: any) => c.id === s.channelConfigId) || {}
    return ok({ ...cp(s), channelName: ch.channelName ?? '', modelName: ch.modelName ?? '' })
  }

  // ==================== 用户 Agent 任务 ====================

  if (method === 'GET' && /^\/api\/user\/ai\/agents\/tasks\/?$/.test(path)) {
    let rs = cp(db.aiAgentTasks || []).filter((i: any) => i.createdBy === me(req).id)
    return ok(page(rs, req.query || {}))
  }

  if (method === 'POST' && /^\/api\/user\/ai\/agents\/tasks\/?$/.test(path)) {
    const item = {
      id: ++db.seq.aiAgentTask,
      agentDefId: req.body.agentDefId,
      triggerType: 'manual',
      inputParams: req.body.inputParams ?? '{}',
      status: 'running',
      result: null,
      startedAt: now(),
      finishedAt: null,
      createdBy: me(req).id,
      createdAt: now(),
    }
    if (!db.aiAgentTasks) db.aiAgentTasks = []
    db.aiAgentTasks.push(item)
    return ok(cp(item))
  }

  const userAgentTaskMatch = path.match(/^\/api\/user\/ai\/agents\/tasks\/(\d+)$/)
  if (userAgentTaskMatch) {
    const x = (db.aiAgentTasks || []).find((i: any) => i.id === num(userAgentTaskMatch[1]))
    if (!x) return ok(null, '任务不存在', 404)
    if (method === 'GET') return ok(cp(x))
    if (method === 'PUT') {
      if (req.body.status === 'cancelled') {
        x.status = 'cancelled'
        x.finishedAt = now()
      }
      return ok(null)
    }
  }

  return ok(null, '未匹配的 AI 用户接口', 404)
}

export default [
  // 渠道配置
  { url: '/api/sys/ai/channels', method: ['GET', 'POST'], body: handleSys },
  { url: '/api/sys/ai/channels/:id', method: ['GET', 'PUT', 'DELETE'], body: handleSys },
  { url: '/api/sys/ai/channels/:id/status', method: ['PUT'], body: handleSys },
  // 渠道账号池
  { url: '/api/sys/ai/channels/:channelId/accounts', method: ['GET', 'POST'], body: handleSys },
  { url: '/api/sys/ai/channels/:channelId/accounts/:id', method: ['GET', 'PUT', 'DELETE'], body: handleSys },
  { url: '/api/sys/ai/channels/:channelId/accounts/:id/status', method: ['PUT'], body: handleSys },
  // 会话管理
  { url: '/api/sys/ai/sessions', method: ['GET'], body: handleSys },
  { url: '/api/sys/ai/sessions/:id', method: ['GET'], body: handleSys },
  // 使用日志
  { url: '/api/sys/ai/usage-logs', method: ['GET'], body: handleSys },
  { url: '/api/sys/ai/usage-logs/stats', method: ['GET'], body: handleSys },
  // 知识库
  { url: '/api/sys/ai/knowledge/source-config', method: ['GET'], body: handleSys },
  { url: '/api/sys/ai/knowledge/source-config/:id', method: ['GET', 'PUT'], body: handleSys },
  { url: '/api/sys/ai/knowledge/source-config/:id/toggle', method: ['PUT'], body: handleSys },
  { url: '/api/sys/ai/knowledge/entries', method: ['GET'], body: handleSys },
  { url: '/api/sys/ai/knowledge/entries/:id', method: ['GET'], body: handleSys },
  { url: '/api/sys/ai/knowledge/entries/:id/status', method: ['PUT'], body: handleSys },
  { url: '/api/sys/ai/knowledge/entries/sync', method: ['POST'], body: handleSys },
  { url: '/api/sys/ai/knowledge/entries/sync/tasks', method: ['GET'], body: handleSys },
  { url: '/api/sys/ai/knowledge/entries/sync/tasks/:taskId', method: ['GET'], body: handleSys },
  { url: '/api/sys/ai/knowledge/entries/sync/tasks/:taskId/retry', method: ['POST'], body: handleSys },
  // Agent
  { url: '/api/sys/ai/agents/definitions', method: ['GET', 'POST'], body: handleSys },
  { url: '/api/sys/ai/agents/definitions/:id', method: ['GET', 'PUT', 'DELETE'], body: handleSys },
  { url: '/api/sys/ai/agents/definitions/:id/toggle', method: ['PUT'], body: handleSys },
  { url: '/api/sys/ai/agents/tasks', method: ['GET'], body: handleSys },
  { url: '/api/sys/ai/agents/tasks/:id', method: ['GET'], body: handleSys },
  // 工具
  { url: '/api/sys/ai/tools', method: ['GET', 'POST'], body: handleSys },
  { url: '/api/sys/ai/tools/:id', method: ['GET', 'PUT', 'DELETE'], body: handleSys },
  { url: '/api/sys/ai/tools/:id/status', method: ['PUT'], body: handleSys },
  { url: '/api/sys/ai/tools/:id/execute', method: ['POST'], body: handleSys },
  { url: '/api/sys/ai/tools/call-logs', method: ['GET'], body: handleSys },
  { url: '/api/sys/ai/tools/authorizations', method: ['GET', 'POST'], body: handleSys },
  { url: '/api/sys/ai/tools/authorizations/:id', method: ['PUT', 'DELETE'], body: handleSys },
  // MCP
  { url: '/api/sys/ai/mcp-servers', method: ['GET', 'POST'], body: handleSys },
  { url: '/api/sys/ai/mcp-servers/:id', method: ['GET', 'PUT', 'DELETE'], body: handleSys },
  { url: '/api/sys/ai/mcp-servers/:id/status', method: ['PUT'], body: handleSys },
  { url: '/api/sys/ai/mcp-servers/:id/discover', method: ['POST'], body: handleSys },
  { url: '/api/sys/ai/mcp-servers/:id/tools', method: ['GET'], body: handleSys },
  { url: '/api/sys/ai/mcp-servers/:id/health', method: ['GET'], body: handleSys },
  // 用户 AI 会话
  { url: '/api/user/ai/sessions', method: ['GET', 'POST'], body: handleUser },
  { url: '/api/user/ai/sessions/quota', method: ['GET'], body: handleUser },
  { url: '/api/user/ai/sessions/:id', method: ['GET', 'DELETE'], body: handleUser },
  { url: '/api/user/ai/sessions/:id/messages', method: ['GET', 'POST'], body: handleUser },
  // 用户 Agent 任务
  { url: '/api/user/ai/agents/tasks', method: ['GET', 'POST'], body: handleUser },
  { url: '/api/user/ai/agents/tasks/:id', method: ['GET', 'PUT'], body: handleUser },
]
