import { defineMock } from 'vite-plugin-mock-dev-server'
import { ad, cp, db, detail, has, me, num, ok, page } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const u = me(req)
  const match = (r: RegExp) => path.match(r)

  // ==================== 文章列表 ====================
  if (m === 'GET' && path === '/api/articles') {
    let rs = db.articles.filter((i: any) => i.status === 1 && (i.accessLevel !== 4 || i.accessList.some((x: any) => x.userId === u.id)))
    if (req.query.keyword) rs = rs.filter((i: any) => has(i.title, req.query.keyword) || has(i.summary, req.query.keyword))
    if (req.query.categoryId) rs = rs.filter((i: any) => i.categoryIds.includes(num(req.query.categoryId)))
    if (req.query.tagId) rs = rs.filter((i: any) => i.tagIds.includes(num(req.query.tagId)))
    const s = req.query.sort || 'latest'
    rs.sort(
      s === 'popular'
        ? (l: any, r: any) => r.viewCount - l.viewCount
        : s === 'hot'
          ? (l: any, r: any) => r.viewCount + r.likeCount * 3 + r.commentCount * 4 - (l.viewCount + l.likeCount * 3 + l.commentCount * 4)
          : (l: any, r: any) => String(r.publishTime).localeCompare(String(l.publishTime))
    )
    return ok(page(rs.map(ad), req.query))
  }

  // ==================== 文章详情 ====================
  const articleMatch = path.match(/^\/api\/articles\/(\d+)$/)
  if (m === 'GET' && articleMatch) {
    const a = db.articles.find((i: any) => i.id === num(articleMatch[1]))
    if (!a || a.status !== 1) return ok(null, '文章不存在', 404)
    if (a.accessLevel === 4 && !a.accessList.some((x: any) => x.userId === u.id)) return ok(null, '文章不存在', 404)
    return ok(detail(a))
  }

  // ==================== 分类与标签 ====================
  if (m === 'GET' && path === '/api/categories/tree') return ok(cp(db.categories))
  if (m === 'GET' && path === '/api/tags') return ok(cp(db.tags).filter((i: any) => i.targetType === 'article' || i.targetType === undefined))

  // ==================== 评论列表 ====================
  if (m === 'GET' && path === '/api/comments') {
    let rs = db.comments.filter((i: any) => i.status === 1)
    if (req.query.targetType) rs = rs.filter((i: any) => i.targetType === req.query.targetType)
    if (req.query.targetId) rs = rs.filter((i: any) => i.targetId === num(req.query.targetId))

    // 构建评论树
    const map = new Map<number, any>()
    rs.forEach(c => {
      const liked = db.interactions.some((i: any) => i.targetType === 'comment' && i.targetId === c.id && i.actionType === 'like')
      map.set(c.id, {
        ...cp(c),
        liked: !!liked,
        children: [],
      })
    })

    const roots: any[] = []
    map.forEach(c => {
      if (c.rootId === 0 || c.rootId === c.id) {
        roots.push(c)
      } else {
        const parent = map.get(c.rootId || c.parentId)
        if (parent) parent.children.push(c)
      }
    })

    return ok(page(roots, req.query))
  }

  // ==================== 公开作者系列 ====================
  const authorSeriesMatch = path.match(/^\/api\/public\/authors\/(\d+)\/series$/)
  if (m === 'GET' && authorSeriesMatch) {
    const authorId = num(authorSeriesMatch[1])
    return ok((db.series || []).filter((s: any) => s.authorId === authorId && s.visibilityScope === 0).map((s: any) => ({
      id: s.id,
      title: s.title,
      coverImage: s.coverImage,
      articleCount: db.articles.filter(a => a.seriesId === s.id && a.status === 1).length,
      sortOrder: s.sortOrder,
      visibilityScope: s.visibilityScope,
    })))
  }

  // ==================== 系列详情 ====================
  const seriesMatch = path.match(/^\/api\/public\/article-series\/(\d+)$/)
  if (m === 'GET' && seriesMatch) {
    const s = (db.series || []).find((i: any) => i.id === num(seriesMatch[1]) && i.visibilityScope === 0)
    if (!s) return ok(null, '系列不存在', 404)
    const author = db.users.find((u: any) => u.id === s.authorId)
    return ok({
      id: s.id,
      title: s.title,
      description: s.description,
      coverImage: s.coverImage,
      authorId: s.authorId,
      authorName: author?.nickname || author?.username || '',
      articleCount: db.articles.filter(a => a.seriesId === s.id && a.status === 1).length,
      sortOrder: s.sortOrder,
      visibilityScope: s.visibilityScope,
      articles: db.articles.filter(a => a.seriesId === s.id && a.status === 1).map(a => ({
        id: a.id,
        title: a.title,
        summary: a.summary,
        sortOrder: a.sortOrder ?? 0,
      })),
    })
  }

  return ok(null, '未匹配到公开内容接口', 404)
}

export default defineMock([
  { url: '/api/articles', method: 'GET', body: handle },
  { url: '/api/articles/:id', method: 'GET', body: handle },
  { url: '/api/categories/tree', method: 'GET', body: handle },
  { url: '/api/tags', method: 'GET', body: handle },
  { url: '/api/comments', method: 'GET', body: handle },
  { url: '/api/public/authors/:authorId/series', method: 'GET', body: handle },
  { url: '/api/public/article-series/:id', method: 'GET', body: handle },
])
