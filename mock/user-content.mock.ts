import { defineMock } from 'vite-plugin-mock-dev-server'
import { db, me, ok, p, page } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = p(req)
  const u = me(req)

  if (m === 'GET' && path === '/api/user/collection-folders') {
    return ok(db.folders.filter((i: any) => i.userId === u.id))
  }

  if (m === 'GET' && path === '/api/user/collections') {
    return ok(page(db.collections.filter((i: any) => i.userId === u.id), req.query))
  }

  if (m === 'GET' && path === '/api/user/footprints') {
    return ok(page(db.footprints.filter((i: any) => i.userId === u.id), req.query))
  }

  return ok(null, '未匹配到用户内容接口', 404)
}

export default defineMock([
  { url: '/api/user/collection-folders', method: 'GET', body: handle },
  { url: '/api/user/collections', method: 'GET', body: handle },
  { url: '/api/user/footprints', method: 'GET', body: handle },
])
