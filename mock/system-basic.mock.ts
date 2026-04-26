import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, del, find, has, me, menuFilter, num, ok, p, page } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = p(req)
  const match = (r: RegExp) => path.match(r)

  if (m === 'GET' && path === '/api/sys/users') {
    let rs = [...db.users]
    if (req.query.username) rs = rs.filter((i: any) => has(i.username, req.query.username))
    if (req.query.nickname) rs = rs.filter((i: any) => has(i.nickname, req.query.nickname))
    if (req.query.email) rs = rs.filter((i: any) => has(i.email, req.query.email))
    if (req.query.status !== undefined && req.query.status !== '') rs = rs.filter((i: any) => i.status === num(req.query.status))
    return ok(page(rs, req.query))
  }

  if (m === 'GET' && match(/^\/api\/sys\/users\/(\d+)$/)) {
    const x = db.users.find((i: any) => i.id === num(match(/^\/api\/sys\/users\/(\d+)$/)![1]))
    return x ? ok(cp(x)) : ok(null, '用户不存在', 404)
  }

  if (m === 'GET' && match(/^\/api\/sys\/users\/(\d+)\/roles$/)) {
    const x = db.users.find((i: any) => i.id === num(match(/^\/api\/sys\/users\/(\d+)\/roles$/)![1]))
    return x ? ok(cp(x.roleIds)) : ok(null, '用户不存在', 404)
  }

  if (m === 'GET' && path === '/api/sys/roles') {
    let rs = [...db.roles]
    if (req.query.name) rs = rs.filter((i: any) => has(i.name, req.query.name))
    if (req.query.code) rs = rs.filter((i: any) => has(i.code, req.query.code))
    if (req.query.status !== undefined && req.query.status !== '') rs = rs.filter((i: any) => i.status === num(req.query.status))
    return ok(page(rs, req.query))
  }

  if (m === 'GET' && match(/^\/api\/sys\/roles\/(\d+)$/)) {
    const x = db.roles.find((i: any) => i.id === num(match(/^\/api\/sys\/roles\/(\d+)$/)![1]))
    return x ? ok(cp(x)) : ok(null, '角色不存在', 404)
  }

  if (m === 'GET' && match(/^\/api\/sys\/roles\/(\d+)\/menus$/)) {
    const x = db.roles.find((i: any) => i.id === num(match(/^\/api\/sys\/roles\/(\d+)\/menus$/)![1]))
    return x ? ok(cp(x.menuIds)) : ok(null, '角色不存在', 404)
  }

  if (m === 'GET' && path === '/api/sys/menus/tree') return ok(cp(db.menus))

  if (m === 'GET' && match(/^\/api\/sys\/menus\/(\d+)$/)) {
    const x = find(db.menus, num(match(/^\/api\/sys\/menus\/(\d+)$/)![1]))
    return x ? ok(cp(x)) : ok(null, '菜单不存在', 404)
  }

  if (m === 'GET' && path === '/api/sys/configs') {
    let rs = [...db.configs]
    if (req.query.configName) rs = rs.filter((i: any) => has(i.configName, req.query.configName))
    if (req.query.configKey) rs = rs.filter((i: any) => has(i.configKey, req.query.configKey))
    return ok(page(rs, req.query))
  }

  if (m === 'GET' && match(/^\/api\/sys\/configs\/(\d+)$/)) {
    const x = db.configs.find((i: any) => i.id === num(match(/^\/api\/sys\/configs\/(\d+)$/)![1]))
    return x ? ok(cp(x)) : ok(null, '配置不存在', 404)
  }

  if (m === 'GET' && match(/^\/api\/sys\/configs\/key\/(.+)$/)) {
    const x = db.configs.find((i: any) => i.configKey === match(/^\/api\/sys\/configs\/key\/(.+)$/)![1])
    return x ? ok(x.configValue) : ok(null, '配置不存在', 404)
  }

  if (m === 'GET' && path === '/api/sys/notices') {
    let rs = [...db.notices]
    if (req.query.title) rs = rs.filter((i: any) => has(i.title, req.query.title))
    if (req.query.type !== undefined && req.query.type !== '') rs = rs.filter((i: any) => i.type === num(req.query.type))
    if (req.query.status !== undefined && req.query.status !== '') rs = rs.filter((i: any) => i.status === num(req.query.status))
    return ok(page(rs, req.query))
  }

  if (m === 'GET' && match(/^\/api\/sys\/notices\/(\d+)$/)) {
    const x = db.notices.find((i: any) => i.id === num(match(/^\/api\/sys\/notices\/(\d+)$/)![1]))
    return x ? ok(cp(x)) : ok(null, '通知不存在', 404)
  }

  if (m === 'GET' && path === '/api/sys/logs') return ok(page(db.logs, req.query))

  if (m === 'GET' && match(/^\/api\/sys\/logs\/(\d+)$/)) {
    const x = db.logs.find((i: any) => i.id === num(match(/^\/api\/sys\/logs\/(\d+)$/)![1]))
    return x ? ok(cp(x)) : ok(null, '日志不存在', 404)
  }

  if (m === 'POST' && path === '/api/sys/users') {
    db.users.push({ id: ++db.seq.user, username: req.body.username, nickname: req.body.nickname || req.body.username, email: req.body.email || `${req.body.username}@example.com`, phone: req.body.phone || '', avatar: req.body.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${req.body.username}`, gender: req.body.gender ?? 1, birthday: req.body.birthday ?? '2000-01-01', status: req.body.status ?? 1, remark: req.body.remark ?? null, lastLoginTime: null, lastLoginIp: null, createTime: new Date().toISOString().slice(0, 19).replace('T', ' '), updateTime: new Date().toISOString().slice(0, 19).replace('T', ' '), password: req.body.password || '123456', roleIds: [] })
    return ok(null)
  }

  if (match(/^\/api\/sys\/users\/(\d+)\/status$/) && m === 'PUT') {
    const x = db.users.find((i: any) => i.id === num(match(/^\/api\/sys\/users\/(\d+)\/status$/)![1]))
    if (x) x.status = req.body.status ?? x.status
    return ok(null)
  }

  if (match(/^\/api\/sys\/users\/(\d+)\/roles$/) && m === 'PUT') {
    const x = db.users.find((i: any) => i.id === num(match(/^\/api\/sys\/users\/(\d+)\/roles$/)![1]))
    if (x) x.roleIds = cp(req.body.roleIds ?? [])
    return ok(null)
  }

  if (match(/^\/api\/sys\/users\/(\d+)$/)) {
    const x = db.users.find((i: any) => i.id === num(match(/^\/api\/sys\/users\/(\d+)$/)![1]))
    if (!x) return ok(null, '用户不存在', 404)
    if (m === 'PUT') {
      Object.assign(x, req.body, { updateTime: new Date().toISOString().slice(0, 19).replace('T', ' ') })
      return ok(null)
    }
    if (m === 'DELETE') {
      db.users = db.users.filter((i: any) => i.id !== x.id)
      return ok(null)
    }
  }

  if (m === 'POST' && path === '/api/sys/roles') {
    db.roles.push({ id: ++db.seq.role, name: req.body.name, code: req.body.code, sort: req.body.sort ?? db.roles.length + 1, status: req.body.status ?? 1, dataScope: req.body.dataScope ?? 1, remark: req.body.remark ?? null, createTime: new Date().toISOString().slice(0, 19).replace('T', ' '), menuIds: [] })
    return ok(null)
  }

  if (match(/^\/api\/sys\/roles\/(\d+)\/menus$/) && m === 'PUT') {
    const x = db.roles.find((i: any) => i.id === num(match(/^\/api\/sys\/roles\/(\d+)\/menus$/)![1]))
    if (x) x.menuIds = cp(req.body.menuIds ?? [])
    return ok(null)
  }

  if (match(/^\/api\/sys\/roles\/(\d+)\/status$/) && m === 'PUT') {
    const x = db.roles.find((i: any) => i.id === num(match(/^\/api\/sys\/roles\/(\d+)\/status$/)![1]))
    if (x) x.status = req.body.status ?? x.status
    return ok(null)
  }

  if (match(/^\/api\/sys\/roles\/(\d+)$/)) {
    const x = db.roles.find((i: any) => i.id === num(match(/^\/api\/sys\/roles\/(\d+)$/)![1]))
    if (!x) return ok(null, '角色不存在', 404)
    if (m === 'PUT') {
      Object.assign(x, req.body)
      return ok(null)
    }
    if (m === 'DELETE') {
      db.roles = db.roles.filter((i: any) => i.id !== x.id)
      return ok(null)
    }
  }

  if (m === 'POST' && path === '/api/sys/menus') {
    const t = { id: ++db.seq.menu, parentId: req.body.parentId ?? 0, name: req.body.name, type: req.body.type || 'M', sort: req.body.sort ?? 10, visible: req.body.visible ?? 1, status: 1, routeName: req.body.routeName ?? '', routePath: req.body.routePath ?? '', component: req.body.component ?? null, icon: req.body.icon ?? null, alwaysShow: req.body.alwaysShow ?? 0, keepAlive: req.body.keepAlive ?? 0, perm: req.body.perm ?? null, redirect: req.body.redirect ?? null, params: req.body.params ?? null, children: [] }
    if (t.parentId === 0) db.menus.push(t)
    else {
      const parent = find(db.menus, t.parentId)
      if (parent) parent.children = [...(parent.children ?? []), t]
      else db.menus.push(t)
    }
    const adminRole = db.roles.find((i: any) => i.code === 'admin')
    if (adminRole && !adminRole.menuIds.includes(t.id)) adminRole.menuIds.push(t.id)
    return ok(null)
  }

  if (match(/^\/api\/sys\/menus\/(\d+)$/) && m === 'PUT') {
    const t = find(db.menus, num(match(/^\/api\/sys\/menus\/(\d+)$/)![1]))
    if (!t) return ok(null, '菜单不存在', 404)
    Object.assign(t, { ...req.body, parentId: t.parentId })
    return ok(null)
  }

  if (match(/^\/api\/sys\/menus\/(\d+)$/) && m === 'DELETE') {
    const id = num(match(/^\/api\/sys\/menus\/(\d+)$/)![1])
    del(db.menus, id)
    db.roles.forEach((i: any) => (i.menuIds = i.menuIds.filter((menuId: number) => menuId !== id)))
    return ok(null)
  }

  if (m === 'POST' && path === '/api/sys/configs') {
    db.configs.unshift({ id: ++db.seq.config, createTime: new Date().toISOString().slice(0, 19).replace('T', ' '), isSystem: 0, ...req.body })
    return ok(null)
  }

  if (match(/^\/api\/sys\/configs\/(\d+)$/)) {
    const x = db.configs.find((i: any) => i.id === num(match(/^\/api\/sys\/configs\/(\d+)$/)![1]))
    if (!x) return ok(null, '配置不存在', 404)
    if (m === 'PUT') {
      Object.assign(x, req.body)
      return ok(null)
    }
    if (m === 'DELETE') {
      db.configs = db.configs.filter((i: any) => i.id !== x.id)
      return ok(null)
    }
  }

  if (m === 'POST' && path === '/api/sys/notices') {
    db.notices.unshift({ id: ++db.seq.notice, title: req.body.title, content: req.body.content, type: req.body.type ?? 1, level: req.body.level ?? 'info', targetType: req.body.targetType ?? 0, targetUserIds: req.body.targetUserIds ?? [], publisherId: 1, status: 0, publishStatus: 0, publishTime: null, revokeTime: null, createTime: new Date().toISOString().slice(0, 19).replace('T', ' '), updateTime: null })
    return ok(null)
  }

  if (match(/^\/api\/sys\/notices\/(\d+)\/(publish|revoke)$/) && m === 'POST') {
    const x = db.notices.find((i: any) => i.id === num(match(/^\/api\/sys\/notices\/(\d+)\/(publish|revoke)$/)![1]))
    if (!x) return ok(null, '通知不存在', 404)
    x.status = match(/^\/api\/sys\/notices\/(\d+)\/(publish|revoke)$/)![2] === 'publish' ? 1 : 0
    x.publishTime = x.status === 1 ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null
    return ok(null)
  }

  if (match(/^\/api\/sys\/notices\/(\d+)$/)) {
    const x = db.notices.find((i: any) => i.id === num(match(/^\/api\/sys\/notices\/(\d+)$/)![1]))
    if (!x) return ok(null, '通知不存在', 404)
    if (m === 'PUT') {
      Object.assign(x, req.body)
      return ok(null)
    }
    if (m === 'DELETE') {
      db.notices = db.notices.filter((i: any) => i.id !== x.id)
      return ok(null)
    }
  }

  return ok(null, '未匹配到系统基础接口', 404)
}

export default defineMock([
  { url: '/api/sys/users', method: ['GET', 'POST'], body: handle },
  { url: '/api/sys/users/:id', method: ['GET', 'PUT', 'DELETE'], body: handle },
  { url: '/api/sys/users/:id/status', method: 'PUT', body: handle },
  { url: '/api/sys/users/:id/roles', method: ['GET', 'PUT'], body: handle },
  { url: '/api/sys/roles', method: ['GET', 'POST'], body: handle },
  { url: '/api/sys/roles/:id', method: ['GET', 'PUT', 'DELETE'], body: handle },
  { url: '/api/sys/roles/:id/status', method: 'PUT', body: handle },
  { url: '/api/sys/roles/:id/menus', method: ['GET', 'PUT'], body: handle },
  { url: '/api/sys/menus', method: 'POST', body: handle },
  { url: '/api/sys/menus/tree', method: 'GET', body: handle },
  { url: '/api/sys/menus/:id', method: ['GET', 'PUT', 'DELETE'], body: handle },
  { url: '/api/sys/configs', method: ['GET', 'POST'], body: handle },
  { url: '/api/sys/configs/key/:key', method: 'GET', body: handle },
  { url: '/api/sys/configs/:id', method: ['GET', 'PUT', 'DELETE'], body: handle },
  { url: '/api/sys/notices', method: ['GET', 'POST'], body: handle },
  { url: '/api/sys/notices/:id', method: ['GET', 'PUT', 'DELETE'], body: handle },
  { url: '/api/sys/notices/:id/publish', method: 'POST', body: handle },
  { url: '/api/sys/notices/:id/revoke', method: 'POST', body: handle },
  { url: '/api/sys/logs', method: 'GET', body: handle },
  { url: '/api/sys/logs/:id', method: 'GET', body: handle },
])

