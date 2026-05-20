import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, me, now, num, ok, page } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const u = me(req)
  const match = (r: RegExp) => path.match(r)

  // ==================== 收藏夹 ====================

  if (m === 'GET' && path === '/api/user/collection-folders') {
    return ok(page(db.folders.filter((i: any) => i.userId === u.id), req.query))
  }

  if (m === 'POST' && path === '/api/user/collection-folders') {
    const folder = { id: ++db.seq.folder, userId: u.id, folderName: req.body.folderName ?? '新收藏夹', folderType: req.body.folderType ?? 'article', description: req.body.description ?? null, isPublic: req.body.isPublic ?? 0, isDefault: 0, sortOrder: 10, collectionCount: 0, createdAt: now(), updatedAt: now() }
    db.folders.push(folder)
    return ok(null)
  }

  const folderMatch = path.match(/^\/api\/user\/collection-folders\/(\d+)$/)
  if (m === 'PUT' && folderMatch) {
    const f = db.folders.find((i: any) => i.id === num(folderMatch[1]) && i.userId === u.id)
    if (f) Object.assign(f, req.body, { updatedAt: now() })
    return ok(null)
  }
  if (m === 'DELETE' && folderMatch) {
    db.folders = db.folders.filter((i: any) => !(i.id === num(folderMatch[1]) && i.userId === u.id))
    return ok(null)
  }

  // ==================== 收藏 ====================

  if (m === 'GET' && path === '/api/user/collections') {
    return ok(page(db.collections.filter((i: any) => i.userId === u.id), req.query))
  }

  if (m === 'POST' && path === '/api/user/collections') {
    const c = { id: ++db.seq.collection, userId: u.id, folderId: req.body.folderId ?? 1, targetId: req.body.targetId, targetType: req.body.targetType, remark: req.body.remark ?? null, targetTitle: req.body.targetTitle ?? '', targetUrl: req.body.targetUrl ?? '', createdAt: now() }
    db.collections.push(c)
    return ok(null)
  }

  const collectionMatch = path.match(/^\/api\/user\/collections\/(\d+)$/)
  if (m === 'DELETE' && collectionMatch) {
    db.collections = db.collections.filter((i: any) => !(i.id === num(collectionMatch[1]) && i.userId === u.id))
    return ok(null)
  }

  // ==================== 文章点赞 ====================

  const articleLikeMatch = path.match(/^\/api\/user\/articles\/(\d+)\/likes$/)
  if (m === 'POST' && articleLikeMatch) {
    const articleId = num(articleLikeMatch[1])
    if (!db.interactions.some((i: any) => i.targetType === 'article' && i.targetId === articleId && i.actionType === 'like' && i.userId === u.id)) {
      db.interactions.push({ id: ++db.seq.interaction, userId: u.id, targetId: articleId, targetType: 'article', actionType: 'like', createdAt: now() })
    }
    const a = db.articles.find((i: any) => i.id === articleId)
    if (a) a.likeCount = (a.likeCount ?? 0) + 1
    return ok(null)
  }
  if (m === 'DELETE' && articleLikeMatch) {
    const articleId = num(articleLikeMatch[1])
    db.interactions = db.interactions.filter((i: any) => !(i.targetType === 'article' && i.targetId === articleId && i.actionType === 'like' && i.userId === u.id))
    const a = db.articles.find((i: any) => i.id === articleId)
    if (a && a.likeCount > 0) a.likeCount--
    return ok(null)
  }

  // ==================== 评论点赞/发表/删除 ====================

  const commentLikeMatch = path.match(/^\/api\/user\/comments\/(\d+)\/likes$/)
  if (m === 'POST' && commentLikeMatch) {
    const commentId = num(commentLikeMatch[1])
    if (!db.interactions.some((i: any) => i.targetType === 'comment' && i.targetId === commentId && i.actionType === 'like' && i.userId === u.id)) {
      db.interactions.push({ id: ++db.seq.interaction, userId: u.id, targetId: commentId, targetType: 'comment', actionType: 'like', createdAt: now() })
    }
    return ok(null)
  }
  if (m === 'DELETE' && commentLikeMatch) {
    const commentId = num(commentLikeMatch[1])
    db.interactions = db.interactions.filter((i: any) => !(i.targetType === 'comment' && i.targetId === commentId && i.actionType === 'like' && i.userId === u.id))
    return ok(null)
  }

  if (m === 'POST' && path === '/api/user/comments') {
    const c = { id: ++db.seq.comment, targetId: req.body.targetId, targetType: req.body.targetType, content: req.body.content, images: req.body.images ?? [], userId: u.id, userNickname: u.nickname, userAvatar: u.avatar, rootId: req.body.rootId ?? 0, parentId: req.body.parentId ?? 0, likeCount: 0, replyCount: 0, status: 1, createdAt: now(), liked: false, children: [] }
    db.comments.push(c)
    return ok(null)
  }

  const commentMatch = path.match(/^\/api\/user\/comments\/(\d+)$/)
  if (m === 'DELETE' && commentMatch) {
    db.comments = db.comments.filter((i: any) => i.id !== num(commentMatch[1]))
    return ok(null)
  }

  // ==================== 用户文章 ====================

  if (m === 'GET' && path === '/api/user/articles') {
    const rs = db.articles.filter((i: any) => i.authorId === u.id)
    return ok(page(rs, req.query))
  }

  const userArticleMatch = path.match(/^\/api\/user\/articles\/(\d+)$/)
  if (m === 'GET' && userArticleMatch) {
    const a = db.articles.find((i: any) => i.id === num(userArticleMatch[1]) && i.authorId === u.id)
    return a ? ok(cp(a)) : ok(null, '文章不存在', 404)
  }

  const articleAccessMatch = path.match(/^\/api\/user\/articles\/(\d+)\/access$/)
  if (m === 'PUT' && articleAccessMatch) {
    const a = db.articles.find((i: any) => i.id === num(articleAccessMatch[1]))
    if (a) a.accessList = cp(req.body.accessList ?? [])
    return ok(null)
  }

  const submitReviewMatch = path.match(/^\/api\/user\/articles\/(\d+)\/submit-review$/)
  if (m === 'POST' && submitReviewMatch) {
    const a = db.articles.find((i: any) => i.id === num(submitReviewMatch[1]))
    if (a) a.reviewStatus = 0
    return ok(null)
  }

  const reviewLogMatch = path.match(/^\/api\/user\/articles\/(\d+)\/review-log$/)
  if (m === 'GET' && reviewLogMatch) return ok([])

  // ==================== 用户系列 ====================

  if (m === 'GET' && path === '/api/user/article-series') return ok(page([], req.query))
  if (m === 'POST' && path === '/api/user/article-series') return ok(null)
  const seriesMatch = path.match(/^\/api\/user\/article-series\/(\d+)$/)
  if (seriesMatch && m === 'GET') return ok(null)
  if (seriesMatch && m === 'PUT') return ok(null)
  if (seriesMatch && m === 'DELETE') return ok(null)
  const seriesArticlesMatch = path.match(/^\/api\/user\/article-series\/(\d+)\/articles$/)
  if (seriesArticlesMatch && m === 'POST') return ok(null)
  const seriesArticleRemoveMatch = path.match(/^\/api\/user\/article-series\/(\d+)\/articles\/(\d+)$/)
  if (seriesArticleRemoveMatch && m === 'DELETE') return ok(null)
  const seriesSortMatch = path.match(/^\/api\/user\/article-series\/(\d+)\/articles\/sort$/)
  if (seriesSortMatch && m === 'PUT') return ok(null)

  // ==================== 足迹 ====================

  if (m === 'GET' && path === '/api/user/footprints') {
    let rs = db.footprints.filter((i: any) => i.userId === u.id)
    if (req.query.targetType) rs = rs.filter((i: any) => i.targetType === req.query.targetType)
    if (req.query.keyword) {
      const kw = String(req.query.keyword).toLowerCase()
      rs = rs.filter((i: any) => String(i.targetTitle ?? '').toLowerCase().includes(kw))
    }
    if (req.query.visitedAtStart) rs = rs.filter((i: any) => i.visitedAt >= req.query.visitedAtStart)
    if (req.query.visitedAtEnd) rs = rs.filter((i: any) => i.visitedAt <= req.query.visitedAtEnd)
    rs.sort((a: any, b: any) => String(b.visitedAt).localeCompare(String(a.visitedAt)))
    const paged = page(rs.map(({ userId, ipAddress, userAgent, ...fp }: any) => fp), req.query)
    return ok(paged)
  }

  const footprintMatch = path.match(/^\/api\/user\/footprints\/(\d+)$/)
  if (m === 'DELETE' && footprintMatch) {
    db.footprints = db.footprints.filter((i: any) => !(i.id === num(footprintMatch[1]) && i.userId === u.id))
    return ok(null)
  }

  if (m === 'DELETE' && path === '/api/user/footprints') {
    db.footprints = db.footprints.filter((i: any) => i.userId !== u.id)
    return ok(null)
  }

  return ok(null, '未匹配到用户内容接口', 404)
}

export default defineMock([
  { url: '/api/user/collection-folders', method: ['GET', 'POST'], body: handle },
  { url: '/api/user/collection-folders/:id', method: ['PUT', 'DELETE'], body: handle },
  { url: '/api/user/collections', method: ['GET', 'POST'], body: handle },
  { url: '/api/user/collections/:id', method: 'DELETE', body: handle },
  { url: '/api/user/articles/:id/likes', method: ['POST', 'DELETE'], body: handle },
  { url: '/api/user/comments/:id/likes', method: ['POST', 'DELETE'], body: handle },
  { url: '/api/user/comments', method: 'POST', body: handle },
  { url: '/api/user/comments/:id', method: 'DELETE', body: handle },
  { url: '/api/user/articles', method: 'GET', body: handle },
  { url: '/api/user/articles/:id', method: 'GET', body: handle },
  { url: '/api/user/articles/:id/access', method: 'PUT', body: handle },
  { url: '/api/user/articles/:id/submit-review', method: 'POST', body: handle },
  { url: '/api/user/articles/:id/review-log', method: 'GET', body: handle },
  { url: '/api/user/article-series', method: ['GET', 'POST'], body: handle },
  { url: '/api/user/article-series/:id', method: ['GET', 'PUT', 'DELETE'], body: handle },
  { url: '/api/user/article-series/:id/articles', method: 'POST', body: handle },
  { url: '/api/user/article-series/:id/articles/:articleId', method: 'DELETE', body: handle },
  { url: '/api/user/article-series/:id/articles/sort', method: 'PUT', body: handle },
  { url: '/api/user/footprints', method: ['GET', 'DELETE'], body: handle },
  { url: '/api/user/footprints/:id', method: 'DELETE', body: handle },
])
