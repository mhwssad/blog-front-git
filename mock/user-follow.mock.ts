import { defineMock } from 'vite-plugin-mock-dev-server'
import { db, me, now, num, ok, page } from './shared'

function toFollowUserVO(rel: any) {
  return {
    relationId: rel.relationId,
    userId: rel.followingId,
    username: rel.followingUsername,
    nickname: rel.followingNickname,
    avatar: db.users.find((u: any) => u.id === rel.followingId)?.avatar ?? null,
    isSpecialFollow: rel.isSpecialFollow ?? 0,
    remark: rel.remark ?? null,
    mutualFollow: db.follows.some((f: any) => f.followerId === rel.followingId && f.followingId === rel.followerId && f.followStatus === 1) ? 1 : 0,
    followTime: rel.followTime,
  }
}

function toFanUserVO(rel: any) {
  return {
    relationId: rel.relationId,
    userId: rel.followerId,
    username: rel.followerUsername,
    nickname: rel.followerNickname,
    avatar: db.users.find((u: any) => u.id === rel.followerId)?.avatar ?? null,
    isSpecialFollow: rel.isSpecialFollow ?? 0,
    remark: rel.remark ?? null,
    mutualFollow: db.follows.some((f: any) => f.followerId === rel.followingId && f.followingId === rel.followerId && f.followStatus === 1) ? 1 : 0,
    followTime: rel.followTime,
  }
}

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const u = me(req)
  const match = (r: RegExp) => path.match(r)

  // ==================== 关注用户 ====================
  if (match(/^\/api\/user\/follows\/(\d+)$/) && m === 'POST') {
    const targetId = num(match(/^\/api\/user\/follows\/(\d+)$/)![1])
    if (targetId === u.id) return ok(null, '不能关注自己', 400)
    const target = db.users.find((i: any) => i.id === targetId)
    if (!target || target.status !== 1) return ok(null, '目标用户不存在或已禁用', 404)

    const exist = db.follows.find((i: any) => i.followerId === u.id && i.followingId === targetId)
    if (!exist) {
      db.follows.push({
        relationId: ++db.seq.followRelation,
        followerId: u.id,
        followerUsername: u.username,
        followerNickname: u.nickname,
        followerStatus: 1,
        followerDeletedFlag: 0,
        followingId: targetId,
        followingUsername: target.username,
        followingNickname: target.nickname,
        followingStatus: target.status,
        followingDeletedFlag: 0,
        followStatus: 1,
        isSpecialFollow: 0,
        source: 'web',
        remark: null,
        followTime: now(),
        unfollowTime: null,
        createdAt: now(),
        updatedAt: now(),
      })
    }
    return ok(null)
  }

  // ==================== 取消关注 ====================
  if (match(/^\/api\/user\/follows\/(\d+)$/) && m === 'DELETE') {
    const targetId = num(match(/^\/api\/user\/follows\/(\d+)$/)![1])
    const exist = db.follows.find((i: any) => i.followerId === u.id && i.followingId === targetId && i.followStatus === 1)
    if (exist) {
      exist.followStatus = 0
      exist.unfollowTime = now()
      exist.updatedAt = now()
    }
    return ok(null)
  }

  // ==================== 获取我的关注列表 ====================
  if (m === 'GET' && path === '/api/user/follows') {
    let rs = db.follows.filter((i: any) => i.followerId === u.id && i.followStatus === 1)
    if (req.query.specialOnly === 'true') {
      rs = rs.filter((i: any) => i.isSpecialFollow === 1)
    }
    // 特别关注的优先，然后按关注时间倒序
    rs.sort((a: any, b: any) => {
      if (a.isSpecialFollow !== b.isSpecialFollow) return b.isSpecialFollow - a.isSpecialFollow
      return String(b.followTime).localeCompare(String(a.followTime))
    })
    const paged = page(rs, req.query)
    paged.records = paged.records.map(toFollowUserVO)
    return ok(paged)
  }

  // ==================== 获取我的粉丝列表 ====================
  if (m === 'GET' && path === '/api/user/fans') {
    const rs = db.follows.filter((i: any) => i.followingId === u.id && i.followStatus === 1)
    const paged = page(rs, req.query)
    paged.records = paged.records.map(toFanUserVO)
    return ok(paged)
  }

  // ==================== 查询互关状态 ====================
  if (m === 'GET' && path === '/api/user/follows/mutual') {
    const targetId = num(req.query.targetUserId)
    const following = db.follows.some((i: any) => i.followerId === u.id && i.followingId === targetId && i.followStatus === 1)
    const followedBy = db.follows.some((i: any) => i.followerId === targetId && i.followingId === u.id && i.followStatus === 1)
    return ok({
      targetUserId: targetId,
      following,
      followedBy,
      mutualFollow: following && followedBy,
    })
  }

  // ==================== 查询关注数和粉丝数 ====================
  if (m === 'GET' && path === '/api/user/follows/count') {
    return ok({
      followingCount: db.follows.filter((i: any) => i.followerId === u.id && i.followStatus === 1).length,
      fanCount: db.follows.filter((i: any) => i.followingId === u.id && i.followStatus === 1).length,
    })
  }

  // ==================== 设置特别关注 ====================
  if (match(/^\/api\/user\/follows\/(\d+)\/special$/) && m === 'PUT') {
    const targetId = num(match(/^\/api\/user\/follows\/(\d+)\/special$/)![1])
    const rel = db.follows.find((i: any) => i.followerId === u.id && i.followingId === targetId && i.followStatus === 1)
    if (!rel) return ok(null, '关注关系不存在', 400)
    rel.isSpecialFollow = num(req.body.specialFollow, 0) === 1 ? 1 : 0
    rel.updatedAt = now()
    return ok(null)
  }

  // ==================== 更新关注备注 ====================
  if (match(/^\/api\/user\/follows\/(\d+)\/remark$/) && m === 'PUT') {
    const targetId = num(match(/^\/api\/user\/follows\/(\d+)\/remark$/)![1])
    const rel = db.follows.find((i: any) => i.followerId === u.id && i.followingId === targetId && i.followStatus === 1)
    if (!rel) return ok(null, '关注关系不存在', 400)
    rel.remark = req.body.remark || null
    rel.updatedAt = now()
    return ok(null)
  }

  // ==================== 公开 - 获取指定用户的关注列表 ====================
  const userFollowsMatch = path.match(/^\/api\/users\/(\d+)\/follows$/)
  if (m === 'GET' && userFollowsMatch) {
    const targetId = num(userFollowsMatch[1])
    const rs = db.follows.filter((i: any) => i.followerId === targetId && i.followStatus === 1)
    return ok(page(rs.map((rel: any) => ({
      userId: rel.followingId,
      username: rel.followingUsername,
      nickname: rel.followingNickname,
      avatar: db.users.find((u: any) => u.id === rel.followingId)?.avatar ?? null,
      followTime: rel.followTime,
    })), req.query))
  }

  // ==================== 公开 - 获取指定用户的粉丝列表 ====================
  const userFansMatch = path.match(/^\/api\/users\/(\d+)\/fans$/)
  if (m === 'GET' && userFansMatch) {
    const targetId = num(userFansMatch[1])
    const rs = db.follows.filter((i: any) => i.followingId === targetId && i.followStatus === 1)
    return ok(page(rs.map((rel: any) => ({
      userId: rel.followerId,
      username: rel.followerUsername,
      nickname: rel.followerNickname,
      avatar: db.users.find((u: any) => u.id === rel.followerId)?.avatar ?? null,
      followTime: rel.followTime,
    })), req.query))
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
  { url: '/api/users/:userId/follows', method: 'GET', body: handle },
  { url: '/api/users/:userId/fans', method: 'GET', body: handle },
])
