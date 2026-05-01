import { defineMock } from 'vite-plugin-mock-dev-server'
import { db, me, menuFilter, ok, p, perms } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = p(req)
  const u = me(req)

  if (m === 'POST' && path === '/api/auth/login') {
    const x = db.users.find((i: any) => i.status === 1 && [i.username, i.email, i.phone].includes(req.body.username))
    return x && x.password === req.body.password
      ? ok({ tokenType: 'Bearer', accessToken: `mock-access-token-${x.id}`, refreshToken: `mock-refresh-token-${x.id}`, expiresIn: 7200 }, '登录成功')
      : ok(null, '用户名或密码错误', 400)
  }

  if (m === 'POST' && path === '/api/auth/email-code') return ok(null, '验证码已发送（Mock 固定为 123456）')

  if (m === 'POST' && path === '/api/auth/email-login') {
    const x = db.users.find((i: any) => i.email === req.body.email && i.status === 1)
    return x
      ? ok({ tokenType: 'Bearer', accessToken: `mock-access-token-${x.id}`, refreshToken: `mock-refresh-token-${x.id}`, expiresIn: 7200 }, '登录成功')
      : ok(null, '邮箱或验证码错误', 400)
  }

  if (m === 'POST' && path === '/api/auth/register') {
    if (db.users.some((i: any) => i.username === req.body.username)) return ok(null, '用户名已存在', 400)
    db.users.push({
      id: ++db.seq.user,
      username: req.body.username,
      nickname: req.body.nickname || req.body.username,
      email: req.body.email || `${req.body.username}@example.com`,
      phone: req.body.phone || '',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${req.body.username}`,
      gender: 1,
      birthday: '2000-01-01',
      status: 1,
      userLevel: 1,
      experiencePoints: 0,
      levelUpdatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      remark: 'Mock 注册用户',
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      password: req.body.password,
      roleIds: [2],
    })
    return ok({ tokenType: 'Bearer', accessToken: `mock-access-token-${db.seq.user}`, refreshToken: `mock-refresh-token-${db.seq.user}`, expiresIn: 7200 }, '注册成功')
  }

  if (m === 'POST' && path === '/api/auth/refresh') {
    return ok({ tokenType: 'Bearer', accessToken: 'mock-access-token-1', refreshToken: 'mock-refresh-token-1', expiresIn: 7200 }, '刷新成功')
  }

  if (path === '/api/auth/logout') return ok(null)

  if (path === '/api/auth/current-user') {
    return ok({
      id: u.id,
      username: u.username,
      nickname: u.nickname,
      avatar: u.avatar,
      email: u.email,
      phone: u.phone,
      status: u.status,
      userLevel: u.userLevel,
      experiencePoints: u.experiencePoints,
      roles: u.roleIds.map((id: number) => db.roles.find((i: any) => i.id === id)?.code).filter(Boolean),
      permissions: perms(u),
    })
  }

  if (path === '/api/auth/current-user-menus') {
    return ok(menuFilter(db.menus, new Set(u.roleIds.flatMap((id: number) => db.roles.find((r: any) => r.id === id)?.menuIds || []))))
  }

  return ok(null, '未匹配到认证接口', 404)
}

export default defineMock([
  { url: '/api/auth/login', method: 'POST', body: handle },
  { url: '/api/auth/email-code', method: 'POST', body: handle },
  { url: '/api/auth/email-login', method: 'POST', body: handle },
  { url: '/api/auth/register', method: 'POST', body: handle },
  { url: '/api/auth/refresh', method: 'POST', body: handle },
  { url: '/api/auth/logout', method: ['POST', 'GET'], body: handle },
  { url: '/api/auth/current-user', method: 'GET', body: handle },
  { url: '/api/auth/current-user-menus', method: 'GET', body: handle },
])
