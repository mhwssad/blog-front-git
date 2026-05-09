import { defineMock } from 'vite-plugin-mock-dev-server'
import { db, num, ok, now, page } from './shared'

const LEVEL_TITLES: Record<number, string> = {
  1: '新手',
  2: '入门',
  3: '进阶',
  4: '资深',
  5: '大师',
}

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const match = (r: RegExp) => path.match(r)

  if (m === 'GET' && match(/^\/api\/sys\/experience\/users\/(\d+)\/summary$/)) {
    const userId = num(match(/^\/api\/sys\/experience\/users\/(\d+)\/summary$/)![1])
    const user = db.users.find((u: any) => u.id === userId)
    const level = user?.userLevel ?? 1

    const userLogs = (db.experienceLogs || []).filter((i: any) => i.userId === userId)
    const today = now().slice(0, 10)
    const todayLogs = userLogs.filter((i: any) => String(i.createdAt).startsWith(today))
    const todayXp = todayLogs.reduce((s: number, i: any) => s + i.experienceChange, 0)

    const sumBy = (type: string) =>
      userLogs
        .filter((i: any) => i.sourceType === type)
        .reduce((s: number, i: any) => s + i.experienceChange, 0)

    return ok({
      userId,
      username: user?.username ?? '',
      nickname: user?.nickname ?? '',
      level,
      title: LEVEL_TITLES[level] ?? '未知',
      experiencePoints: user?.experiencePoints ?? 0,
      todayXp,
      dailyLoginXp: sumBy('LOGIN'),
      articlePublishXp: sumBy('ARTICLE'),
      commentCreateXp: sumBy('COMMENT'),
      likeGivenXp: sumBy('LIKE'),
      likeReceivedXp: sumBy('LIKE'),
      chatMessageXp: sumBy('CHAT'),
    })
  }

  if (m === 'GET' && path === '/api/sys/experience/logs') {
    let rs = [...(db.experienceLogs || [])]
    if (req.query.userId) rs = rs.filter((i: any) => i.userId === num(req.query.userId))
    if (req.query.sourceType) rs = rs.filter((i: any) => i.sourceType === req.query.sourceType)
    return ok(page(rs, req.query))
  }

  if (m === 'POST' && match(/^\/api\/sys\/experience\/users\/(\d+)\/adjust$/)) {
    const userId = num(match(/^\/api\/sys\/experience\/users\/(\d+)\/adjust$/)![1])
    const user = db.users.find((u: any) => u.id === userId)
    const before = user?.experiencePoints ?? 0
    const change = req.body.newValue ?? 0
    const after = before + change
    const log = {
      id: db.experienceLogs.length + 1,
      userId,
      sourceType: 'ADMIN_ADJUST',
      sourceTypeLabel: '系统调整',
      experienceChange: change,
      experienceBefore: before,
      experienceAfter: after,
      levelBefore: user?.userLevel ?? 1,
      levelAfter: user?.userLevel ?? 1,
      description: req.body.reason ?? '管理员调整',
      createdAt: now(),
    }
    if (!db.experienceLogs) db.experienceLogs = []
    db.experienceLogs.push(log)
    if (user) user.experiencePoints = after
    return ok(null)
  }

  if (m === 'GET' && path === '/api/sys/experience/config') {
    return ok([
      { configKey: 'login_xp', configValue: '10' },
      { configKey: 'article_xp', configValue: '100' },
      { configKey: 'comment_xp', configValue: '20' },
      { configKey: 'like_xp', configValue: '5' },
      { configKey: 'liked_xp', configValue: '8' },
      { configKey: 'check_in_xp', configValue: '15' },
      { configKey: 'chat_xp', configValue: '3' },
      { configKey: 'daily_xp_limit', configValue: '200' },
    ])
  }

  if (m === 'PUT' && path === '/api/sys/experience/config') {
    return ok(null)
  }

  return ok(null, '未匹配到经验值管理接口', 404)
}

export default defineMock([
  { url: '/api/sys/experience/users/:userId/summary', method: 'GET', body: handle },
  { url: '/api/sys/experience/users/:userId/adjust', method: 'POST', body: handle },
  { url: '/api/sys/experience/logs', method: 'GET', body: handle },
  { url: '/api/sys/experience/config', method: ['GET', 'PUT'], body: handle },
])
