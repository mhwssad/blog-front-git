import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, has, num, ok, page } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const match = (r: RegExp) => path.match(r)

  if (m === 'GET' && path === '/api/sys/audit-logs') {
    let rs = [...db.auditLogs]
    if (req.query.module) rs = rs.filter((i: any) => has(i.module, req.query.module))
    if (req.query.operatorUserId)
      rs = rs.filter((i: any) => num(i.operatorUserId ?? i.operatorId) === num(req.query.operatorUserId))
    if (req.query.targetUserId)
      rs = rs.filter((i: any) => num(i.targetUserId ?? i.targetId) === num(req.query.targetUserId))
    if (req.query.operationType) rs = rs.filter((i: any) => has(i.operationType ?? i.action, req.query.operationType))
    return ok(page(rs, req.query))
  }

  if (m === 'GET' && match(/^\/api\/sys\/audit-logs\/(\d+)$/)) {
    const x = db.auditLogs.find((i: any) => i.id === num(match(/^\/api\/sys\/audit-logs\/(\d+)$/)![1]))
    return x ? ok(cp(x)) : ok(null, '审计日志不存在', 404)
  }

  return ok(null, '未匹配到审计日志接口', 404)
}

export default defineMock([
  { url: '/api/sys/audit-logs', method: 'GET', body: handle },
  { url: '/api/sys/audit-logs/:id', method: 'GET', body: handle },
])
