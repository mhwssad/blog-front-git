import testData, { menusData } from './data'

export const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ')
export const num = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d)
export const ok = (data: any = null, message = '操作成功', code = 200) => ({
  code,
  message,
  data,
  timestamp: Date.now(),
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
    .map(({ status, ...i }) => ({ ...i, children: menuFilter(i.children ?? [], set) }))
}

export const perms = (u: any) =>
  flat(
    menuFilter(
      db.menus,
      new Set(
        u.roleIds.flatMap((id: number) => db.roles.find((r: any) => r.id === id)?.menuIds || [])
      )
    )
  )
    .filter(i => i.perm)
    .map(i => i.perm)

export const ad = (a: any) => ({
  id: a.id,
  title: a.title,
  summary: a.summary,
  coverImage: a.coverImage,
  authorId: a.authorId,
  authorName: a.authorName,
  isTop: a.isTop,
  accessLevel: a.accessLevel,
  viewCount: a.viewCount,
  likeCount: a.likeCount,
  commentCount: a.commentCount,
  collectCount: a.collectCount,
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
