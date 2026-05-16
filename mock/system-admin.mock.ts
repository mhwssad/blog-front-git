import { defineMock } from 'vite-plugin-mock-dev-server'
import { db, ok } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const match = (r: RegExp) => path.match(r)

  if (m === 'POST' && path === '/api/admin/2fa/send-code') return ok(null, '验证码已发送')

  if (m === 'POST' && path === '/api/admin/2fa/verify') return ok({ ticket: `mock-mfa-ticket-${Date.now()}`, expiresIn: 1800 })

  if (m === 'POST' && match(/^\/api\/admin\/users\/(\d+)\/ban$/)) {
    const id = Number(match(/^\/api\/admin\/users\/(\d+)\/ban$/)![1])
    const user = db.users.find((i: any) => i.id === id)
    if (user) user.status = 0
    return ok(null)
  }

  if (m === 'POST' && match(/^\/api\/admin\/users\/(\d+)\/unban$/)) {
    const id = Number(match(/^\/api\/admin\/users\/(\d+)\/unban$/)![1])
    const user = db.users.find((i: any) => i.id === id)
    if (user) user.status = 1
    return ok(null)
  }

  if (m === 'PUT' && match(/^\/api\/admin\/users\/(\d+)\/level$/)) {
    const id = Number(match(/^\/api\/admin\/users\/(\d+)\/level$/)![1])
    const user = db.users.find((i: any) => i.id === id)
    if (user) user.userLevel = req.body.level ?? user.userLevel
    return ok(null)
  }

  if (m === 'PUT' && match(/^\/api\/admin\/users\/(\d+)\/experience$/)) {
    const id = Number(match(/^\/api\/admin\/users\/(\d+)\/experience$/)![1])
    const user = db.users.find((i: any) => i.id === id)
    if (user) user.experiencePoints = req.body.experience ?? user.experiencePoints
    return ok(null)
  }

  if (m === 'POST' && path === '/api/admin/takeover') {
    const targetUserId = req.body.targetUserId
    const target = db.users.find((i: any) => i.id === targetUserId)
    return target
      ? ok({ takeoverToken: `mock-takeover-${targetUserId}`, expiresIn: 300 })
      : ok(null, '目标用户不存在', 404)
  }

  if (m === 'PUT' && match(/^\/api\/admin\/users\/(\d+)\/roles$/)) {
    const id = Number(match(/^\/api\/admin\/users\/(\d+)\/roles$/)![1])
    const user = db.users.find((i: any) => i.id === id)
    if (user) user.roleIds = req.body.roleIds ?? user.roleIds
    return ok(null)
  }

  return ok(null, '未匹配到超管接口', 404)
}

export default defineMock([
  { url: '/api/admin/2fa/send-code', method: 'POST', body: handle },
  { url: '/api/admin/2fa/verify', method: 'POST', body: handle },
  { url: '/api/admin/users/:id/ban', method: 'POST', body: handle },
  { url: '/api/admin/users/:id/unban', method: 'POST', body: handle },
  { url: '/api/admin/users/:id/level', method: 'PUT', body: handle },
  { url: '/api/admin/users/:id/experience', method: 'PUT', body: handle },
  { url: '/api/admin/takeover', method: 'POST', body: handle },
  { url: '/api/admin/users/:id/roles', method: 'PUT', body: handle },
])
