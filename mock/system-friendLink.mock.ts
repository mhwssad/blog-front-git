import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, has, now, num, ok, page } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const match = (r: RegExp) => path.match(r)

  if (m === 'GET' && path === '/api/sys/friend-links') {
    let rs = [...db.friendLinks]
    if (req.query.name) rs = rs.filter((i: any) => has(i.name, req.query.name))
    if (req.query.status !== undefined && req.query.status !== '')
      rs = rs.filter((i: any) => i.status === num(req.query.status))
    return ok(page(rs, req.query))
  }

  if (m === 'POST' && path === '/api/sys/friend-links') {
    const item = {
      id: ++db.seq.friendLink,
      name: req.body.name,
      url: req.body.url,
      logo: req.body.logo ?? null,
      description: req.body.description ?? '',
      sortOrder: req.body.sortOrder ?? 0,
      status: req.body.status ?? 1,
      createTime: now(),
      updateTime: now(),
    }
    db.friendLinks.push(item)
    return ok(cp(item))
  }

  if (m === 'GET' && match(/^\/api\/sys\/friend-links\/(\d+)$/)) {
    const x = db.friendLinks.find((i: any) => i.id === num(match(/^\/api\/sys\/friend-links\/(\d+)$/)![1]))
    return x ? ok(cp(x)) : ok(null, '友链不存在', 404)
  }

  if (m === 'PUT' && match(/^\/api\/sys\/friend-links\/(\d+)$/)) {
    const x = db.friendLinks.find((i: any) => i.id === num(match(/^\/api\/sys\/friend-links\/(\d+)$/)![1]))
    if (x) Object.assign(x, req.body, { updateTime: now() })
    return ok(null)
  }

  if (m === 'PUT' && match(/^\/api\/sys\/friend-links\/(\d+)\/status$/)) {
    const x = db.friendLinks.find((i: any) => i.id === num(match(/^\/api\/sys\/friend-links\/(\d+)\/status$/)![1]))
    if (x) {
      x.status = req.body.status ?? x.status
      x.updateTime = now()
    }
    return ok(null)
  }

  if (m === 'DELETE' && match(/^\/api\/sys\/friend-links\/(\d+)$/)) {
    const id = num(match(/^\/api\/sys\/friend-links\/(\d+)$/)![1])
    db.friendLinks = db.friendLinks.filter((i: any) => i.id !== id)
    return ok(null)
  }

  return ok(null, '未匹配到友链管理接口', 404)
}

export default defineMock([
  { url: '/api/sys/friend-links', method: ['GET', 'POST'], body: handle },
  { url: '/api/sys/friend-links/:id', method: ['GET', 'PUT', 'DELETE'], body: handle },
  { url: '/api/sys/friend-links/:id/status', method: 'PUT', body: handle },
])
