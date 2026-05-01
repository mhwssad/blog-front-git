import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, me, num, ok, p, page } from './shared'

const stripUserNotice = ({ userId, ...n }: any) => n

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = p(req)
  const u = me(req)

  if (m === 'GET' && path === '/api/user/notices/unread-count') {
    return ok(db.userNotices.filter((i: any) => i.userId === u.id && i.isRead === 0).length)
  }

  if (m === 'GET' && path === '/api/user/notices') {
    return ok(page(db.userNotices.filter((i: any) => i.userId === u.id).map(stripUserNotice), req.query))
  }

  const detailMatch = path.match(/^\/api\/user\/notices\/(\d+)$/)
  if (m === 'GET' && detailMatch) {
    const x = db.userNotices.find((i: any) => i.id === num(detailMatch[1]) && i.userId === u.id)
    return x ? ok(stripUserNotice(cp(x))) : ok(null, '通知不存在', 404)
  }

  return ok(null, '未匹配到用户通知接口', 404)
}

export default defineMock([
  { url: '/api/user/notices', method: 'GET', body: handle },
  { url: '/api/user/notices/unread-count', method: 'GET', body: handle },
  { url: '/api/user/notices/:id', method: 'GET', body: handle },
])
