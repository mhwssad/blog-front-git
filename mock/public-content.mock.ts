import { defineMock } from 'vite-plugin-mock-dev-server'
import { ad, cp, db, detail, has, num, ok, p, page } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = p(req)
  const u = me(req)

  if (m === 'GET' && path === '/api/articles') {
    let rs = db.articles.filter((i: any) => i.status === 1 && (i.accessLevel !== 4 || i.accessList.some((x: any) => x.userId === u.id)))
    if (req.query.keyword) rs = rs.filter((i: any) => has(i.title, req.query.keyword) || has(i.summary, req.query.keyword))
    if (req.query.categoryId) rs = rs.filter((i: any) => i.categoryIds.includes(num(req.query.categoryId)))
    if (req.query.tagId) rs = rs.filter((i: any) => i.tagIds.includes(num(req.query.tagId)))
    const s = req.query.sort || 'latest'
    rs.sort(
      s === 'hot'
        ? (l: any, r: any) => r.viewCount + r.likeCount * 3 + r.commentCount * 4 - (l.viewCount + l.likeCount * 3 + l.commentCount * 4)
        : s === 'top'
          ? (l: any, r: any) => r.isTop - l.isTop || String(r.publishTime).localeCompare(String(l.publishTime))
          : (l: any, r: any) => String(r.publishTime).localeCompare(String(l.publishTime))
    )
    return ok(page(rs.map(ad), req.query))
  }

  const articleMatch = path.match(/^\/api\/articles\/(\d+)$/)
  if (m === 'GET' && articleMatch) {
    const a = db.articles.find((i: any) => i.id === num(articleMatch[1]))
    return a && a.status === 1 && (a.accessLevel !== 4 || a.accessList.some((x: any) => x.userId === u.id))
      ? ok(detail(a))
      : ok(null, '文章不存在', 404)
  }

  if (m === 'GET' && path === '/api/categories/tree') return ok(cp(db.categories))
  if (m === 'GET' && path === '/api/tags') return ok(cp(db.tags))

  if (m === 'GET' && path === '/api/comments') {
    let rs = db.comments.filter((i: any) => i.status === 1)
    if (req.query.targetType) rs = rs.filter((i: any) => i.targetType === req.query.targetType)
    if (req.query.targetId) rs = rs.filter((i: any) => i.targetId === num(req.query.targetId))
    return ok(page(rs, req.query))
  }

  return ok(null, '未匹配到公开内容接口', 404)
}

function me(req: any) {
  const m = String(req.headers?.authorization || '').match(/(\d+)/)
  return db.users.find((i: any) => i.id === Number(m?.[1])) || db.users[0]
}

export default defineMock([
  { url: '/api/articles', method: 'GET', body: handle },
  { url: '/api/articles/:id', method: 'GET', body: handle },
  { url: '/api/categories/tree', method: 'GET', body: handle },
  { url: '/api/tags', method: 'GET', body: handle },
  { url: '/api/comments', method: 'GET', body: handle },
])
