import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, has, num, ok, page } from './shared'

const STATUS_MAP: Record<number, string> = { 0: 'pending', 1: 'approved', 2: 'rejected', 3: 'pending' }

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const match = (r: RegExp) => path.match(r)

  if (m === 'GET' && path === '/api/sys/author-applications') {
    let rs = [...db.authorApplications]
    if (req.query.userId) rs = rs.filter((i: any) => i.userId === num(req.query.userId))
    if (req.query.status !== undefined && req.query.status !== '') rs = rs.filter((i: any) => i.status === req.query.status)
    if (req.query.keyword) rs = rs.filter((i: any) => has(i.username, req.query.keyword) || has(i.nickname, req.query.keyword))
    return ok(page(rs, req.query))
  }

  if (m === 'GET' && match(/^\/api\/sys\/author-applications\/(\d+)$/)) {
    const x = db.authorApplications.find((i: any) => i.id === num(match(/^\/api\/sys\/author-applications\/(\d+)$/)![1]))
    return x ? ok(cp(x)) : ok(null, '申请不存在', 404)
  }

  if (match(/^\/api\/sys\/author-applications\/(\d+)\/review$/) && m === 'PUT') {
    const x = db.authorApplications.find((i: any) => i.id === num(match(/^\/api\/sys\/author-applications\/(\d+)\/review$/)![1]))
    if (x) {
      x.status = req.body.approved ? 'approved' : 'rejected'
    }
    return ok(null)
  }

  if (match(/^\/api\/sys\/author-applications\/(\d+)\/repair$/) && m === 'PUT') {
    const x = db.authorApplications.find((i: any) => i.id === num(match(/^\/api\/sys\/author-applications\/(\d+)\/repair$/)![1]))
    if (x) {
      x.status = STATUS_MAP[req.body.targetStatus] ?? x.status
    }
    return ok(null)
  }

  return ok(null, '未匹配到作者申请接口', 404)
}

export default defineMock([
  { url: '/api/sys/author-applications', method: 'GET', body: handle },
  { url: '/api/sys/author-applications/:id', method: 'GET', body: handle },
  { url: '/api/sys/author-applications/:id/review', method: 'PUT', body: handle },
  { url: '/api/sys/author-applications/:id/repair', method: 'PUT', body: handle },
])
