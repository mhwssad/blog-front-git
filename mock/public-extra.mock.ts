import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, has, num, ok, page } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const match = (r: RegExp) => path.match(r)

  // ==================== 公开系列 ====================

  if (m === 'GET' && match(/^\/api\/public\/authors\/(\d+)\/series$/)) {
    const authorId = num(match(/^\/api\/public\/authors\/(\d+)\/series$/)![1])
    const rs = (db.articles || [])
      .filter((a: any) => a.authorId === authorId && a.seriesId)
      .reduce((acc: any[], a: any) => {
        if (!acc.find((s: any) => s.id === a.seriesId)) {
          acc.push({ id: a.seriesId, title: a.seriesName ?? '未命名系列', articleCount: 1 })
        } else {
          const s = acc.find((s: any) => s.id === a.seriesId)
          s.articleCount++
        }
        return acc
      }, [])
    return ok(rs)
  }

  if (m === 'GET' && match(/^\/api\/public\/article-series\/(\d+)$/)) {
    return ok({
      id: 1,
      title: '示例系列',
      description: '这是一个示例文章系列',
      articles: db.articles.filter((a: any) => a.seriesId === 1).map((a: any) => ({
        id: a.id,
        title: a.title,
        publishTime: a.publishTime,
      })),
    })
  }

  // ==================== 公开聊天 ====================

  if (m === 'GET' && path === '/api/public/chat/lobby/messages') {
    let rs = (db.chatMessages || []).filter((i: any) => i.conversationType === 'lobby')
    return ok(page(rs.map((msg: any) => ({
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.senderNickname,
      senderAvatar: msg.senderAvatar,
      messageType: msg.messageType,
      content: msg.content,
      createdAt: msg.createdAt,
    })), req.query))
  }

  if (m === 'GET' && path === '/api/public/chat/channels') {
    let rs = (db.chatConversations || []).filter((i: any) => i.sceneType === 'hall_channel' && i.status === 0)
    if (req.query.categoryCode) rs = rs.filter((i: any) => has(i.channelCategoryCode, req.query.categoryCode))
    return ok(page(rs.map((c: any) => ({
      id: c.id,
      conversationType: c.conversationType,
      sceneType: c.sceneType,
      name: c.name,
      avatar: c.avatar,
      status: c.status,
      visibilityScope: c.visibilityScope,
      memberCount: c.memberCount,
      createdAt: c.createdAt,
    })), req.query))
  }

  if (m === 'GET' && match(/^\/api\/public\/chat\/channels\/(\d+)$/)) {
    const x = (db.chatConversations || []).find(
      (i: any) => i.id === num(match(/^\/api\/public\/chat\/channels\/(\d+)$/)![1]),
    )
    return x ? ok(cp(x)) : ok(null, '频道不存在', 404)
  }

  // ==================== 公开文件 ====================

  if (m === 'GET' && match(/^\/api\/public\/files\/(\d+)$/)) {
    const x = (db.files || []).find((i: any) => i.id === num(match(/^\/api\/public\/files\/(\d+)$/)![1]))
    return x ? ok(cp(x)) : ok(null, '文件不存在', 404)
  }

  // ==================== 友情链接（公开） ====================

  if (m === 'GET' && path === '/api/public/friend-links') {
    const rs = (db.friendLinks || []).filter((i: any) => i.status === 1)
    return ok(rs)
  }

  // ==================== 公开关注信息 ====================

  if (m === 'GET' && match(/^\/api\/users\/(\d+)\/follows$/)) {
    const userId = num(match(/^\/api\/users\/(\d+)\/follows$/)![1])
    const rs = (db.follows || []).filter((i: any) => i.followerId === userId)
    return ok(page(rs, req.query))
  }

  if (m === 'GET' && match(/^\/api\/users\/(\d+)\/fans$/)) {
    const userId = num(match(/^\/api\/users\/(\d+)\/fans$/)![1])
    const rs = (db.follows || []).filter((i: any) => i.followingId === userId)
    return ok(page(rs, req.query))
  }

  if (m === 'GET' && match(/^\/api\/users\/(\d+)\/author-profile$/)) {
    const userId = num(match(/^\/api\/users\/(\d+)\/author-profile$/)![1])
    const user = db.users.find((u: any) => u.id === userId)
    if (!user) return ok(null, '用户不存在', 404)
    const articleCount = db.articles.filter((a: any) => a.authorId === userId && a.status === 1).length
    const likeCount = db.articles.filter((a: any) => a.authorId === userId && a.status === 1).reduce((sum: number, a: any) => sum + (a.likeCount ?? 0), 0)
    return ok({ userId: user.id, nickname: user.nickname, avatar: user.avatar, bio: user.bio ?? '', articleCount, likeCount })
  }

  return ok(null, '未匹配到公开扩展接口', 404)
}

export default defineMock([
  { url: '/api/public/authors/:authorId/series', method: 'GET', body: handle },
  { url: '/api/public/article-series/:id', method: 'GET', body: handle },
  { url: '/api/public/chat/lobby/messages', method: 'GET', body: handle },
  { url: '/api/public/chat/channels', method: 'GET', body: handle },
  { url: '/api/public/chat/channels/:conversationId', method: 'GET', body: handle },
  { url: '/api/public/files/:fileId', method: 'GET', body: handle },
  { url: '/api/public/friend-links', method: 'GET', body: handle },
  { url: '/api/users/:userId/follows', method: 'GET', body: handle },
  { url: '/api/users/:userId/fans', method: 'GET', body: handle },
  { url: '/api/users/:userId/author-profile', method: 'GET', body: handle },
])
