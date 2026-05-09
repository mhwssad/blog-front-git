import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, has, num, ok, page } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const match = (r: RegExp) => path.match(r)

  if (m === 'GET' && path === '/api/forum/sections') {
    const rs = (db.forumSections || []).filter((i: any) => i.status === 1)
    return ok(rs)
  }

  if (m === 'GET' && path === '/api/forum/posts') {
    let rs = (db.forumPosts || []).filter((i: any) => !i.isHidden)
    if (req.query.sectionId) rs = rs.filter((i: any) => i.sectionId === num(req.query.sectionId))
    if (req.query.keyword) rs = rs.filter((i: any) => has(i.title, req.query.keyword))
    if (req.query.sort === 'hot') rs = rs.sort((a: any, b: any) => (b.viewCount || 0) - (a.viewCount || 0))
    return ok(page(rs, req.query))
  }

  if (m === 'GET' && match(/^\/api\/forum\/posts\/(\d+)$/)) {
    const x = (db.forumPosts || []).find(
      (i: any) => i.id === num(match(/^\/api\/forum\/posts\/(\d+)$/)![1]) && !i.isHidden,
    )
    if (x) x.viewCount = (x.viewCount || 0) + 1
    return x ? ok(cp(x)) : ok(null, '帖子不存在', 404)
  }

  if (m === 'GET' && match(/^\/api\/forum\/posts\/(\d+)\/replies$/)) {
    const postId = num(match(/^\/api\/forum\/posts\/(\d+)\/replies$/)![1])
    let rs = (db.forumReplies || []).filter((i: any) => i.postId === postId && !i.isHidden)
    return ok(page(rs, req.query))
  }

  return ok(null, '未匹配到公开论坛接口', 404)
}

export default defineMock([
  { url: '/api/forum/sections', method: 'GET', body: handle },
  { url: '/api/forum/posts', method: 'GET', body: handle },
  { url: '/api/forum/posts/:id', method: 'GET', body: handle },
  { url: '/api/forum/posts/:postId/replies', method: 'GET', body: handle },
])
