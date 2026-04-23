import { defineMock } from 'vite-plugin-mock-dev-server'
import { db, has, num, ok, p, page } from './shared'

function handle(req: any) {
  const method = String(req.method).toUpperCase()
  const path = p(req)

  if (method === 'GET' && path === '/api/sys/follows') {
    let records = [...db.follows]

    if (req.query.followerId) records = records.filter((item: any) => item.followerId === num(req.query.followerId))
    if (req.query.followingId) records = records.filter((item: any) => item.followingId === num(req.query.followingId))
    if (req.query.followStatus !== undefined && req.query.followStatus !== '') records = records.filter((item: any) => item.followStatus === num(req.query.followStatus))
    if (req.query.specialFollow !== undefined && req.query.specialFollow !== '') records = records.filter((item: any) => item.isSpecialFollow === num(req.query.specialFollow))
    if (req.query.source) records = records.filter((item: any) => has(item.source, req.query.source))
    if (req.query.keyword) records = records.filter((item: any) => has(item.followerUsername, req.query.keyword) || has(item.followerNickname, req.query.keyword) || has(item.followingUsername, req.query.keyword) || has(item.followingNickname, req.query.keyword) || has(item.remark, req.query.keyword))

    return ok(page(records, req.query))
  }

  if (method === 'DELETE' && path === '/api/sys/follows/clean') {
    const payload = req.body || {}
    const before = db.follows.length

    db.follows = db.follows.filter((item: any) => {
      const inactive = payload.cleanInactive && (item.followStatus !== 1 || item.unfollowTime)
      const deletedUsers = payload.cleanDeletedUsers && (item.followerDeletedFlag === 1 || item.followingDeletedFlag === 1)
      const disabledUsers = payload.cleanDisabledUsers && (item.followerStatus === 0 || item.followingStatus === 0)
      return !(inactive || deletedUsers || disabledUsers)
    })

    return ok(before - db.follows.length)
  }

  return ok(null, '未匹配到关注关系后台接口', 404)
}

export default defineMock([
  { url: '/api/sys/follows', method: 'GET', body: handle },
  { url: '/api/sys/follows/clean', method: 'DELETE', body: handle },
])
