import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, me, now, num, ok, page } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const u = me(req)
  const match = (r: RegExp) => path.match(r)

  // ==================== 会话列表 ====================
  if (m === 'GET' && path === '/api/user/chat/conversations') {
    const convIds = new Set(db.chatMembers.filter((i: any) => i.userId === u.id).map((i: any) => i.conversationId))
    let rs = db.chatConversations.filter((i: any) => convIds.has(i.id))
    if (req.query.keyword) {
      const kw = String(req.query.keyword).toLowerCase()
      rs = rs.filter((c: any) => {
        const name = String(c.name || '').toLowerCase()
        const lastMsg = db.chatMessages.filter((m: any) => m.conversationId === c.id).sort((a: any, b: any) => b.id - a.id)[0]
        return name.includes(kw) || (lastMsg && String(lastMsg.content || '').toLowerCase().includes(kw))
      })
    }
    return ok(page(rs.map((c: any) => {
      const msgs = db.chatMessages.filter((m: any) => m.conversationId === c.id).sort((a: any, b: any) => b.id - a.id)
      const lastMsg = msgs[0] ?? null
      return {
        ...cp(c),
        lastMessage: lastMsg ? {
          id: lastMsg.id,
          senderId: lastMsg.senderId,
          senderNickname: lastMsg.senderNickname,
          messageType: lastMsg.messageType,
          content: lastMsg.content,
          createdAt: lastMsg.createdAt,
        } : null,
      }
    }), req.query))
  }

  // ==================== 会话详情 ====================
  if (m === 'GET' && match(/^\/api\/user\/chat\/conversations\/(\d+)$/)) {
    const conv = db.chatConversations.find((i: any) => i.id === num(match(/^\/api\/user\/chat\/conversations\/(\d+)$/)![1]))
    return conv ? ok(cp(conv)) : ok(null, '会话不存在', 404)
  }

  // ==================== 创建单聊 ====================
  if (m === 'POST' && path === '/api/user/chat/single-conversations') {
    const targetId = num(req.body.targetUserId)
    const exist = db.chatConversations.find((i: any) =>
      i.conversationType === 'single' &&
      db.chatMembers.some((m1: any) => m1.conversationId === i.id && m1.userId === u.id) &&
      db.chatMembers.some((m2: any) => m2.conversationId === i.id && m2.userId === targetId)
    )
    if (exist) return ok(cp(exist))
    const id = ++db.seq.conversation
    const target = db.users.find((i: any) => i.id === targetId)
    const conv: any = {
      id,
      conversationType: 'single',
      sceneType: 'single_chat',
      name: null,
      avatar: null,
      ownerId: null,
      notice: null,
      allSite: null,
      status: 0,
      visibilityScope: null,
      allowGuestView: null,
      requireJoinToSpeak: null,
      joinRule: null,
      speakLevelLimit: null,
      memberLimit: null,
      slowModeSeconds: null,
      displaySort: null,
      channelCategoryCode: null,
      selfRole: 'owner',
      memberCount: null,
      unreadCount: 0,
      targetUserId: targetId,
      targetUsername: target?.username ?? '',
      targetNickname: target?.nickname ?? '',
      lastReadMessageId: null,
      lastReadAt: null,
      lastDeliveredMessageId: null,
      lastDeliveredAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    db.chatConversations.push(conv)
    db.chatMembers.push({ conversationId: id, userId: u.id, username: u.username, nickname: u.nickname, avatar: u.avatar, role: 'owner', status: 1, muteUntil: null, joinedAt: now() })
    if (target) db.chatMembers.push({ conversationId: id, userId: targetId, username: target.username, nickname: target.nickname, avatar: target.avatar, role: 'member', status: 1, muteUntil: null, joinedAt: now() })
    return ok(cp(conv))
  }

  // ==================== 消息列表 ====================
  if (m === 'GET' && match(/^\/api\/user\/chat\/conversations\/(\d+)\/messages$/)) {
    const convId = num(match(/^\/api\/user\/chat\/conversations\/(\d+)\/messages$/)![1])
    let rs = db.chatMessages.filter((i: any) => i.conversationId === convId).sort((a: any, b: any) => a.id - b.id)
    if (req.query.beforeMessageId) rs = rs.filter((i: any) => i.id < num(req.query.beforeMessageId))
    return ok(page(rs.map((msg: any) => ({
      ...msg,
      self: msg.senderId === u.id,
    })), req.query))
  }

  // ==================== 发送文本消息 ====================
  if (m === 'POST' && path === '/api/user/chat/messages/text') {
    let convId = num(req.body.conversationId)
    const targetId = num(req.body.targetUserId)
    if (!convId && targetId) {
      const exist = db.chatConversations.find((i: any) =>
        i.conversationType === 'single' &&
        db.chatMembers.some((m1: any) => m1.conversationId === i.id && m1.userId === u.id) &&
        db.chatMembers.some((m2: any) => m2.conversationId === i.id && m2.userId === targetId)
      )
      if (exist) {
        convId = exist.id
      } else {
        convId = ++db.seq.conversation
        const target = db.users.find((i: any) => i.id === targetId)
        const conv: any = {
          id: convId,
          conversationType: 'single',
          sceneType: 'single_chat',
          name: null,
          avatar: null,
          ownerId: null,
          notice: null,
          status: 0,
          targetUserId: targetId,
          targetUsername: target?.username ?? '',
          targetNickname: target?.nickname ?? '',
          createdAt: now(),
          updatedAt: now(),
        }
        db.chatConversations.push(conv)
        db.chatMembers.push({ conversationId: convId, userId: u.id, username: u.username, nickname: u.nickname, avatar: u.avatar, role: 'owner', status: 1, muteUntil: null, joinedAt: now() })
        if (target) db.chatMembers.push({ conversationId: convId, userId: targetId, username: target.username, nickname: target.nickname, avatar: target.avatar, role: 'member', status: 1, muteUntil: null, joinedAt: now() })
      }
    }
    const id = ++db.seq.message
    const msg = {
      id,
      conversationId: convId,
      senderId: u.id,
      senderUsername: u.username,
      senderNickname: u.nickname,
      senderAvatar: u.avatar,
      messageType: 'text',
      content: req.body.content,
      file: null,
      replyMessageId: req.body.replyMessageId ?? null,
      reply: null,
      clientMessageId: req.body.clientMessageId ?? `msg_${id}`,
      self: true,
      deliveryStatus: 0,
      readByCurrentUser: true,
      readAt: now(),
      revoked: false,
      edited: false,
      createdAt: now(),
      updatedAt: now(),
    }
    db.chatMessages.push(msg)
    return ok(cp(msg))
  }

  // ==================== 发送文件消息 ====================
  if (m === 'POST' && path === '/api/user/chat/messages/file') {
    let convId = num(req.body.conversationId)
    const targetId = num(req.body.targetUserId)
    if (!convId && targetId) {
      const exist = db.chatConversations.find((i: any) =>
        i.conversationType === 'single' &&
        db.chatMembers.some((m1: any) => m1.conversationId === i.id && m1.userId === u.id) &&
        db.chatMembers.some((m2: any) => m2.conversationId === i.id && m2.userId === targetId)
      )
      if (exist) {
        convId = exist.id
      } else {
        convId = ++db.seq.conversation
        const target = db.users.find((i: any) => i.id === targetId)
        db.chatConversations.push({
          id: convId,
          conversationType: 'single',
          sceneType: 'single_chat',
          name: null,
          avatar: null,
          ownerId: null,
          notice: null,
          status: 0,
          targetUserId: targetId,
          targetUsername: target?.username ?? '',
          targetNickname: target?.nickname ?? '',
          createdAt: now(),
          updatedAt: now(),
        })
        db.chatMembers.push({ conversationId: convId, userId: u.id, username: u.username, nickname: u.nickname, avatar: u.avatar, role: 'owner', status: 1, muteUntil: null, joinedAt: now() })
        if (target) db.chatMembers.push({ conversationId: convId, userId: targetId, username: target.username, nickname: target.nickname, avatar: target.avatar, role: 'member', status: 1, muteUntil: null, joinedAt: now() })
      }
    }
    const id = ++db.seq.message
    const msg = {
      id,
      conversationId: convId,
      senderId: u.id,
      senderUsername: u.username,
      senderNickname: u.nickname,
      senderAvatar: u.avatar,
      messageType: 'file',
      content: null,
      file: {
        businessId: req.body.businessId,
        fileId: req.body.businessId,
        fileName: `file_${req.body.businessId}`,
        originalName: `file_${req.body.businessId}`,
        fileUrl: `https://mock.local/files/${req.body.businessId}`,
        fileSize: 0,
        fileType: 'file',
        mimeType: 'application/octet-stream',
        previewUrl: null,
        thumbnailUrl: null,
        width: null,
        height: null,
        durationSeconds: null,
        waveform: null,
        transcodeStatus: 'ready',
      },
      replyMessageId: null,
      reply: null,
      clientMessageId: `msg_${id}`,
      self: true,
      deliveryStatus: 0,
      readByCurrentUser: true,
      readAt: now(),
      revoked: false,
      edited: false,
      createdAt: now(),
      updatedAt: now(),
    }
    db.chatMessages.push(msg)
    return ok(cp(msg))
  }

  // ==================== 编辑消息 ====================
  if (match(/^\/api\/user\/chat\/messages\/(\d+)$/) && m === 'PUT') {
    const msgId = num(match(/^\/api\/user\/chat\/messages\/(\d+)$/)![1])
    const msg = db.chatMessages.find((i: any) => i.id === msgId)
    if (msg && msg.senderId === u.id) {
      msg.content = req.body.content ?? msg.content
      msg.edited = true
      msg.updatedAt = now()
    }
    return ok(cp(msg))
  }

  // ==================== 撤回消息 ====================
  if (match(/^\/api\/user\/chat\/messages\/(\d+)\/revoke$/) && m === 'POST') {
    const msgId = num(match(/^\/api\/user\/chat\/messages\/(\d+)\/revoke$/)![1])
    const msg = db.chatMessages.find((i: any) => i.id === msgId)
    if (msg && msg.senderId === u.id) {
      msg.revoked = true
      msg.revokeStatus = 1
      msg.revokedAt = now()
    }
    return ok(null)
  }

  // ==================== 删除消息 ====================
  if (match(/^\/api\/user\/chat\/messages\/(\d+)$/) && m === 'DELETE') {
    const msgId = num(match(/^\/api\/user\/chat\/messages\/(\d+)$/)![1])
    db.chatMessages = db.chatMessages.filter((i: any) => i.id !== msgId)
    return ok(null)
  }

  // ==================== 已读进度 ====================
  if (match(/^\/api\/user\/chat\/conversations\/(\d+)\/read$/) && m === 'POST') {
    const convId = num(match(/^\/api\/user\/chat\/conversations\/(\d+)\/read$/)![1])
    const conv = db.chatConversations.find((i: any) => i.id === convId)
    if (conv) {
      conv.lastReadMessageId = num(req.body.readMessageId)
      conv.lastReadAt = now()
    }
    return ok({
      conversationId: convId,
      userId: u.id,
      readMessageId: num(req.body.readMessageId),
      readAt: now(),
      deliveredMessageId: conv?.lastDeliveredMessageId ?? null,
      deliveredAt: conv?.lastDeliveredAt ?? null,
      unreadCount: 0,
    })
  }

  // ==================== 创建群聊 ====================
  if (m === 'POST' && path === '/api/user/chat/groups') {
    const id = ++db.seq.conversation
    const conv: any = {
      id,
      conversationType: 'group',
      sceneType: 'group_chat',
      name: req.body.name ?? '新群聊',
      avatar: req.body.avatar ?? null,
      ownerId: u.id,
      notice: req.body.announcement ?? null,
      allSite: false,
      status: 0,
      visibilityScope: req.body.visibilityScope ?? 'private',
      allowGuestView: req.body.allowGuestView ?? 0,
      requireJoinToSpeak: req.body.requireJoinToSpeak ?? 0,
      joinRule: req.body.joinRule ?? 'free',
      speakLevelLimit: req.body.speakLevelLimit ?? 1,
      memberLimit: req.body.memberLimit ?? 200,
      slowModeSeconds: 0,
      displaySort: 1,
      channelCategoryCode: req.body.categoryCode ?? null,
      selfRole: 'owner',
      memberCount: (req.body.memberUserIds?.length ?? 0) + 1,
      unreadCount: 0,
      createdAt: now(),
      updatedAt: now(),
    }
    db.chatConversations.push(conv)
    db.chatMembers.push({ conversationId: id, userId: u.id, username: u.username, nickname: u.nickname, avatar: u.avatar, role: 'owner', status: 1, muteUntil: null, joinedAt: now() })
    const userIds: number[] = req.body.memberUserIds ?? []
    for (const uid of userIds) {
      const user = db.users.find((i: any) => i.id === uid)
      if (user) db.chatMembers.push({ conversationId: id, userId: uid, username: user.username, nickname: user.nickname, avatar: user.avatar, role: 'member', status: 1, muteUntil: null, joinedAt: now() })
    }
    return ok(cp(conv))
  }

  // ==================== 群聊详情 ====================
  if (m === 'GET' && match(/^\/api\/user\/chat\/groups\/(\d+)$/)) {
    const conv = db.chatConversations.find((i: any) => i.id === num(match(/^\/api\/user\/chat\/groups\/(\d+)$/)![1]))
    return conv ? ok(cp(conv)) : ok(null, '群聊不存在', 404)
  }

  // ==================== 群成员列表 ====================
  if (m === 'GET' && match(/^\/api\/user\/chat\/groups\/(\d+)\/members$/)) {
    const convId = num(match(/^\/api\/user\/chat\/groups\/(\d+)\/members$/)![1])
    return ok(db.chatMembers.filter((i: any) => i.conversationId === convId))
  }

  // ==================== 邀请群成员 ====================
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

  // ==================== 设置群管理员 ====================
  if (match(/^\/api\/user\/chat\/groups\/(\d+)\/admins\/(\d+)$/) && m === 'PUT') {
    const convId = num(match(/^\/api\/user\/chat\/groups\/(\d+)\/admins\/(\d+)$/)![1])
    const userId = num(match(/^\/api\/user\/chat\/groups\/(\d+)\/admins\/(\d+)$/)![2])
    const member = db.chatMembers.find((i: any) => i.conversationId === convId && i.userId === userId)
    if (member) member.role = 'admin'
    return ok(db.chatMembers.filter((i: any) => i.conversationId === convId))
  }

  // ==================== 取消群管理员 ====================
  if (match(/^\/api\/user\/chat\/groups\/(\d+)\/admins\/(\d+)$/) && m === 'DELETE') {
    const convId = num(match(/^\/api\/user\/chat\/groups\/(\d+)\/admins\/(\d+)$/)![1])
    const userId = num(match(/^\/api\/user\/chat\/groups\/(\d+)\/admins\/(\d+)$/)![2])
    const member = db.chatMembers.find((i: any) => i.conversationId === convId && i.userId === userId)
    if (member) member.role = 'member'
    return ok(db.chatMembers.filter((i: any) => i.conversationId === convId))
  }

  // ==================== 转让群主 ====================
  if (match(/^\/api\/user\/chat\/groups\/(\d+)\/owner$/) && m === 'PUT') {
    const convId = num(match(/^\/api\/user\/chat\/groups\/(\d+)\/owner$/)![1])
    const conv = db.chatConversations.find((i: any) => i.id === convId)
    const targetId = num(req.body.targetUserId)
    if (conv) {
      conv.ownerId = targetId
      conv.updatedAt = now()
    }
    return ok({ id: convId, conversationType: 'group', name: conv?.name, ownerId: targetId, selfRole: 'member', updatedAt: now() })
  }

  // ==================== 禁言群成员 ====================
  if (match(/^\/api\/user\/chat\/groups\/(\d+)\/members\/(\d+)\/mute$/) && m === 'PUT') {
    const convId = num(match(/^\/api\/user\/chat\/groups\/(\d+)\/members\/(\d+)\/mute$/)![1])
    const userId = num(match(/^\/api\/user\/chat\/groups\/(\d+)\/members\/(\d+)\/mute$/)![2])
    const member = db.chatMembers.find((i: any) => i.conversationId === convId && i.userId === userId)
    if (member) member.muteUntil = req.body.muteUntil ?? null
    return ok(db.chatMembers.filter((i: any) => i.conversationId === convId))
  }

  // ==================== 更新群公告 ====================
  if (match(/^\/api\/user\/chat\/groups\/(\d+)\/notice$/) && m === 'PUT') {
    const convId = num(match(/^\/api\/user\/chat\/groups\/(\d+)\/notice$/)![1])
    const conv = db.chatConversations.find((i: any) => i.id === convId)
    if (conv) {
      conv.notice = req.body.notice ?? conv.notice
      conv.updatedAt = now()
    }
    return ok({ id: convId, conversationType: 'group', name: conv?.name, notice: conv?.notice, updatedAt: now() })
  }

  // ==================== 移除群成员 ====================
  if (match(/^\/api\/user\/chat\/groups\/(\d+)\/members\/(\d+)$/) && m === 'DELETE') {
    const convId = num(match(/^\/api\/user\/chat\/groups\/(\d+)\/members\/(\d+)$/)![1])
    const userId = num(match(/^\/api\/user\/chat\/groups\/(\d+)\/members\/(\d+)$/)![2])
    db.chatMembers = db.chatMembers.filter((i: any) => !(i.conversationId === convId && i.userId === userId))
    return ok(null)
  }

  // ==================== 退出群聊 ====================
  if (match(/^\/api\/user\/chat\/groups\/(\d+)\/leave$/) && m === 'POST') {
    const convId = num(match(/^\/api\/user\/chat\/groups\/(\d+)\/leave$/)![1])
    db.chatMembers = db.chatMembers.filter((i: any) => !(i.conversationId === convId && i.userId === u.id))
    return ok(null)
  }

  // ==================== 解散群聊 ====================
  if (match(/^\/api\/user\/chat\/groups\/(\d+)$/) && m === 'DELETE') {
    const id = num(match(/^\/api\/user\/chat\/groups\/(\d+)$/)![1])
    db.chatConversations = db.chatConversations.filter((i: any) => i.id !== id)
    db.chatMembers = db.chatMembers.filter((i: any) => i.conversationId !== id)
    db.chatMessages = db.chatMessages.filter((i: any) => i.conversationId !== id)
    return ok(null)
  }

  // ==================== 搜索公开群 ====================
  if (m === 'GET' && path === '/api/user/chat/groups/search') {
    let rs = db.chatConversations.filter((i: any) => i.conversationType === 'group' && i.visibilityScope === 'public')
    if (req.query.keyword) {
      const kw = String(req.query.keyword).toLowerCase()
      rs = rs.filter((c: any) => String(c.name || '').toLowerCase().includes(kw))
    }
    if (req.query.categoryCode) {
      rs = rs.filter((c: any) => c.channelCategoryCode === req.query.categoryCode)
    }
    return ok(page(rs.map((c: any) => ({
      ...cp(c),
      description: c.notice,
      joined: db.chatMembers.some((m: any) => m.conversationId === c.id && m.userId === u.id),
    })), req.query))
  }

  // ==================== 加入会话 ====================
  if (match(/^\/api\/user\/chat\/conversations\/(\d+)\/join$/) && m === 'POST') {
    const convId = num(match(/^\/api\/user\/chat\/conversations\/(\d+)\/join$/)![1])
    if (!db.chatMembers.some((i: any) => i.conversationId === convId && i.userId === u.id)) {
      db.chatMembers.push({ conversationId: convId, userId: u.id, username: u.username, nickname: u.nickname, avatar: u.avatar, role: 'member', status: 1, muteUntil: null, joinedAt: now() })
    }
    const conv = db.chatConversations.find((i: any) => i.id === convId)
    return ok(cp(conv))
  }

  // ==================== 离开会话 ====================
  if (match(/^\/api\/user\/chat\/conversations\/(\d+)\/leave$/) && m === 'POST') {
    const convId = num(match(/^\/api\/user\/chat\/conversations\/(\d+)\/leave$/)![1])
    db.chatMembers = db.chatMembers.filter((i: any) => !(i.conversationId === convId && i.userId === u.id))
    return ok(null)
  }

  // ==================== 频道创建申请 ====================
  if (m === 'POST' && path === '/api/user/chat/channel-applications') return ok(null)
  if (m === 'GET' && path === '/api/user/chat/channel-applications/latest') return ok(null)
  if (m === 'GET' && path === '/api/user/chat/channel-applications') return ok(page([], req.query))

  // ==================== 论坛链接 ====================
  if (m === 'POST' && path === '/api/user/chat/forum-links') return ok(null)
  if (m === 'GET' && match(/^\/api\/user\/chat\/forum-links\/posts\/(\d+)$/)) return ok(null)
  if (m === 'GET' && match(/^\/api\/user\/chat\/forum-links\/channels\/(\d+)$/)) return ok(page([], req.query))
  if (m === 'DELETE' && match(/^\/api\/user\/chat\/forum-links\/posts\/(\d+)$/)) return ok(null)

  // ==================== 群加入申请 ====================
  if (m === 'POST' && match(/^\/api\/user\/chat\/groups\/(\d+)\/join-applications$/)) return ok(null)
  if (m === 'GET' && path === '/api/user/chat/group-join-applications') return ok(page([], req.query))
  if (m === 'GET' && match(/^\/api\/user\/chat\/groups\/(\d+)\/join-applications$/)) return ok(page([], req.query))
  if (m === 'PUT' && match(/^\/api\/user\/chat\/groups\/(\d+)\/join-applications\/(\d+)\/review$/)) return ok(null)

  // ==================== 邀请链接 ====================
  if (m === 'POST' && match(/^\/api\/user\/chat\/groups\/(\d+)\/invite-links$/)) return ok({ inviteToken: `mock-token-${Date.now()}`, expireTime: null })
  if (m === 'GET' && match(/^\/api\/user\/chat\/groups\/(\d+)\/invite-links$/)) return ok([])
  if (m === 'PUT' && match(/^\/api\/user\/chat\/groups\/(\d+)\/invite-links\/(\d+)\/disable$/)) return ok(null)
  if (m === 'POST' && match(/^\/api\/user\/chat\/group-invite-links\/([^/]+)\/join$/)) return ok(null)

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
