import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, me, now, num, ok, page } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const u = me(req)
  const match = (r: RegExp) => path.match(r)

  if (m === 'GET' && path === '/api/user/chat/conversations') {
    const convIds = new Set(db.chatMembers.filter((i: any) => i.userId === u.id).map((i: any) => i.conversationId))
    const rs = db.chatConversations.filter((i: any) => convIds.has(i.id))
    return ok(page(rs.map((c: any) => ({ ...c, lastMessage: db.chatMessages.filter((m: any) => m.conversationId === c.id).sort((a: any, b: any) => b.id - a.id)[0] ?? null })), req.query))
  }

  if (m === 'GET' && match(/^\/api\/user\/chat\/conversations\/(\d+)$/)) {
    const conv = db.chatConversations.find((i: any) => i.id === num(match(/^\/api\/user\/chat\/conversations\/(\d+)$/)![1]))
    return conv ? ok(cp(conv)) : ok(null, '会话不存在', 404)
  }

  if (m === 'POST' && path === '/api/user/chat/single-conversations') {
    const targetId = num(req.body.targetUserId)
    const exist = db.chatConversations.find((i: any) => i.conversationType === 'single' && db.chatMembers.some((m1: any) => m1.conversationId === i.id && m1.userId === u.id) && db.chatMembers.some((m2: any) => m2.conversationId === i.id && m2.userId === targetId))
    if (exist) return ok(cp(exist))
    const id = ++db.seq.conversation
    const conv: any = { id, conversationType: 'single', name: null, avatar: null, notice: null, selfRole: 'owner', ownerId: u.id, memberCount: 2, unreadCount: 0, status: 1, isAllSite: 0, targetUserId: targetId, targetUsername: db.users.find((i: any) => i.id === targetId)?.username ?? '', targetNickname: db.users.find((i: any) => i.id === targetId)?.nickname ?? '', createdAt: now(), updatedAt: now() }
    db.chatConversations.push(conv)
    db.chatMembers.push({ conversationId: id, userId: u.id, username: u.username, nickname: u.nickname, avatar: u.avatar, role: 'owner', status: 1, muteUntil: null, joinedAt: now() })
    const target = db.users.find((i: any) => i.id === targetId)
    if (target) db.chatMembers.push({ conversationId: id, userId: targetId, username: target.username, nickname: target.nickname, avatar: target.avatar, role: 'member', status: 1, muteUntil: null, joinedAt: now() })
    return ok(cp(conv))
  }

  if (m === 'GET' && match(/^\/api\/user\/chat\/conversations\/(\d+)\/messages$/)) {
    const convId = num(match(/^\/api\/user\/chat\/conversations\/(\d+)\/messages$/)![1])
    let rs = db.chatMessages.filter((i: any) => i.conversationId === convId).sort((a: any, b: any) => a.id - b.id)
    if (req.query.beforeMessageId) rs = rs.filter((i: any) => i.id < num(req.query.beforeMessageId))
    return ok(page(rs, req.query))
  }

  if (m === 'POST' && path === '/api/user/chat/messages/text') {
    const id = ++db.seq.message
    const msg = { id, conversationId: num(req.body.conversationId), senderId: u.id, senderUsername: u.username, senderNickname: u.nickname, senderAvatar: u.avatar, messageType: 'text', content: req.body.content, file: null, replyMessageId: req.body.replyMessageId ?? null, reply: null, clientMessageId: req.body.clientMessageId ?? `msg_${id}`, deliveryStatus: 2, readByCurrentUser: true, revokeStatus: 0, revokedBy: null, revokedAt: null, revoked: false, edited: false, createdAt: now(), updatedAt: now() }
    db.chatMessages.push(msg)
    return ok(cp(msg))
  }

  if (m === 'POST' && path === '/api/user/chat/messages/file') {
    const id = ++db.seq.message
    const msg = { id, conversationId: num(req.body.conversationId), senderId: u.id, senderUsername: u.username, senderNickname: u.nickname, senderAvatar: u.avatar, messageType: 'file', content: null, file: { businessId: req.body.businessId, fileName: req.body.businessId, originalName: req.body.businessId, fileUrl: `https://mock.local/files/${req.body.businessId}`, fileSize: 0, fileType: 'file', mimeType: 'application/octet-stream' }, replyMessageId: null, reply: null, clientMessageId: `msg_${id}`, deliveryStatus: 2, readByCurrentUser: true, revokeStatus: 0, revokedBy: null, revokedAt: null, revoked: false, edited: false, createdAt: now(), updatedAt: now() }
    db.chatMessages.push(msg)
    return ok(cp(msg))
  }

  if (match(/^\/api\/user\/chat\/messages\/(\d+)$/) && m === 'PUT') {
    const msgId = num(match(/^\/api\/user\/chat\/messages\/(\d+)$/)![1])
    const msg = db.chatMessages.find((i: any) => i.id === msgId)
    if (msg && msg.senderId === u.id) { msg.content = req.body.content ?? msg.content; msg.edited = true; msg.updatedAt = now() }
    return ok(null)
  }

  if (match(/^\/api\/user\/chat\/messages\/(\d+)\/revoke$/) && m === 'POST') {
    const msgId = num(match(/^\/api\/user\/chat\/messages\/(\d+)\/revoke$/)![1])
    const msg = db.chatMessages.find((i: any) => i.id === msgId)
    if (msg) { msg.revoked = true; msg.revokeStatus = 1; msg.revokedAt = now() }
    return ok(null)
  }

  if (match(/^\/api\/user\/chat\/messages\/(\d+)$/) && m === 'DELETE') {
    const msgId = num(match(/^\/api\/user\/chat\/messages\/(\d+)$/)![1])
    db.chatMessages = db.chatMessages.filter((i: any) => i.id !== msgId)
    return ok(null)
  }

  if (match(/^\/api\/user\/chat\/conversations\/(\d+)\/read$/) && m === 'POST') return ok(null)

  if (m === 'POST' && path === '/api/user/chat/groups') {
    const id = ++db.seq.conversation
    const conv: any = { id, conversationType: 'group', name: req.body.name ?? '新群聊', avatar: null, notice: null, selfRole: 'owner', ownerId: u.id, memberCount: 1, unreadCount: 0, status: 1, isAllSite: 0, targetUserId: null, targetUsername: null, targetNickname: null, createdAt: now(), updatedAt: now() }
    db.chatConversations.push(conv)
    db.chatMembers.push({ conversationId: id, userId: u.id, username: u.username, nickname: u.nickname, avatar: u.avatar, role: 'owner', status: 1, muteUntil: null, joinedAt: now() })
    return ok(cp(conv))
  }

  if (m === 'GET' && match(/^\/api\/user\/chat\/groups\/(\d+)$/)) {
    const conv = db.chatConversations.find((i: any) => i.id === num(match(/^\/api\/user\/chat\/groups\/(\d+)$/)![1]))
    return conv ? ok(cp(conv)) : ok(null, '群聊不存在', 404)
  }

  if (m === 'GET' && match(/^\/api\/user\/chat\/groups\/(\d+)\/members$/)) {
    const convId = num(match(/^\/api\/user\/chat\/groups\/(\d+)\/members$/)![1])
    return ok(db.chatMembers.filter((i: any) => i.conversationId === convId))
  }

  if (match(/^\/api\/user\/chat\/groups\/(\d+)\/members$/) && m === 'POST') {
    const convId = num(match(/^\/api\/user\/chat\/groups\/(\d+)\/members$/)![1])
    const userIds: number[] = req.body.memberUserIds ?? []
    for (const uid of userIds) {
      if (!db.chatMembers.some((i: any) => i.conversationId === convId && i.userId === uid)) {
        const user = db.users.find((i: any) => i.id === uid)
        if (user) db.chatMembers.push({ conversationId: convId, userId: uid, username: user.username, nickname: user.nickname, avatar: user.avatar, role: 'member', status: 1, muteUntil: null, joinedAt: now() })
      }
    }
    return ok(null)
  }

  if (match(/^\/api\/user\/chat\/groups\/(\d+)\/admins\/(\d+)$/) && m === 'PUT') return ok(null)
  if (match(/^\/api\/user\/chat\/groups\/(\d+)\/admins\/(\d+)$/) && m === 'DELETE') return ok(null)
  if (match(/^\/api\/user\/chat\/groups\/(\d+)\/owner$/) && m === 'PUT') return ok(null)
  if (match(/^\/api\/user\/chat\/groups\/(\d+)\/members\/(\d+)\/mute$/) && m === 'PUT') return ok(null)
  if (match(/^\/api\/user\/chat\/groups\/(\d+)\/notice$/) && m === 'PUT') {
    const conv = db.chatConversations.find((i: any) => i.id === num(match(/^\/api\/user\/chat\/groups\/(\d+)\/notice$/)![1]))
    if (conv) conv.notice = req.body.notice ?? conv.notice
    return ok(null)
  }
  if (match(/^\/api\/user\/chat\/groups\/(\d+)\/members\/(\d+)$/) && m === 'DELETE') {
    const convId = num(match(/^\/api\/user\/chat\/groups\/(\d+)\/members\/(\d+)$/)![1])
    const userId = num(match(/^\/api\/user\/chat\/groups\/(\d+)\/members\/(\d+)$/)![2])
    db.chatMembers = db.chatMembers.filter((i: any) => !(i.conversationId === convId && i.userId === userId))
    return ok(null)
  }
  if (match(/^\/api\/user\/chat\/groups\/(\d+)\/leave$/) && m === 'POST') {
    const convId = num(match(/^\/api\/user\/chat\/groups\/(\d+)\/leave$/)![1])
    db.chatMembers = db.chatMembers.filter((i: any) => !(i.conversationId === convId && i.userId === u.id))
    return ok(null)
  }
  if (match(/^\/api\/user\/chat\/groups\/(\d+)$/) && m === 'DELETE') {
    const id = num(match(/^\/api\/user\/chat\/groups\/(\d+)$/)![1])
    db.chatConversations = db.chatConversations.filter((i: any) => i.id !== id)
    db.chatMembers = db.chatMembers.filter((i: any) => i.conversationId !== id)
    db.chatMessages = db.chatMessages.filter((i: any) => i.conversationId !== id)
    return ok(null)
  }

  if (m === 'GET' && path === '/api/user/chat/groups/search') return ok(page([], req.query))
  if (m === 'POST' && path === '/api/user/chat/channel-applications') return ok(null)
  if (m === 'GET' && path === '/api/user/chat/channel-applications/latest') return ok(null)
  if (m === 'GET' && path === '/api/user/chat/channel-applications') return ok(page([], req.query))
  if (m === 'POST' && path === '/api/user/chat/forum-links') return ok(null)
  if (m === 'GET' && match(/^\/api\/user\/chat\/forum-links\/posts\/(\d+)$/)) return ok(null)
  if (m === 'GET' && match(/^\/api\/user\/chat\/forum-links\/channels\/(\d+)$/)) return ok(page([], req.query))
  if (m === 'DELETE' && match(/^\/api\/user\/chat\/forum-links\/posts\/(\d+)$/)) return ok(null)
  if (m === 'POST' && match(/^\/api\/user\/chat\/groups\/(\d+)\/join-applications$/)) return ok(null)
  if (m === 'GET' && path === '/api/user/chat/group-join-applications') return ok(page([], req.query))
  if (m === 'GET' && match(/^\/api\/user\/chat\/groups\/(\d+)\/join-applications$/)) return ok(page([], req.query))
  if (m === 'PUT' && match(/^\/api\/user\/chat\/groups\/(\d+)\/join-applications\/(\d+)\/review$/)) return ok(null)
  if (m === 'POST' && match(/^\/api\/user\/chat\/groups\/(\d+)\/invite-links$/)) return ok({ inviteToken: `mock-token-${Date.now()}`, expireTime: null })
  if (m === 'GET' && match(/^\/api\/user\/chat\/groups\/(\d+)\/invite-links$/)) return ok([])
  if (m === 'PUT' && match(/^\/api\/user\/chat\/groups\/(\d+)\/invite-links\/(\d+)\/disable$/)) return ok(null)
  if (m === 'POST' && match(/^\/api\/user\/chat\/group-invite-links\/([^/]+)\/join$/)) return ok(null)

  if (match(/^\/api\/user\/chat\/conversations\/(\d+)\/join$/) && m === 'POST') return ok(null)
  if (match(/^\/api\/user\/chat\/conversations\/(\d+)\/leave$/) && m === 'POST') {
    const convId = num(match(/^\/api\/user\/chat\/conversations\/(\d+)\/leave$/)![1])
    db.chatMembers = db.chatMembers.filter((i: any) => !(i.conversationId === convId && i.userId === u.id))
    return ok(null)
  }

  return ok(null, '未匹配到用户聊天接口', 404)
}

export default defineMock([
  { url: '/api/user/chat/conversations', method: 'GET', body: handle },
  { url: '/api/user/chat/conversations/:id', method: 'GET', body: handle },
  { url: '/api/user/chat/conversations/:id/messages', method: 'GET', body: handle },
  { url: '/api/user/chat/conversations/:id/read', method: 'POST', body: handle },
  { url: '/api/user/chat/conversations/:id/join', method: 'POST', body: handle },
  { url: '/api/user/chat/conversations/:id/leave', method: 'POST', body: handle },
  { url: '/api/user/chat/single-conversations', method: 'POST', body: handle },
  { url: '/api/user/chat/messages/text', method: 'POST', body: handle },
  { url: '/api/user/chat/messages/file', method: 'POST', body: handle },
  { url: '/api/user/chat/messages/:id', method: ['PUT', 'DELETE'], body: handle },
  { url: '/api/user/chat/messages/:id/revoke', method: 'POST', body: handle },
  { url: '/api/user/chat/groups', method: ['GET', 'POST'], body: handle },
  { url: '/api/user/chat/groups/search', method: 'GET', body: handle },
  { url: '/api/user/chat/groups/:id', method: ['GET', 'DELETE'], body: handle },
  { url: '/api/user/chat/groups/:id/members', method: ['GET', 'POST'], body: handle },
  { url: '/api/user/chat/groups/:id/members/:userId', method: 'DELETE', body: handle },
  { url: '/api/user/chat/groups/:id/members/:userId/mute', method: 'PUT', body: handle },
  { url: '/api/user/chat/groups/:id/admins/:userId', method: ['PUT', 'DELETE'], body: handle },
  { url: '/api/user/chat/groups/:id/owner', method: 'PUT', body: handle },
  { url: '/api/user/chat/groups/:id/notice', method: 'PUT', body: handle },
  { url: '/api/user/chat/groups/:id/leave', method: 'POST', body: handle },
  { url: '/api/user/chat/groups/:id/join-applications', method: ['GET', 'POST'], body: handle },
  { url: '/api/user/chat/groups/:id/join-applications/:applicationId/review', method: 'PUT', body: handle },
  { url: '/api/user/chat/groups/:id/invite-links', method: ['GET', 'POST'], body: handle },
  { url: '/api/user/chat/groups/:id/invite-links/:inviteLinkId/disable', method: 'PUT', body: handle },
  { url: '/api/user/chat/group-invite-links/:inviteToken/join', method: 'POST', body: handle },
  { url: '/api/user/chat/group-join-applications', method: 'GET', body: handle },
  { url: '/api/user/chat/channel-applications', method: ['GET', 'POST'], body: handle },
  { url: '/api/user/chat/channel-applications/latest', method: 'GET', body: handle },
  { url: '/api/user/chat/forum-links', method: 'POST', body: handle },
  { url: '/api/user/chat/forum-links/posts/:postId', method: ['GET', 'DELETE'], body: handle },
  { url: '/api/user/chat/forum-links/channels/:channelId', method: 'GET', body: handle },
])
