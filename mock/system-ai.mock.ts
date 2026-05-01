import { cp, db, has, now, num, ok, page, p } from './shared'

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

  // ==================== 后台会话管理 ====================

  // 4.2.2 分页查询用户会话
  if (method === 'GET' && /^\/api\/sys\/ai\/sessions\/?$/.test(path)) {
    let list = cp(db.aiSessions).map((s: any) => {
      const user = db.users.find((u: any) => u.id === s.userId) || {}
      const ch = db.aiChannels.find((c: any) => c.id === s.channelConfigId) || {}
      return {
        ...s,
        username: user.username ?? '',
        nickname: user.nickname ?? '',
        channelName: ch.channelName ?? '',
      }
    })
    const q = req.query || {}
    if (q.userId) list = list.filter((i: any) => i.userId === num(q.userId))
    if (q.status !== undefined && q.status !== '')
      list = list.filter((i: any) => i.status === num(q.status))
    if (q.channelConfigId)
      list = list.filter((i: any) => i.channelConfigId === num(q.channelConfigId))
    if (q.startTime) list = list.filter((i: any) => i.createdAt >= q.startTime)
    if (q.endTime) list = list.filter((i: any) => i.createdAt <= q.endTime)
    return ok(page(list, q))
  }

  // 4.2.3 查询会话详情
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

  // 4.3.3 获取使用统计 (must be before usage-logs/:id)
  if (method === 'GET' && /^\/api\/sys\/ai\/usage-logs\/stats\/?$/.test(path)) {
    const q = req.query || {}
    let logs = cp(db.aiUsageLogs)
    if (q.userId) logs = logs.filter((i: any) => i.userId === num(q.userId))
    if (q.channelConfigId)
      logs = logs.filter((i: any) => i.channelConfigId === num(q.channelConfigId))
    if (q.startTime) logs = logs.filter((i: any) => i.createdAt >= q.startTime)
    if (q.endTime) logs = logs.filter((i: any) => i.createdAt <= q.endTime)
    if (q.successStatus !== undefined && q.successStatus !== '')
      logs = logs.filter((i: any) => i.successStatus === num(q.successStatus))

    const stats = {
      totalCalls: logs.length,
      successCalls: logs.filter((i: any) => i.successStatus === 1).length,
      failedCalls: logs.filter((i: any) => i.successStatus === 0).length,
      totalTokens: logs.reduce((sum: number, i: any) => sum + i.totalTokens, 0),
      totalQuotaCost: logs.reduce((sum: number, i: any) => sum + i.quotaCost, 0),
    }
    return ok(stats)
  }

  // 4.3.2 分页查询使用日志
  if (method === 'GET' && /^\/api\/sys\/ai\/usage-logs\/?$/.test(path)) {
    let list = cp(db.aiUsageLogs)
    const q = req.query || {}
    if (q.userId) list = list.filter((i: any) => i.userId === num(q.userId))
    if (q.channelConfigId)
      list = list.filter((i: any) => i.channelConfigId === num(q.channelConfigId))
    if (q.startTime) list = list.filter((i: any) => i.createdAt >= q.startTime)
    if (q.endTime) list = list.filter((i: any) => i.createdAt <= q.endTime)
    if (q.successStatus !== undefined && q.successStatus !== '')
      list = list.filter((i: any) => i.successStatus === num(q.successStatus))
    list.sort((a: any, b: any) => b.id - a.id)
    return ok(page(list, q))
  }

  return ok(null, '未匹配的 AI 管理接口', 404)
}

function handleUser(req: any) {
  const path = p(req)
  const method = req.method?.toUpperCase()

  // 3.8 查询配额
  if (method === 'GET' && /^\/api\/user\/ai\/sessions\/quota\/?$/.test(path)) {
    return ok({ dailyLimit: 50, usedToday: 12, remainingToday: 38 })
  }

  // 3.2 创建会话
  if (method === 'POST' && /^\/api\/user\/ai\/sessions\/?$/.test(path)) {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const id = ++db.seq.aiSession
    const session = {
      id,
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

  // 3.3 查询会话列表
  if (method === 'GET' && /^\/api\/user\/ai\/sessions\/?$/.test(path)) {
    const list = cp(db.aiSessions).filter((s: any) => s.userId === 1).sort((a: any, b: any) => b.id - a.id)
    return ok(page(list, req.query || {}))
  }

  // 3.5 查询会话消息
  const msgMatch = path.match(/^\/api\/user\/ai\/sessions\/(\d+)\/messages\/?$/)
  if (msgMatch && method === 'GET') {
    const sessionId = num(msgMatch[1])
    const list = cp(db.aiMessages).filter((m: any) => m.sessionId === sessionId)
    return ok(page(list, req.query || {}))
  }

  // 3.6 发送消息
  if (msgMatch && method === 'POST') {
    const sessionId = num(msgMatch[1])
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
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
      createdAt: now(),
    }
    db.aiMessages.push(userMsg)

    const aiMsgId = ++db.seq.aiMessage
    const aiMsg = {
      id: aiMsgId,
      sessionId,
      roleType: 'assistant',
      content: `这是一个关于「${body.content.slice(0, 20)}」的好问题！让我为你分析一下...\n\n这个问题涉及多个方面，建议你可以从基础概念入手，逐步深入学习。如果需要更详细的解答，欢迎继续提问。`,
      requestSceneType: null,
      tokenCount: Math.ceil(Math.random() * 200 + 50),
      responseStatus: 1,
      errorMessage: null,
      createdAt: now(),
    }
    db.aiMessages.push(aiMsg)

    return ok(aiMsg)
  }

  // 3.7 关闭会话
  const sessMatch = path.match(/^\/api\/user\/ai\/sessions\/(\d+)\/?$/)
  if (sessMatch && method === 'DELETE') {
    const id = num(sessMatch[1])
    const s = db.aiSessions.find((i: any) => i.id === id)
    if (s) {
      s.status = 0
      s.updatedAt = now()
    }
    return ok(null)
  }

  // 3.4 查询会话详情
  if (sessMatch && method === 'GET') {
    const id = num(sessMatch[1])
    const s = db.aiSessions.find((i: any) => i.id === id)
    if (!s) return ok(null, '会话不存在', 404)
    const ch = db.aiChannels.find((c: any) => c.id === s.channelConfigId) || {}
    return ok({ ...cp(s), channelName: ch.channelName ?? '', modelName: ch.modelName ?? '' })
  }

  return ok(null, '未匹配的 AI 用户接口', 404)
}

export default [
  {
    url: '/api/sys/ai/channels',
    method: ['GET', 'POST'],
    body: handleSys,
  },
  {
    url: '/api/sys/ai/channels/:id',
    method: ['GET', 'PUT', 'DELETE'],
    body: handleSys,
  },
  {
    url: '/api/sys/ai/channels/:id/status',
    method: ['PUT'],
    body: handleSys,
  },
  {
    url: '/api/sys/ai/sessions',
    method: ['GET'],
    body: handleSys,
  },
  {
    url: '/api/sys/ai/sessions/:id',
    method: ['GET'],
    body: handleSys,
  },
  {
    url: '/api/sys/ai/usage-logs',
    method: ['GET'],
    body: handleSys,
  },
  {
    url: '/api/sys/ai/usage-logs/stats',
    method: ['GET'],
    body: handleSys,
  },
  {
    url: '/api/user/ai/sessions',
    method: ['GET', 'POST'],
    body: handleUser,
  },
  {
    url: '/api/user/ai/sessions/quota',
    method: ['GET'],
    body: handleUser,
  },
  {
    url: '/api/user/ai/sessions/:id',
    method: ['GET', 'DELETE'],
    body: handleUser,
  },
  {
    url: '/api/user/ai/sessions/:id/messages',
    method: ['GET', 'POST'],
    body: handleUser,
  },
]
