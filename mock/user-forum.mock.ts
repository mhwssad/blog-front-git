import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, me, now, num, ok, page, toForumPostVO, toForumPostDetailVO, toForumReplyVO } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const match = (r: RegExp) => path.match(r)
  const u = me(req)

  // ==================== 帖子 ====================

  if (m === 'GET' && path === '/api/user/forum/posts') {
    let rs = (db.forumPosts || []).filter((i: any) => !i.isHidden)
    if (req.query.sectionId) rs = rs.filter((i: any) => i.sectionId === num(req.query.sectionId))
    if (u) rs = req.query.myOnly ? rs.filter((i: any) => i.userId === u.id) : rs
    return ok(page(rs.map(toForumPostVO), req.query))
  }

  if (m === 'POST' && path === '/api/user/forum/posts') {
    const post = {
      id: ++db.seq.forumPost,
      sectionId: req.body.sectionId,
      userId: u?.id ?? 1,
      username: u?.username ?? '',
      nickname: u?.nickname ?? '',
      avatar: u?.avatar ?? null,
      title: req.body.title,
      content: req.body.content,
      isTop: 0,
      isEssence: 0,
      isHidden: 0,
      viewCount: 0,
      likeCount: 0,
      replyCount: 0,
      lastReplyAt: null,
      createTime: now(),
      updateTime: now(),
    }
    if (!db.forumPosts) db.forumPosts = []
    db.forumPosts.push(post)
    return ok(cp(post))
  }

  if (m === 'GET' && match(/^\/api\/user\/forum\/posts\/(\d+)$/)) {
    const x = (db.forumPosts || []).find((i: any) => i.id === num(match(/^\/api\/user\/forum\/posts\/(\d+)$/)![1]))
    return x ? ok(toForumPostDetailVO(cp(x))) : ok(null, '帖子不存在', 404)
  }

  if (m === 'PUT' && match(/^\/api\/user\/forum\/posts\/(\d+)$/)) {
    const x = (db.forumPosts || []).find((i: any) => i.id === num(match(/^\/api\/user\/forum\/posts\/(\d+)$/)![1]))
    if (x) {
      x.title = req.body.title ?? x.title
      x.content = req.body.content ?? x.content
      x.sectionId = req.body.sectionId ?? x.sectionId
      x.updateTime = now()
    }
    return ok(null)
  }

  if (m === 'DELETE' && match(/^\/api\/user\/forum\/posts\/(\d+)$/)) {
    const id = num(match(/^\/api\/user\/forum\/posts\/(\d+)$/)![1])
    db.forumPosts = (db.forumPosts || []).filter((i: any) => i.id !== id)
    return ok(null)
  }

  // ==================== 回复 ====================

  if (m === 'POST' && match(/^\/api\/user\/forum\/posts\/(\d+)\/replies$/)) {
    const postId = num(match(/^\/api\/user\/forum\/posts\/(\d+)\/replies$/)![1])
    const reply = {
      id: ++db.seq.forumReply,
      postId,
      userId: u?.id ?? 1,
      username: u?.username ?? '',
      nickname: u?.nickname ?? '',
      avatar: u?.avatar ?? null,
      content: req.body.content,
      isHidden: 0,
      likeCount: 0,
      createTime: now(),
      updateTime: now(),
    }
    if (!db.forumReplies) db.forumReplies = []
    db.forumReplies.push(reply)
    const post = (db.forumPosts || []).find((i: any) => i.id === postId)
    if (post) {
      post.replyCount = (post.replyCount || 0) + 1
      post.lastReplyAt = now()
    }
    return ok(cp(reply))
  }

  if (m === 'PUT' && match(/^\/api\/user\/forum\/replies\/(\d+)$/)) {
    const x = (db.forumReplies || []).find((i: any) => i.id === num(match(/^\/api\/user\/forum\/replies\/(\d+)$/)![1]))
    if (x) {
      x.content = req.body.content ?? x.content
      x.updateTime = now()
    }
    return ok(null)
  }

  if (m === 'DELETE' && match(/^\/api\/user\/forum\/replies\/(\d+)$/)) {
    const id = num(match(/^\/api\/user\/forum\/replies\/(\d+)$/)![1])
    db.forumReplies = (db.forumReplies || []).filter((i: any) => i.id !== id)
    return ok(null)
  }

  // ==================== 互动 ====================

  if (m === 'POST' && match(/^\/api\/user\/forum\/posts\/(\d+)\/likes$/)) {
    const postId = num(match(/^\/api\/user\/forum\/posts\/(\d+)\/likes$/)![1])
    const post = (db.forumPosts || []).find((i: any) => i.id === postId)
    if (post) post.likeCount = (post.likeCount || 0) + 1
    return ok(null)
  }

  if (m === 'DELETE' && match(/^\/api\/user\/forum\/posts\/(\d+)\/likes$/)) {
    const postId = num(match(/^\/api\/user\/forum\/posts\/(\d+)\/likes$/)![1])
    const post = (db.forumPosts || []).find((i: any) => i.id === postId)
    if (post && post.likeCount > 0) post.likeCount--
    return ok(null)
  }

  if (m === 'POST' && match(/^\/api\/user\/forum\/posts\/(\d+)\/collections$/)) {
    return ok(null)
  }

  if (m === 'DELETE' && match(/^\/api\/user\/forum\/posts\/(\d+)\/collections$/)) {
    return ok(null)
  }

  if (m === 'POST' && match(/^\/api\/user\/forum\/posts\/(\d+)\/channel-share$/)) {
    return ok(null)
  }

  return ok(null, '未匹配到用户论坛接口', 404)
}

export default defineMock([
  { url: '/api/user/forum/posts', method: ['GET', 'POST'], body: handle },
  { url: '/api/user/forum/posts/:id', method: ['GET', 'PUT', 'DELETE'], body: handle },
  { url: '/api/user/forum/posts/:postId/replies', method: 'POST', body: handle },
  { url: '/api/user/forum/replies/:replyId', method: ['PUT', 'DELETE'], body: handle },
  { url: '/api/user/forum/posts/:postId/likes', method: ['POST', 'DELETE'], body: handle },
  { url: '/api/user/forum/posts/:postId/collections', method: ['POST', 'DELETE'], body: handle },
  { url: '/api/user/forum/posts/:postId/channel-share', method: 'POST', body: handle },
])
