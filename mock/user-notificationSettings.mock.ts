import { defineMock } from 'vite-plugin-mock-dev-server'
import { ok } from './shared'

const settings: Record<string, any> = {
  system: { enabled: true, emailNotify: false },
  comment: { enabled: true, emailNotify: true },
  follow: { enabled: true, emailNotify: false },
  like: { enabled: true, emailNotify: false },
  mention: { enabled: true, emailNotify: true },
}

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const match = (r: RegExp) => path.match(r)

  if (m === 'GET' && path === '/api/user/notification-settings') {
    return ok(settings)
  }

  if (m === 'PUT' && path === '/api/user/notification-settings') {
    Object.assign(settings, req.body)
    return ok(null)
  }

  if (m === 'PUT' && match(/^\/api\/user\/notification-settings\/(\w+)$/)) {
    const type = match(/^\/api\/user\/notification-settings\/(\w+)$/)![1]
    if (settings[type]) Object.assign(settings[type], req.body)
    else settings[type] = req.body
    return ok(null)
  }

  return ok(null, '未匹配到通知设置接口', 404)
}

export default defineMock([
  { url: '/api/user/notification-settings', method: ['GET', 'PUT'], body: handle },
  { url: '/api/user/notification-settings/:type', method: 'PUT', body: handle },
])
