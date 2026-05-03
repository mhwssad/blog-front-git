import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, me, now, num, ok, page } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const u = me(req)
  const match = (r: RegExp) => path.match(r)

  if (m === 'POST' && path === '/api/user/reports') {
    const id = (db.reports ? Math.max(...db.reports.map((i: any) => i.id), 0) : 0) + 1
    const report = {
      id,
      reportTargetType: req.body.targetType,
      reportTargetId: req.body.targetId,
      reporterUserId: u.id,
      reporterUsername: u.username,
      reasonCode: req.body.reasonCode,
      reasonDetail: req.body.reasonDetail ?? null,
      status: 0,
      handlerUserId: null,
      handlerUsername: null,
      punishmentType: null,
      resultType: null,
      reportedAt: now(),
      handledAt: null,
      createdAt: now(),
    }
    if (!db.reports) db.reports = []
    db.reports.push(report)
    return ok(null)
  }

  if (m === 'GET' && path === '/api/user/reports') {
    const rs = (db.reports || []).filter((i: any) => i.reporterUserId === u.id)
    return ok(page(rs, req.query))
  }

  if (m === 'GET' && match(/^\/api\/user\/reports\/(\d+)$/)) {
    const x = (db.reports || []).find((i: any) => i.id === num(match(/^\/api\/user\/reports\/(\d+)$/)![1]) && i.reporterUserId === u.id)
    return x ? ok(cp(x)) : ok(null, '举报不存在', 404)
  }

  return ok(null, '未匹配到用户举报接口', 404)
}

export default defineMock([
  { url: '/api/user/reports', method: ['GET', 'POST'], body: handle },
  { url: '/api/user/reports/:id', method: 'GET', body: handle },
])
