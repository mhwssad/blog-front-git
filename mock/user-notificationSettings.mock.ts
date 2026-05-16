import { defineMock } from 'vite-plugin-mock-dev-server'
import { ok } from './shared'

const settings: Record<string, boolean> = {
  system: true,
  comment: true,
  follow: true,
  like: true,
  mention: true,
}

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const match = (r: RegExp) => path.match(r)

  if (m === 'GET' && path === '/api/user/notification-settings') {
    return ok(Object.entries(settings).map(([type, enabled]) => ({ type, enabled })))
  }

  if (m === 'PUT' && path === '/api/user/notification-settings') {
    const items = req.body.settings
    if (Array.isArray(items)) {
      items.forEach((item: any) => {
        if (item.type && typeof item.enabled === 'boolean') settings[item.type] = item.enabled
      })
    }
    return ok(null)
  }

  if (m === 'PUT' && match(/^\/api\/user\/notification-settings\/(\w+)$/)) {
    const type = match(/^\/api\/user\/notification-settings\/(\w+)$/)![1]
    if (typeof req.body.enabled === 'boolean') settings[type] = req.body.enabled
    return ok(null)
  }

  return ok(null, '未匹配到通知设置接口', 404)
}

export default defineMock([
  { url: '/api/user/notification-settings', method: ['GET', 'PUT'], body: handle },
  { url: '/api/user/notification-settings/:type', method: 'PUT', body: handle },
])
