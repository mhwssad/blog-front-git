import { defineMock } from 'vite-plugin-mock-dev-server'
import { db, me, now, num, ok, page } from './shared'

function toFollowUserVO(rel: any) {
  return {
    relationId: rel.relationId,
    userId: rel.followingId,
    username: rel.followingUsername,
    nickname: rel.followingNickname,
    avatar: db.users.find((u: any) => u.id === rel.followingId)?.avatar ?? null,
    isSpecialFollow: rel.isSpecialFollow,
    remark: rel.remark,
    mutualFollow: db.follows.some((f: any) => f.followerId === rel.followingId && f.followingId === rel.followerId && f.followStatus === 1) ? 1 : 0,
    followTime: rel.followTime,
  }
}

function toFanUserVO(rel: any) {
  return {
    userId: rel.followerId,
    username: rel.followerUsername,
    nickname: rel.followerNickname,
    avatar: db.users.find((u: any) => u.id === rel.followerId)?.avatar ?? null,
    followTime: rel.followTime,
  }
}

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const u = me(req)
  const match = (r: RegExp) => path.match(r)

  if (match(/^\/api\/user\/follows\/(\d+)$/) && m === 'POST') {
    const targetId = num(match(/^\/api\/user\/follows\/(\d+)$/)![1])
    const exist = db.follows.find((i: any) => i.followerId === u.id && i.followingId === targetId)
    if (!exist) {
      const target = db.users.find((i: any) => i.id === targetId)
      db.follows.push({ relationId: ++db.seq.followRelation, followerId: u.id, followerUsername: u.username, followerNickname: u.nickname, followerStatus: 1, followerDeletedFlag: 0, followingId: targetId, followingUsername: target?.username ?? '', followingNickname: target?.nickname ?? '', followingStatus: target?.status ?? 1, followingDeletedFlag: 0, followStatus: 1, isSpecialFollow: 0, source: 'web', remark: null, followTime: now(), unfollowTime: null, createdAt: now(), updatedAt: now() })
    }
    return ok(null)
  }

  if (match(/^\/api\/user\/follows\/(\d+)$/) && m === 'DELETE') {
    const targetId = num(match(/^\/api\/user\/follows\/(\d+)$/)![1])
    db.follows = db.follows.filter((i: any) => !(i.followerId === u.id && i.followingId === targetId))
    return ok(null)
  }

  if (m === 'GET' && path === '/api/user/follows') {
    const rs = db.follows.filter((i: any) => i.followerId === u.id && i.followStatus === 1)
    const paged = page(rs, req.query)
    paged.records = paged.records.map(toFollowUserVO)
    return ok(paged)
  }

  if (m === 'GET' && path === '/api/user/fans') {
    const rs = db.follows.filter((i: any) => i.followingId === u.id && i.followStatus === 1)
    const paged = page(rs, req.query)
    paged.records = paged.records.map(toFanUserVO)
    return ok(paged)
  }

  if (m === 'GET' && path === '/api/user/follows/mutual') return ok([])
  if (m === 'GET' && path === '/api/user/follows/count') return ok({ followingCount: db.follows.filter((i: any) => i.followerId === u.id && i.followStatus === 1).length, fanCount: db.follows.filter((i: any) => i.followingId === u.id && i.followStatus === 1).length })

  if (match(/^\/api\/user\/follows\/(\d+)\/special$/) && m === 'PUT') {
    const targetId = num(match(/^\/api\/user\/follows\/(\d+)\/special$/)![1])
    const rel = db.follows.find((i: any) => i.followerId === u.id && i.followingId === targetId)
    if (rel) rel.isSpecialFollow = req.body.specialFollow ?? (rel.isSpecialFollow ? 0 : 1)
    return ok(null)
  }

  if (match(/^\/api\/user\/follows\/(\d+)\/remark$/) && m === 'PUT') {
    const targetId = num(match(/^\/api\/user\/follows\/(\d+)\/remark$/)![1])
    const rel = db.follows.find((i: any) => i.followerId === u.id && i.followingId === targetId)
    if (rel) rel.remark = req.body.remark ?? null
    return ok(null)
  }

  return ok(null, '未匹配到用户关注接口', 404)
}

export default defineMock([
  { url: '/api/user/follows/:userId', method: ['POST', 'DELETE'], body: handle },
  { url: '/api/user/follows', method: 'GET', body: handle },
  { url: '/api/user/fans', method: 'GET', body: handle },
  { url: '/api/user/follows/mutual', method: 'GET', body: handle },
  { url: '/api/user/follows/count', method: 'GET', body: handle },
  { url: '/api/user/follows/:userId/special', method: 'PUT', body: handle },
  { url: '/api/user/follows/:userId/remark', method: 'PUT', body: handle },
])
