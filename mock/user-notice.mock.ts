import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, has, me, now, num, ok, page } from './shared'

const stripUserNotice = ({ userId, noticeId, ...n }: any) => n

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const u = me(req)

  if (m === 'GET' && path === '/api/user/notices/unread-count') {
    return ok(db.userNotices.filter((i: any) => i.userId === u.id && i.isRead === 0).length)
  }

  if (m === 'GET' && path === '/api/user/notices') {
    let rs = db.userNotices.filter((i: any) => i.userId === u.id)
    if (req.query.title) rs = rs.filter((i: any) => has(i.title, req.query.title))
    if (req.query.isRead !== undefined) rs = rs.filter((i: any) => i.isRead === num(req.query.isRead))
    return ok(page(rs.map(stripUserNotice), req.query))
  }

  const detailMatch = path.match(/^\/api\/user\/notices\/(\d+)$/)
  if (m === 'GET' && detailMatch) {
    const x = db.userNotices.find((i: any) => i.id === num(detailMatch[1]) && i.userId === u.id)
    return x ? ok(stripUserNotice(cp(x))) : ok(null, '通知不存在', 404)
  }

  if (m === 'POST' && path === '/api/user/notices/read-all') {
    db.userNotices.filter((i: any) => i.userId === u.id && i.isRead === 0).forEach((i: any) => { i.isRead = 1; i.readTime = now() })
    return ok(null)
  }

  const readMatch = path.match(/^\/api\/user\/notices\/(\d+)\/read$/)
  if (m === 'POST' && readMatch) {
    const x = db.userNotices.find((i: any) => i.id === num(readMatch[1]) && i.userId === u.id)
    if (x) { x.isRead = 1; x.readTime = now() }
    return ok(null)
  }

  return ok(null, '未匹配到用户通知接口', 404)
}

export default defineMock([
  { url: '/api/user/notices', method: 'GET', body: handle },
  { url: '/api/user/notices/unread-count', method: 'GET', body: handle },
  { url: '/api/user/notices/:id', method: 'GET', body: handle },
  { url: '/api/user/notices/:id/read', method: 'POST', body: handle },
  { url: '/api/user/notices/read-all', method: 'POST', body: handle },
])
