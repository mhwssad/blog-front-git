import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, has, now, num, ok, page } from './shared'

function toSectionVo(raw: any) {
  const createdAt = raw.createdAt ?? raw.createTime ?? now()
  const updatedAt = raw.updatedAt ?? raw.updateTime ?? createdAt
  return {
    id: raw.id,
    name: raw.name ?? raw.sectionName ?? '',
    description: raw.description ?? '',
    sortOrder: num(raw.sortOrder, 0),
    visibilityScope: num(raw.visibilityScope, 0),
    postLevelLimit: num(raw.postLevelLimit, 1),
    status: num(raw.status, 1),
    createdAt,
    updatedAt,
  }
}

function sectionStatusName(status: number): string {
  return status === 0 ? '禁用' : '启用'
}

function postStatusName(status: number): string {
  if (status === 0) return '草稿'
  if (status === 5) return '隐藏'
  return '已发布'
}

function replyStatusName(status: number): string {
  if (status === 2) return '隐藏'
  if (status === 3) return '删除'
  return '正常'
}

function getSectionName(sectionId: number): string {
  const section = (db.forumSections || []).find((item: any) => item.id === sectionId)
  return section?.name ?? section?.sectionName ?? '-'
}

function getUserById(userId: number): any {
  return (db.users || []).find((item: any) => item.id === userId)
}

function toPostVo(raw: any) {
  const createdAt = raw.createdAt ?? raw.createTime ?? now()
  const updatedAt = raw.updatedAt ?? raw.updateTime ?? createdAt
  const status = raw.status !== undefined ? num(raw.status, 1) : raw.isHidden === 1 ? 5 : 1
  const author = getUserById(num(raw.authorId ?? raw.userId, 0))
  return {
    id: raw.id,
    sectionId: num(raw.sectionId, 0),
    sectionName: raw.sectionName ?? getSectionName(num(raw.sectionId, 0)),
    authorId: num(raw.authorId ?? raw.userId ?? author?.id, 0),
    authorName:
      raw.authorName ?? raw.nickname ?? raw.username ?? author?.nickname ?? author?.username ?? '-',
    title: raw.title ?? '',
    content: raw.content ?? '',
    status,
    statusName: raw.statusName ?? postStatusName(status),
    visibilityScope: num(raw.visibilityScope, 0),
    isTop: num(raw.isTop, 0),
    isEssence: num(raw.isEssence, 0),
    viewCount: num(raw.viewCount, 0),
    likeCount: num(raw.likeCount, 0),
    replyCount: num(raw.replyCount, 0),
    collectCount: num(raw.collectCount, 0),
    shareCount: num(raw.shareCount, 0),
    publishedAt: raw.publishedAt ?? raw.publishTime ?? createdAt,
    createdAt,
    updatedAt,
  }
}

function toReplyVo(raw: any, index = 0) {
  const createdAt = raw.createdAt ?? raw.createTime ?? now()
  const updatedAt = raw.updatedAt ?? raw.updateTime ?? createdAt
  const status = raw.status !== undefined ? num(raw.status, 1) : raw.isHidden === 1 ? 2 : 1
  const author = getUserById(num(raw.userId, 0))
  const post = (db.forumPosts || []).find((item: any) => item.id === num(raw.postId, 0))
  return {
    id: raw.id,
    postId: num(raw.postId, 0),
    postTitle: raw.postTitle ?? post?.title ?? '-',
    parentId: raw.parentId ?? 0,
    rootId: raw.rootId ?? 0,
    userId: num(raw.userId ?? author?.id, 0),
    userName: raw.userName ?? raw.nickname ?? raw.username ?? author?.nickname ?? author?.username ?? '-',
    content: raw.content ?? '',
    status,
    statusName: raw.statusName ?? replyStatusName(status),
    floorNo: num(raw.floorNo, index + 1),
    likeCount: num(raw.likeCount, 0),
    replyCount: num(raw.replyCount, 0),
    createdAt,
    updatedAt,
  }
}

function findSection(id: number) {
  return (db.forumSections || []).find((item: any) => item.id === id)
}

function findPost(id: number) {
  return (db.forumPosts || []).find((item: any) => item.id === id)
}

function findReply(id: number) {
  return (db.forumReplies || []).find((item: any) => item.id === id)
}

function resolveToggleValue(value: any, fallback: number): number {
  if (value === undefined || value === null || value === '') return fallback
  if (typeof value === 'boolean') return value ? 1 : 0
  const text = String(value).toLowerCase()
  if (text === 'true' || text === '1') return 1
  if (text === 'false' || text === '0') return 0
  return num(value, fallback)
}

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const match = (r: RegExp) => path.match(r)

  // ==================== 版块管理 ====================

  if (m === 'GET' && path === '/api/sys/forum/sections') {
    let rs = [...(db.forumSections || [])]
    if (req.query.keyword) {
      rs = rs.filter((item: any) => has(item.name ?? item.sectionName, req.query.keyword) || has(item.description, req.query.keyword))
    }
    if (req.query.status !== undefined && req.query.status !== '') {
      rs = rs.filter((item: any) => num(item.status, 1) === num(req.query.status))
    }
    if (req.query.visibilityScope !== undefined && req.query.visibilityScope !== '') {
      rs = rs.filter((item: any) => num(item.visibilityScope, 0) === num(req.query.visibilityScope))
    }
    rs = rs.sort((a: any, b: any) => num(a.sortOrder, 0) - num(b.sortOrder, 0))
    return ok(page(rs.map(toSectionVo), req.query))
  }

  if (m === 'POST' && path === '/api/sys/forum/sections') {
    const createdAt = now()
    const raw = {
      id: ++db.seq.forumSection,
      name: req.body.name ?? req.body.sectionName ?? '',
      sectionName: req.body.name ?? req.body.sectionName ?? '',
      description: req.body.description ?? '',
      sortOrder: req.body.sortOrder ?? 0,
      visibilityScope: req.body.visibilityScope ?? 0,
      postLevelLimit: req.body.postLevelLimit ?? 1,
      status: req.body.status ?? 1,
      createdAt,
      updatedAt: createdAt,
      createTime: createdAt,
      updateTime: createdAt,
      icon: req.body.icon ?? '',
      postCount: 0,
    }
    db.forumSections.push(raw)
    return ok(cp(toSectionVo(raw)))
  }

  if (m === 'GET' && match(/^\/api\/sys\/forum\/sections\/(\d+)$/)) {
    const id = num(match(/^\/api\/sys\/forum\/sections\/(\d+)$/)![1])
    const x = findSection(id)
    return x ? ok(cp(toSectionVo(x))) : ok(null, '版块不存在', 404)
  }

  if (m === 'PUT' && match(/^\/api\/sys\/forum\/sections\/(\d+)$/)) {
    const id = num(match(/^\/api\/sys\/forum\/sections\/(\d+)$/)![1])
    const x = findSection(id)
    if (!x) return ok(null, '版块不存在', 404)
    Object.assign(x, {
      name: req.body.name ?? req.body.sectionName ?? x.name ?? x.sectionName,
      sectionName: req.body.name ?? req.body.sectionName ?? x.sectionName ?? x.name,
      description: req.body.description ?? x.description ?? '',
      sortOrder: req.body.sortOrder ?? x.sortOrder ?? 0,
      visibilityScope: req.body.visibilityScope ?? x.visibilityScope ?? 0,
      postLevelLimit: req.body.postLevelLimit ?? x.postLevelLimit ?? 1,
      status: req.body.status ?? x.status ?? 1,
      updatedAt: now(),
      updateTime: now(),
    })
    return ok(cp(toSectionVo(x)))
  }

  if (m === 'PUT' && match(/^\/api\/sys\/forum\/sections\/(\d+)\/status$/)) {
    const id = num(match(/^\/api\/sys\/forum\/sections\/(\d+)\/status$/)![1])
    const x = findSection(id)
    if (!x) return ok(null, '版块不存在', 404)
    const status = req.body.status ?? x.status ?? 1
    x.status = status
    x.updatedAt = now()
    x.updateTime = x.updatedAt
    return ok(null)
  }

  if (m === 'DELETE' && match(/^\/api\/sys\/forum\/sections\/(\d+)$/)) {
    const id = num(match(/^\/api\/sys\/forum\/sections\/(\d+)$/)![1])
    if ((db.forumPosts || []).some((item: any) => num(item.sectionId, 0) === id)) {
      return ok(null, '版块已有帖子无法删除', 40011)
    }
    db.forumSections = (db.forumSections || []).filter((item: any) => item.id !== id)
    return ok(null)
  }

  // ==================== 帖子管理 ====================

  if (m === 'GET' && path === '/api/sys/forum/posts') {
    let rs = [...(db.forumPosts || [])]
    if (req.query.keyword) {
      rs = rs.filter((item: any) =>
        has(item.title, req.query.keyword) ||
        has(item.content, req.query.keyword) ||
        has(item.username ?? item.authorName, req.query.keyword) ||
        has(item.nickname, req.query.keyword),
      )
    }
    if (req.query.sectionId !== undefined && req.query.sectionId !== '') {
      rs = rs.filter((item: any) => num(item.sectionId, 0) === num(req.query.sectionId))
    }
    if (req.query.authorId !== undefined && req.query.authorId !== '') {
      rs = rs.filter((item: any) => num(item.authorId ?? item.userId, 0) === num(req.query.authorId))
    }
    if (req.query.status !== undefined && req.query.status !== '') {
      rs = rs.filter((item: any) => toPostVo(item).status === num(req.query.status))
    }
    if (req.query.isTop !== undefined && req.query.isTop !== '') {
      rs = rs.filter((item: any) => num(item.isTop, 0) === num(req.query.isTop))
    }
    if (req.query.isEssence !== undefined && req.query.isEssence !== '') {
      rs = rs.filter((item: any) => num(item.isEssence, 0) === num(req.query.isEssence))
    }
    if (req.query.createdAtStart) {
      rs = rs.filter((item: any) => String(item.createdAt ?? item.createTime ?? '') >= String(req.query.createdAtStart))
    }
    if (req.query.createdAtEnd) {
      rs = rs.filter((item: any) => String(item.createdAt ?? item.createTime ?? '') <= String(req.query.createdAtEnd))
    }
    rs = rs.sort((a: any, b: any) => String(b.createdAt ?? b.createTime ?? '').localeCompare(String(a.createdAt ?? a.createTime ?? '')))
    return ok(page(rs.map(toPostVo), req.query))
  }

  if (m === 'GET' && match(/^\/api\/sys\/forum\/posts\/(\d+)$/)) {
    const id = num(match(/^\/api\/sys\/forum\/posts\/(\d+)$/)![1])
    const x = findPost(id)
    return x ? ok(cp(toPostVo(x))) : ok(null, '帖子不存在', 404)
  }

  if (m === 'PUT' && match(/^\/api\/sys\/forum\/posts\/(\d+)\/hide$/)) {
    const id = num(match(/^\/api\/sys\/forum\/posts\/(\d+)\/hide$/)![1])
    const x = findPost(id)
    if (!x) return ok(null, '帖子不存在', 404)
    x.isHidden = 1
    x.status = 5
    x.updatedAt = now()
    x.updateTime = x.updatedAt
    return ok(null)
  }

  if (m === 'PUT' && match(/^\/api\/sys\/forum\/posts\/(\d+)\/restore$/)) {
    const id = num(match(/^\/api\/sys\/forum\/posts\/(\d+)\/restore$/)![1])
    const x = findPost(id)
    if (!x) return ok(null, '帖子不存在', 404)
    x.isHidden = 0
    x.status = 1
    x.updatedAt = now()
    x.updateTime = x.updatedAt
    return ok(null)
  }

  if (m === 'PUT' && match(/^\/api\/sys\/forum\/posts\/(\d+)\/top$/)) {
    const id = num(match(/^\/api\/sys\/forum\/posts\/(\d+)\/top$/)![1])
    const x = findPost(id)
    if (!x) return ok(null, '帖子不存在', 404)
    const enabled = resolveToggleValue(req.query.enabled ?? req.body.enabled ?? req.body.isTop, x.isTop ? 1 : 0)
    x.isTop = enabled
    x.updatedAt = now()
    x.updateTime = x.updatedAt
    return ok(null)
  }

  if (m === 'PUT' && match(/^\/api\/sys\/forum\/posts\/(\d+)\/essence$/)) {
    const id = num(match(/^\/api\/sys\/forum\/posts\/(\d+)\/essence$/)![1])
    const x = findPost(id)
    if (!x) return ok(null, '帖子不存在', 404)
    const enabled = resolveToggleValue(req.query.enabled ?? req.body.enabled ?? req.body.isEssence, x.isEssence ? 1 : 0)
    x.isEssence = enabled
    x.updatedAt = now()
    x.updateTime = x.updatedAt
    return ok(null)
  }

  if (m === 'DELETE' && match(/^\/api\/sys\/forum\/posts\/(\d+)$/)) {
    const id = num(match(/^\/api\/sys\/forum\/posts\/(\d+)$/)![1])
    const existed = findPost(id)
    if (!existed) return ok(null, '帖子不存在', 404)
    db.forumPosts = (db.forumPosts || []).filter((item: any) => item.id !== id)
    return ok(null)
  }

  // ==================== 回复管理 ====================

  if (m === 'GET' && path === '/api/sys/forum/replies') {
    let rs = [...(db.forumReplies || [])]
    if (req.query.keyword) {
      rs = rs.filter((item: any) =>
        has(item.content, req.query.keyword) ||
        has(item.userName ?? item.username ?? item.nickname, req.query.keyword) ||
        has((db.forumPosts || []).find((post: any) => post.id === num(item.postId, 0))?.title, req.query.keyword),
      )
    }
    if (req.query.postId !== undefined && req.query.postId !== '') {
      rs = rs.filter((item: any) => num(item.postId, 0) === num(req.query.postId))
    }
    if (req.query.userId !== undefined && req.query.userId !== '') {
      rs = rs.filter((item: any) => num(item.userId, 0) === num(req.query.userId))
    }
    if (req.query.status !== undefined && req.query.status !== '') {
      rs = rs.filter((item: any) => toReplyVo(item).status === num(req.query.status))
    }
    rs = rs.sort((a: any, b: any) => String(b.createdAt ?? b.createTime ?? '').localeCompare(String(a.createdAt ?? a.createTime ?? '')))
    return ok(page(rs.map((item: any, index: number) => toReplyVo(item, index)), req.query))
  }

  if (m === 'PUT' && match(/^\/api\/sys\/forum\/replies\/(\d+)\/hide$/)) {
    const id = num(match(/^\/api\/sys\/forum\/replies\/(\d+)\/hide$/)![1])
    const x = findReply(id)
    if (!x) return ok(null, '回复不存在', 404)
    x.isHidden = 1
    x.status = 2
    x.updatedAt = now()
    x.updateTime = x.updatedAt
    return ok(null)
  }

  if (m === 'PUT' && match(/^\/api\/sys\/forum\/replies\/(\d+)\/restore$/)) {
    const id = num(match(/^\/api\/sys\/forum\/replies\/(\d+)\/restore$/)![1])
    const x = findReply(id)
    if (!x) return ok(null, '回复不存在', 404)
    x.isHidden = 0
    x.status = 1
    x.updatedAt = now()
    x.updateTime = x.updatedAt
    return ok(null)
  }

  if (m === 'DELETE' && match(/^\/api\/sys\/forum\/replies\/(\d+)$/)) {
    const id = num(match(/^\/api\/sys\/forum\/replies\/(\d+)$/)![1])
    const existed = findReply(id)
    if (!existed) return ok(null, '回复不存在', 404)
    db.forumReplies = (db.forumReplies || []).filter((item: any) => item.id !== id)
    return ok(null)
  }

  return ok(null, '未匹配到论坛管理接口', 404)
}

export default defineMock([
  { url: '/api/sys/forum/sections', method: ['GET', 'POST'], body: handle },
  { url: '/api/sys/forum/sections/:id', method: ['GET', 'PUT', 'DELETE'], body: handle },
  { url: '/api/sys/forum/sections/:id/status', method: 'PUT', body: handle },
  { url: '/api/sys/forum/posts', method: 'GET', body: handle },
  { url: '/api/sys/forum/posts/:id', method: ['GET', 'DELETE'], body: handle },
  { url: '/api/sys/forum/posts/:id/hide', method: 'PUT', body: handle },
  { url: '/api/sys/forum/posts/:id/restore', method: 'PUT', body: handle },
  { url: '/api/sys/forum/posts/:id/top', method: 'PUT', body: handle },
  { url: '/api/sys/forum/posts/:id/essence', method: 'PUT', body: handle },
  { url: '/api/sys/forum/replies', method: 'GET', body: handle },
  { url: '/api/sys/forum/replies/:id/hide', method: 'PUT', body: handle },
  { url: '/api/sys/forum/replies/:id/restore', method: 'PUT', body: handle },
  { url: '/api/sys/forum/replies/:id', method: 'DELETE', body: handle },
])
