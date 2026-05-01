import { defineMock } from 'vite-plugin-mock-dev-server'
import { now, num, ok, p, page } from './shared'
import { db } from './shared'

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
])
