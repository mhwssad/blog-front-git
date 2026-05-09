import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, has, now, num, ok, page } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const match = (r: RegExp) => path.match(r)

  if (m === 'GET' && path === '/api/sys/reports') {
    let rs = [...db.reports]
    if (req.query.status !== undefined && req.query.status !== '') rs = rs.filter((i: any) => i.status === num(req.query.status))
    if (req.query.reportTargetType) rs = rs.filter((i: any) => i.reportTargetType === req.query.reportTargetType)
    if (req.query.reporterUserId) rs = rs.filter((i: any) => i.reporterUserId === num(req.query.reporterUserId))
    if (req.query.reportedStart) rs = rs.filter((i: any) => String(i.reportedAt) >= String(req.query.reportedStart))
    if (req.query.reportedEnd) rs = rs.filter((i: any) => String(i.reportedAt) <= String(req.query.reportedEnd))
    if (req.query.keyword) rs = rs.filter((i: any) => has(i.reasonDetail, req.query.keyword) || has(i.reporterUsername, req.query.keyword))
    return ok(page(rs, req.query))
  }

  if (m === 'GET' && match(/^\/api\/sys\/reports\/(\d+)$/)) {
    const x = db.reports.find((i: any) => i.id === num(match(/^\/api\/sys\/reports\/(\d+)$/)![1]))
    return x ? ok(cp(x)) : ok(null, '举报不存在', 404)
  }

  if (match(/^\/api\/sys\/reports\/(\d+)\/take$/) && m === 'PUT') {
    const x = db.reports.find((i: any) => i.id === num(match(/^\/api\/sys\/reports\/(\d+)\/take$/)![1]))
    if (x) { x.status = 1; x.handlerUserId = 1; x.handlerUsername = 'admin'; x.handledAt = now() }
    return ok(null)
  }

  if (match(/^\/api\/sys\/reports\/(\d+)\/handle$/) && m === 'PUT') {
    const x = db.reports.find((i: any) => i.id === num(match(/^\/api\/sys\/reports\/(\d+)\/handle$/)![1]))
    if (x) { x.status = 2; x.resultType = req.body.resultType ?? 'record_only'; x.punishmentType = req.body.punishmentType ?? null; x.handlerUserId = 1; x.handlerUsername = 'admin'; x.handledAt = now() }
    return ok(null)
  }

  if (match(/^\/api\/sys\/reports\/(\d+)\/reject$/) && m === 'PUT') {
    const x = db.reports.find((i: any) => i.id === num(match(/^\/api\/sys\/reports\/(\d+)\/reject$/)![1]))
    if (x) { x.status = 3; x.handlerUserId = 1; x.handlerUsername = 'admin'; x.handledAt = now() }
    return ok(null)
  }

  if (match(/^\/api\/sys\/reports\/(\d+)\/override$/) && m === 'PUT') {
    const x = db.reports.find((i: any) => i.id === num(match(/^\/api\/sys\/reports\/(\d+)\/override$/)![1]))
    if (x) { x.status = req.body?.status ?? x.status; x.punishmentType = req.body?.punishmentType ?? null; x.resultType = req.body?.resultType ?? 'override'; x.handlerUserId = 1; x.handlerUsername = 'admin'; x.handledAt = now() }
    return ok(null)
  }

  if (match(/^\/api\/sys\/reports\/(\d+)\/repair$/) && m === 'PUT') {
    const x = db.reports.find((i: any) => i.id === num(match(/^\/api\/sys\/reports\/(\d+)\/repair$/)![1]))
    if (x) {
      x.status = req.body.targetStatus ?? x.status
      x.resultType = null
      x.punishmentType = null
      x.handlerUserId = null
      x.handlerUsername = null
      x.handledAt = null
    }
    return ok(null)
  }

  if (m === 'GET' && match(/^\/api\/sys\/reports\/(\d+)\/logs$/)) {
    const reportId = num(match(/^\/api\/sys\/reports\/(\d+)\/logs$/)![1])
    const logs = db.reportLogs ? db.reportLogs.filter((i: any) => i.reportId === reportId) : []
    return ok(page(logs, req.query))
  }

  return ok(null, '未匹配到举报管理接口', 404)
}

export default defineMock([
  { url: '/api/sys/reports', method: 'GET', body: handle },
  { url: '/api/sys/reports/:id', method: 'GET', body: handle },
  { url: '/api/sys/reports/:id/take', method: 'PUT', body: handle },
  { url: '/api/sys/reports/:id/handle', method: 'PUT', body: handle },
  { url: '/api/sys/reports/:id/reject', method: 'PUT', body: handle },
  { url: '/api/sys/reports/:id/override', method: 'PUT', body: handle },
  { url: '/api/sys/reports/:id/repair', method: 'PUT', body: handle },
  { url: '/api/sys/reports/:id/logs', method: 'GET', body: handle },
])
