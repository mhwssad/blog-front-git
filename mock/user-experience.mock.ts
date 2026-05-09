import { defineMock } from 'vite-plugin-mock-dev-server'
import { db, me, ok } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const u = me(req)

  if (m === 'GET' && path === '/api/user/experience/level') {
    if (!u) return ok(null, '未登录', 401)
    return ok({
      userId: u.id,
      level: u.level ?? 1,
      experience: u.experience ?? 0,
      nextLevelExp: 300,
    })
  }

  return ok(null, '未匹配到用户经验值接口', 404)
}

export default defineMock([{ url: '/api/user/experience/level', method: 'GET', body: handle }])
