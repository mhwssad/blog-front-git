import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, has, now, num, ok, p, page } from './shared'

function getConversation(conversationId: number) {
  return db.chatConversations.find((item: any) => item.id === conversationId)
}

function getMessages(conversationId: number) {
  return db.chatMessages
    .filter((item: any) => item.conversationId === conversationId)
    .sort((left: any, right: any) => right.id - left.id)
}

function normalizeConversation(conversation: any) {
  return {
    ...conversation,
    lastMessage: getMessages(conversation.id)[0] ?? null,
  }
}

const channelApplications = [
  {
    id: 301,
    userId: 3,
    username: 'tester',
    nickname: '测试同学',
    desiredName: '前端交流频道',
    desiredSceneType: 'topic_channel',
    desiredCategoryCode: 'tech',
    description: '希望创建一个聚焦前端学习和协作的主题频道。',
    applyStatus: 0,
    reviewComment: null,
    reviewerId: null,
    reviewerUsername: null,
    reviewerNickname: null,
    createdAt: '2026-04-22 09:30:00',
    reviewedAt: null,
  },
  {
    id: 302,
    userId: 4,
    username: 'fiona',
    nickname: '菲奥娜',
    desiredName: '设计讨论频道',
    desiredSceneType: 'topic_channel',
    desiredCategoryCode: 'design',
    description: '分享视觉设计和交互经验。',
    applyStatus: 1,
    reviewComment: '内容方向清晰，已通过。',
    reviewerId: 1,
    reviewerUsername: 'admin',
    reviewerNickname: '管理员',
    createdAt: '2026-04-18 15:20:00',
    reviewedAt: '2026-04-19 10:00:00',
  },
]

const groupJoinApplications = [
  {
    id: 401,
    conversationId: 2,
    userId: 3,
    username: 'tester',
    nickname: '测试同学',
    applyMessage: '希望加入群里一起跟进排期。',
    applyStatus: 0,
    reviewComment: null,
    createdAt: '2026-04-28 11:20:00',
    reviewedAt: null,
  },
  {
    id: 402,
    conversationId: 2,
    userId: 5,
    username: 'alex',
    nickname: 'Alex',
    applyMessage: '我可以协助整理素材。',
    applyStatus: 1,
    reviewComment: '欢迎加入。',
    createdAt: '2026-04-26 13:40:00',
    reviewedAt: '2026-04-27 09:00:00',
  },
]

function findChannelApplication(id: number) {
  return channelApplications.find((item: any) => item.id === id)
}

function findGroupJoinApplication(id: number) {
  return groupJoinApplications.find((item: any) => item.id === id)
}

function handle(req: any) {
  const method = String(req.method).toUpperCase()
  const path = p(req)
  const conversationMatch = path.match(/^\/api\/sys\/chats\/conversations\/(\d+)$/)
  const membersMatch = path.match(/^\/api\/sys\/chats\/conversations\/(\d+)\/members$/)
  const messagesMatch = path.match(/^\/api\/sys\/chats\/conversations\/(\d+)\/messages$/)
  const messageDetailMatch = path.match(/^\/api\/sys\/chats\/conversations\/(\d+)\/messages\/(\d+)$/)
  const receiptsMatch = path.match(/^\/api\/sys\/chats\/conversations\/(\d+)\/messages\/(\d+)\/receipts$/)
  const memberRoleMatch = path.match(/^\/api\/sys\/chats\/conversations\/(\d+)\/members\/(\d+)\/role$/)
  const memberStatusMatch = path.match(/^\/api\/sys\/chats\/conversations\/(\d+)\/members\/(\d+)\/status$/)
  const memberMuteMatch = path.match(/^\/api\/sys\/chats\/conversations\/(\d+)\/members\/(\d+)\/mute$/)
  const revokeMatch = path.match(/^\/api\/sys\/chats\/conversations\/(\d+)\/messages\/(\d+)\/revoke$/)
  const conversationStatusMatch = path.match(/^\/api\/sys\/chats\/conversations\/(\d+)\/status$/)

  if (method === 'GET' && path === '/api/sys/chats/conversations') {
    let records = [...db.chatConversations]

    if (req.query.keyword) {
      records = records.filter((item: any) =>
        [item.name, item.notice, item.targetUsername, item.targetNickname].some((field: any) =>
          String(field ?? '').toLowerCase().includes(String(req.query.keyword).trim().toLowerCase())
        )
      )
    }
    if (req.query.conversationType) records = records.filter((item: any) => item.conversationType === req.query.conversationType)
    if (req.query.status !== undefined && req.query.status !== '') records = records.filter((item: any) => item.status === num(req.query.status))
    if (req.query.ownerId) records = records.filter((item: any) => item.ownerId === num(req.query.ownerId))
    if (req.query.isAllSite !== undefined && req.query.isAllSite !== '') records = records.filter((item: any) => item.isAllSite === num(req.query.isAllSite))
    if (req.query.memberUserId) records = records.filter((item: any) => db.chatMembers.some((member: any) => member.conversationId === item.id && member.userId === num(req.query.memberUserId)))

    return ok(page(records.map(normalizeConversation), req.query))
  }

  if (method === 'GET' && conversationMatch) {
    const conversation = getConversation(num(conversationMatch[1]))
    return conversation ? ok(normalizeConversation(conversation)) : ok(null, '会话不存在', 404)
  }

  if (method === 'GET' && membersMatch) {
    return ok(db.chatMembers.filter((item: any) => item.conversationId === num(membersMatch[1])))
  }

  if (method === 'GET' && messagesMatch) {
    let records = getMessages(num(messagesMatch[1]))

    if (req.query.beforeMessageId) records = records.filter((item: any) => item.id < num(req.query.beforeMessageId))
    if (req.query.senderId) records = records.filter((item: any) => item.senderId === num(req.query.senderId))
    if (req.query.messageType) records = records.filter((item: any) => item.messageType === req.query.messageType)
    if (req.query.keyword) {
      records = records.filter((item: any) =>
        String(item.content ?? item.file?.originalName ?? '').toLowerCase().includes(String(req.query.keyword).trim().toLowerCase())
      )
    }

    return ok(page(records, req.query))
  }

  if (method === 'GET' && messageDetailMatch) {
    const message = db.chatMessages.find((item: any) => item.conversationId === num(messageDetailMatch[1]) && item.id === num(messageDetailMatch[2]))
    return message ? ok(message) : ok(null, '消息不存在', 404)
  }

  if (method === 'GET' && receiptsMatch) {
    let records = db.chatReceipts.filter((item: any) => item.conversationId === num(receiptsMatch[1]) && item.messageId === num(receiptsMatch[2]))

    if (req.query.recipientUserId) records = records.filter((item: any) => item.recipientUserId === num(req.query.recipientUserId))
    if (req.query.deliveryStatus !== undefined && req.query.deliveryStatus !== '') records = records.filter((item: any) => item.deliveryStatus === num(req.query.deliveryStatus))
    if (req.query.visibleStatus !== undefined && req.query.visibleStatus !== '') records = records.filter((item: any) => item.visibleStatus === num(req.query.visibleStatus))

    return ok(page(records.map(({ conversationId, messageId, ...r }: any) => r), req.query))
  }

  if (method === 'PUT' && memberRoleMatch) {
    const member = db.chatMembers.find((item: any) => item.conversationId === num(memberRoleMatch[1]) && item.userId === num(memberRoleMatch[2]))
    if (!member) return ok(null, '成员不存在', 404)
    member.role = req.body.role ?? member.role
    return ok(null)
  }

  if (method === 'PUT' && memberStatusMatch) {
    const member = db.chatMembers.find((item: any) => item.conversationId === num(memberStatusMatch[1]) && item.userId === num(memberStatusMatch[2]))
    if (!member) return ok(null, '成员不存在', 404)
    member.status = req.body.status ?? member.status
    return ok(null)
  }

  if (method === 'PUT' && memberMuteMatch) {
    const member = db.chatMembers.find((item: any) => item.conversationId === num(memberMuteMatch[1]) && item.userId === num(memberMuteMatch[2]))
    if (!member) return ok(null, '成员不存在', 404)
    member.muteUntil = req.body.muteUntil ?? null
    return ok(null)
  }

  if (method === 'POST' && revokeMatch) {
    const message = db.chatMessages.find((item: any) => item.conversationId === num(revokeMatch[1]) && item.id === num(revokeMatch[2]))
    if (!message) return ok(null, '消息不存在', 404)
    message.revoked = true
    message.revokeStatus = 1
    message.revokedAt = now()
    return ok(null)
  }

  if (method === 'PUT' && conversationStatusMatch) {
    const conversation = getConversation(num(conversationStatusMatch[1]))
    if (!conversation) return ok(null, '会话不存在', 404)
    conversation.status = req.body.status ?? conversation.status
    conversation.updatedAt = now()
    return ok(null)
  }

  // ==================== 大厅管理 ====================

  if (method === 'PUT' && /^\/api\/sys\/chats\/lobby\/settings\/?$/.test(path)) {
    db.chatLobbySettings = {
      ...(db.chatLobbySettings || {}),
      name: req.body.name ?? db.chatLobbySettings?.name ?? '全站大厅',
      notice: req.body.notice ?? db.chatLobbySettings?.notice ?? '',
      updatedAt: now(),
    }
    return ok(db.chatLobbySettings)
  }
  if (method === 'GET' && /^\/api\/sys\/chats\/lobby\/messages\/pinned\/?$/.test(path)) {
    const message = db.chatMessages.find((item: any) => item.id === 6)
    return ok(
      [
        {
          id: 1,
          messageId: 6,
          conversationId: 3,
          pinnedBy: 1,
          pinnedAt: '2026-03-30 18:05:00',
          message: message ? cp(message) : null,
        },
      ],
      '成功',
    )
  }
  if (method === 'POST' && path.match(/^\/api\/sys\/chats\/lobby\/messages\/(\d+)\/pin$/)) return ok(null)
  if (method === 'DELETE' && path.match(/^\/api\/sys\/chats\/lobby\/messages\/(\d+)\/pin$/)) return ok(null)
  if (method === 'PUT' && path.match(/^\/api\/sys\/chats\/lobby\/members\/(\d+)\/mute$/)) return ok(null)
  if (method === 'PUT' && path.match(/^\/api\/sys\/chats\/lobby\/members\/(\d+)\/kick$/)) return ok(null)

  // ==================== 话题频道 ====================

  if (method === 'POST' && /^\/api\/sys\/chats\/topic-channels\/?$/.test(path)) {
    const id = ++db.seq.conversation
    const ch = {
      id,
      conversationType: 'group',
      sceneType: 'topic_channel',
      name: req.body.name ?? '新频道',
      avatar: req.body.avatar ?? null,
      notice: req.body.announcement ?? req.body.notice ?? null,
      visibilityScope: req.body.visibilityScope ?? 'public',
      joinRule: req.body.joinRule ?? 'free',
      speakLevelLimit: req.body.speakLevelLimit ?? 0,
      memberLimit: req.body.memberLimit ?? 0,
      slowModeSeconds: req.body.slowModeSeconds ?? 0,
      displaySort: req.body.displaySort ?? 0,
      channelCategoryCode: req.body.categoryCode ?? null,
      selfRole: 'owner',
      ownerId: 1,
      memberCount: 0,
      unreadCount: 0,
      status: 1,
      isAllSite: 0,
      targetUserId: null,
      targetUsername: null,
      targetNickname: null,
      createdAt: now(),
      updatedAt: now(),
    }
    db.chatConversations.push(ch)
    return ok(cp(ch))
  }
  if (method === 'PUT' && path.match(/^\/api\/sys\/chats\/topic-channels\/(\d+)$/)) {
    const ch = getConversation(num(path.match(/^\/api\/sys\/chats\/topic-channels\/(\d+)$/)![1]))
    if (!ch) return ok(null, '频道不存在', 404)
    ch.name = req.body.name ?? ch.name
    ch.avatar = req.body.avatar ?? ch.avatar
    ch.notice = req.body.announcement ?? req.body.notice ?? ch.notice
    ch.visibilityScope = req.body.visibilityScope ?? ch.visibilityScope
    ch.joinRule = req.body.joinRule ?? ch.joinRule
    ch.speakLevelLimit = req.body.speakLevelLimit ?? ch.speakLevelLimit
    ch.memberLimit = req.body.memberLimit ?? ch.memberLimit
    ch.slowModeSeconds = req.body.slowModeSeconds ?? ch.slowModeSeconds
    ch.displaySort = req.body.displaySort ?? ch.displaySort
    ch.channelCategoryCode = req.body.categoryCode ?? ch.channelCategoryCode
    ch.updatedAt = now()
    return ok(cp(ch))
  }

  // ==================== 频道申请 ====================

  if (method === 'GET' && /^\/api\/sys\/chats\/channel-applications\/?$/.test(path)) {
    let rs = [...channelApplications]
    if (req.query.applyStatus !== undefined && req.query.applyStatus !== '')
      rs = rs.filter((i: any) => i.applyStatus === num(req.query.applyStatus))
    if (req.query.keyword) {
      const keyword = String(req.query.keyword).trim().toLowerCase()
      rs = rs.filter((i: any) =>
        [i.username, i.nickname, i.desiredName, i.desiredCategoryCode, i.description].some(
          (field: any) => String(field ?? '').toLowerCase().includes(keyword),
        ),
      )
    }
    return ok(page(rs, req.query))
  }
  if (method === 'GET' && path.match(/^\/api\/sys\/chats\/channel-applications\/(\d+)$/)) {
    const item = findChannelApplication(num(path.match(/^\/api\/sys\/chats\/channel-applications\/(\d+)$/)![1]))
    return item ? ok(cp(item)) : ok(null, '申请不存在', 404)
  }
  if (method === 'PUT' && path.match(/^\/api\/sys\/chats\/channel-applications\/(\d+)\/review$/)) {
    const item = findChannelApplication(num(path.match(/^\/api\/sys\/chats\/channel-applications\/(\d+)\/review$/)![1]))
    if (!item) return ok(null, '申请不存在', 404)
    item.applyStatus = req.body.approved ? 1 : 2
    item.reviewComment = req.body.reason ?? null
    item.reviewerId = 1
    item.reviewerUsername = 'admin'
    item.reviewerNickname = '管理员'
    item.reviewedAt = now()
    return ok(null)
  }

  // ==================== 入群申请 ====================

  if (method === 'GET' && /^\/api\/sys\/chats\/group-join-applications\/?$/.test(path)) {
    let rs = [...groupJoinApplications]
    if (req.query.conversationId) rs = rs.filter((i: any) => i.conversationId === num(req.query.conversationId))
    if (req.query.applyStatus !== undefined && req.query.applyStatus !== '')
      rs = rs.filter((i: any) => i.applyStatus === num(req.query.applyStatus))
    if (req.query.keyword) {
      const keyword = String(req.query.keyword).trim().toLowerCase()
      rs = rs.filter((i: any) =>
        [i.username, i.nickname, i.applyMessage].some((field: any) =>
          String(field ?? '').toLowerCase().includes(keyword),
        ),
      )
    }
    return ok(page(rs, req.query))
  }
  if (method === 'GET' && path.match(/^\/api\/sys\/chats\/group-join-applications\/(\d+)$/) && !path.includes('/review')) {
    const item = findGroupJoinApplication(num(path.match(/^\/api\/sys\/chats\/group-join-applications\/(\d+)$/)![1]))
    return item ? ok(cp(item)) : ok(null, '申请不存在', 404)
  }

  if (method === 'PUT' && path.match(/^\/api\/sys\/chats\/group-join-applications\/(\d+)\/review$/)) {
    const item = findGroupJoinApplication(num(path.match(/^\/api\/sys\/chats\/group-join-applications\/(\d+)\/review$/)![1]))
    if (!item) return ok(null, '申请不存在', 404)
    item.applyStatus = req.body.approved ? 1 : 2
    item.reviewComment = req.body.reason ?? null
    item.reviewedAt = now()
    return ok(null)
  }

  // ==================== 禁言管理 ====================

  if (method === 'GET' && path === '/api/sys/chats/mutes') {
    let rs = [...(db.chatMutes || [])]
    if (req.query.userId) rs = rs.filter((i: any) => i.userId === num(req.query.userId))
    if (req.query.scope) rs = rs.filter((i: any) => i.scope === req.query.scope)
    if (req.query.status) rs = rs.filter((i: any) => i.status === req.query.status)
    return ok(page(rs, req.query))
  }

  if (method === 'POST' && path === '/api/sys/chats/mutes') {
    const item = {
      id: ++db.seq.chatMute,
      userId: req.body.userId,
      scope: req.body.scope ?? 'global',
      reason: req.body.reason ?? '',
      status: 'active',
      muteUntil: req.body.muteUntil ?? null,
      createdAt: now(),
    }
    if (!db.chatMutes) db.chatMutes = []
    db.chatMutes.push(item)
    return ok(cp(item))
  }

  if (method === 'PUT' && path.match(/^\/api\/sys\/chats\/mutes\/(\d+)\/release$/)) {
    const muteId = num(path.match(/^\/api\/sys\/chats\/mutes\/(\d+)\/release$/)![1])
    const x = (db.chatMutes || []).find((i: any) => i.id === muteId)
    if (x) {
      x.isReleased = 1
      x.releasedBy = 1
      x.releasedAt = now()
    }
    return ok(null)
  }

  return ok(null, '未匹配到聊天后台接口', 404)
}

export default defineMock([
  { url: '/api/sys/chats/conversations', method: 'GET', body: handle },
  { url: '/api/sys/chats/conversations/:id', method: 'GET', body: handle },
  { url: '/api/sys/chats/conversations/:id/members', method: 'GET', body: handle },
  { url: '/api/sys/chats/conversations/:id/messages', method: 'GET', body: handle },
  { url: '/api/sys/chats/conversations/:id/messages/:messageId', method: 'GET', body: handle },
  { url: '/api/sys/chats/conversations/:id/messages/:messageId/receipts', method: 'GET', body: handle },
  { url: '/api/sys/chats/conversations/:id/members/:memberUserId/role', method: 'PUT', body: handle },
  { url: '/api/sys/chats/conversations/:id/members/:memberUserId/status', method: 'PUT', body: handle },
  { url: '/api/sys/chats/conversations/:id/members/:memberUserId/mute', method: 'PUT', body: handle },
  { url: '/api/sys/chats/conversations/:id/messages/:messageId/revoke', method: 'POST', body: handle },
  { url: '/api/sys/chats/conversations/:id/status', method: 'PUT', body: handle },
  { url: '/api/sys/chats/lobby/settings', method: 'PUT', body: handle },
  { url: '/api/sys/chats/lobby/messages/pinned', method: 'GET', body: handle },
  { url: '/api/sys/chats/lobby/messages/:messageId/pin', method: ['POST', 'DELETE'], body: handle },
  { url: '/api/sys/chats/lobby/members/:memberUserId/mute', method: 'PUT', body: handle },
  { url: '/api/sys/chats/lobby/members/:memberUserId/kick', method: 'PUT', body: handle },
  { url: '/api/sys/chats/topic-channels', method: 'POST', body: handle },
  { url: '/api/sys/chats/topic-channels/:id', method: 'PUT', body: handle },
  { url: '/api/sys/chats/channel-applications', method: 'GET', body: handle },
  { url: '/api/sys/chats/channel-applications/:id', method: 'GET', body: handle },
  { url: '/api/sys/chats/channel-applications/:id/review', method: 'PUT', body: handle },
  { url: '/api/sys/chats/group-join-applications', method: 'GET', body: handle },
  { url: '/api/sys/chats/group-join-applications/:id', method: 'GET', body: handle },
  { url: '/api/sys/chats/group-join-applications/:applicationId/review', method: 'PUT', body: handle },
  { url: '/api/sys/chats/mutes', method: ['GET', 'POST'], body: handle },
  { url: '/api/sys/chats/mutes/:id/release', method: 'PUT', body: handle },
])
