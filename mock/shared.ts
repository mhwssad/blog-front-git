import testData, { menusData } from './data'

export const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ')
export const num = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d)
export const ok = (data: any = null, message = '操作成功', code = 200) => ({
  code,
  message,
  timestamp: new Date().toISOString(),
  data,
})
export const cp = <T>(v: T): T => structuredClone(v)
export const has = (v: any, k: any) =>
  !k ||
  String(v ?? '')
    .toLowerCase()
    .includes(String(k).trim().toLowerCase())

export const page = (rs: any[], q: Record<string, any> = {}) => {
  const c = Math.max(1, num(q.current, 1))
  const s = Math.max(1, num(q.size, 10))
  const i = (c - 1) * s
  return {
    total: rs.length,
    current: c,
    size: s,
    pages: Math.max(1, Math.ceil(rs.length / s)),
    records: cp(rs.slice(i, i + s)),
  }
}

export const flat = (ns: any[]): any[] => ns.flatMap(i => [i, ...flat(i.children ?? [])])

export const find = (ns: any[], id: number): any => {
  for (const i of ns) {
    if (i.id === id) return i
    const x = find(i.children ?? [], id)
    if (x) return x
  }
  return null
}

export const del = (ns: any[], id: number): boolean => {
  const x = ns.findIndex(i => i.id === id)
  if (x >= 0) {
    ns.splice(x, 1)
    return true
  }
  return ns.some(i => del(i.children ?? [], id))
}

export const p = (req: any) => new URL(req.url || '/', 'http://mock').pathname

export const menus = menusData.menus
const contentIds = menusData.contentIds
const reviewerMenuIds = menusData.reviewerMenuIds

export const allIds = flat(menus).map(i => i.id)

const seed = cp(testData) as any
seed.roles = seed.roles.map((role: any) => {
  if (role.code === 'admin') return { ...role, menuIds: allIds }
  if (role.code === 'editor') return { ...role, menuIds: contentIds }
  if (role.code === 'reviewer') return { ...role, menuIds: reviewerMenuIds }
  return role
})

export const db: any = {
  ...seed,
  seq: {
    ...seed.seq,
    menu: Math.max(...allIds),
  },
  menus: cp(menus),
}

export const me = (req: any) => {
  const m = String(req.headers?.authorization || '').match(/(\d+)/)
  return db.users.find((i: any) => i.id === Number(m?.[1])) || db.users[0]
}

export function menuFilter(ns: any[], set: Set<number>): any[] {
  return ns
    .filter(i => set.has(i.id))
    .map(({ status: _status, ...i }) => ({ ...i, children: menuFilter(i.children ?? [], set) }))
}

export const perms = (u: any) => {
  const roleCodes = u.roleIds.map(
    (id: number) => db.roles.find((r: any) => r.id === id)?.code
  )
  if (roleCodes.includes('admin')) return ['*:*:*']
  return flat(
    menuFilter(
      db.menus,
      new Set(
        u.roleIds.flatMap((id: number) => db.roles.find((r: any) => r.id === id)?.menuIds || [])
      )
    )
  )
    .filter(i => i.perm)
    .map(i => i.perm)
}

export const ad = (a: any) => ({
  id: a.id,
  title: a.title,
  summary: a.summary,
  coverImage: a.coverImage,
  authorId: a.authorId,
  authorName: a.authorName,
  isTop: a.isTop ?? 0,
  isRecommend: a.isRecommend ?? 0,
  accessLevel: a.accessLevel ?? 0,
  viewCount: a.viewCount ?? 0,
  likeCount: a.likeCount ?? 0,
  commentCount: a.commentCount ?? 0,
  collectCount: a.collectCount ?? 0,
  publishTime: a.publishTime,
})

export const detail = (a: any) => ({
  ...ad(a),
  content: a.content,
  isOriginal: a.isOriginal,
  sourceUrl: a.sourceUrl,
  visibilityScope: a.visibilityScope ?? 0,
  shareCount: a.shareCount ?? 0,
  categories: flat(db.categories).filter(i => a.categoryIds.includes(i.id)),
  tags: db.tags.filter((i: any) => a.tagIds.includes(i.id)),
  liked: db.interactions.some(
    (i: any) => i.targetType === 'article' && i.targetId === a.id && i.actionType === 'like'
  ),
  collected: db.collections.some((i: any) => i.targetType === 'article' && i.targetId === a.id),
  canComment: true,
  seriesList: [],
})

export const toForumSectionVO = (s: any) => ({
  id: s.id,
  name: s.sectionName ?? s.name,
  description: s.description ?? '',
  sortOrder: s.sortOrder ?? 0,
  visibilityScope: s.visibilityScope ?? 0,
  postLevelLimit: s.postLevelLimit ?? 1,
  status: s.status ?? 1,
  createdAt: s.createTime ?? s.createdAt,
  updatedAt: s.updateTime ?? s.updatedAt,
})

export const toForumPostVO = (p: any) => {
  const section = (db.forumSections || []).find((s: any) => s.id === p.sectionId)
  return {
    id: p.id,
    sectionId: p.sectionId,
    sectionName: section?.sectionName ?? section?.name ?? '',
    authorId: p.userId ?? p.authorId,
    authorName: p.nickname ?? p.username ?? p.authorName ?? '',
    title: p.title,
    status: p.status ?? (p.isHidden ? 5 : 1),
    visibilityScope: p.visibilityScope ?? 0,
    isTop: p.isTop ?? 0,
    isEssence: p.isEssence ?? 0,
    viewCount: p.viewCount ?? 0,
    likeCount: p.likeCount ?? 0,
    replyCount: p.replyCount ?? 0,
    collectCount: p.collectCount ?? 0,
    shareCount: p.shareCount ?? 0,
    publishedAt: p.publishedAt ?? (p.isHidden ? null : (p.createTime ?? p.createdAt)),
    createdAt: p.createTime ?? p.createdAt,
    updatedAt: p.updateTime ?? p.updatedAt,
  }
}

export const toForumPostDetailVO = (p: any) => ({
  ...toForumPostVO(p),
  content: p.content ?? '',
  liked: false,
  collected: false,
  canReply: true,
  linkedChannel: null,
})

export const toForumReplyVO = (r: any, idx = 0) => ({
  id: r.id,
  postId: r.postId,
  parentId: r.parentId ?? null,
  rootId: r.rootId ?? null,
  userId: r.userId,
  userName: r.nickname ?? r.username ?? '',
  content: r.content,
  status: r.status ?? (r.isHidden ? 5 : 1),
  floorNo: r.floorNo ?? idx + 1,
  likeCount: r.likeCount ?? 0,
  replyCount: r.replyCount ?? r.children?.length ?? 0,
  createdAt: r.createTime ?? r.createdAt,
  updatedAt: r.updateTime ?? r.updatedAt,
  children: r.children?.map?.((c: any, i: number) => toForumReplyVO(c, i)),
})

export const syncComments = (id: number) => {
  const a = db.articles.find((i: any) => i.id === id)
  if (a)
    a.commentCount = db.comments.filter(
      (i: any) => i.targetType === 'article' && i.targetId === id && i.status === 1
    ).length
}

export const fillArticle = (a: any, b: any) =>
  Object.assign(a, {
    title: b.title,
    summary: b.summary ?? '',
    content: b.content ?? '',
    coverImage: b.coverImage ?? null,
    authorId: b.authorId ?? 1,
    authorName: db.users.find((i: any) => i.id === (b.authorId ?? 1))?.username || 'admin',
    isTop: b.isTop ?? 0,
    isOriginal: b.isOriginal ?? 1,
    sourceUrl: b.sourceUrl ?? null,
    status: b.status ?? 0,
    reviewStatus: b.reviewStatus ?? 1,
    publishTime: (b.status ?? a.status) === 1 ? b.publishTime || a.publishTime || now() : null,
    scheduledPublishTime: b.scheduledPublishTime ?? null,
    accessLevel: b.accessLevel ?? 0,
    visibilityScope: b.visibilityScope ?? 0,
    remark: b.remark ?? null,
    categoryIds: cp(b.categoryIds ?? []),
    tagIds: cp(b.tagIds ?? []),
    accessList: cp(b.accessList ?? []),
    updatedAt: now(),
  })
