import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, me, now, ok } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const u = me(req)

  if (m === 'GET' && path === '/api/user/profile') {
    if (!u) return ok(null, '未登录', 401)
    return ok(cp({
      id: u.id,
      username: u.username,
      nickname: u.nickname,
      email: u.email,
      avatar: u.avatar ?? null,
      bio: u.bio ?? '',
      phone: u.phone ?? '',
      level: u.level ?? 1,
      experience: u.experience ?? 0,
    }))
  }

  if (m === 'PUT' && path === '/api/user/profile') {
    if (!u) return ok(null, '未登录', 401)
    const body = req.body
    if (body.nickname !== undefined) u.nickname = body.nickname
    if (body.bio !== undefined) u.bio = body.bio
    if (body.avatar !== undefined) u.avatar = body.avatar
    if (body.phone !== undefined) u.phone = body.phone
    u.updateTime = now()
    return ok(null)
  }

  if (m === 'PUT' && path === '/api/user/profile/password') {
    if (!u) return ok(null, '未登录', 401)
    return ok(null)
  }

  return ok(null, '未匹配到用户资料接口', 404)
}

export default defineMock([
  { url: '/api/user/profile', method: ['GET', 'PUT'], body: handle },
  { url: '/api/user/profile/password', method: 'PUT', body: handle },
])
