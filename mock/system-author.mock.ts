import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, has, now, num, ok, page } from './shared'

const STATUS_LABELS: Record<number, string> = { 0: '待审核', 1: '已通过', 2: '已拒绝', 3: '已撤回' }

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const match = (r: RegExp) => path.match(r)

  if (m === 'GET' && path === '/api/sys/author-applications') {
    let rs = [...db.authorApplications]
    if (req.query.userId) rs = rs.filter((i: any) => i.userId === num(req.query.userId))
    if (req.query.applyStatus !== undefined && req.query.applyStatus !== '') rs = rs.filter((i: any) => i.applyStatus === num(req.query.applyStatus))
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
      x.applyStatus = req.body.reviewStatus ?? x.applyStatus
      x.applyStatusLabel = STATUS_LABELS[x.applyStatus] ?? '未知'
      x.reviewerId = 1
      x.reviewerUsername = 'admin'
      x.reviewerNickname = '管理员'
      x.reviewComment = req.body.reviewComment ?? null
      x.reviewedAt = now()
    }
    return ok(null)
  }

  if (match(/^\/api\/sys\/author-applications\/(\d+)\/repair$/) && m === 'PUT') {
    const x = db.authorApplications.find((i: any) => i.id === num(match(/^\/api\/sys\/author-applications\/(\d+)\/repair$/)![1]))
    if (x) {
      x.applyStatus = req.body.targetStatus ?? x.applyStatus
      x.applyStatusLabel = STATUS_LABELS[x.applyStatus] ?? '未知'
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
