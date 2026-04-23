import testData from './test-data.json'

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

export const bid = (id: number, pid: number, name: string, perm: string) => ({
  id,
  parentId: pid,
  name,
  type: 'B',
  sort: id % 10,
  visible: 1,
  status: 1,
  perm,
  routeName: '',
  routePath: '',
  component: null,
  icon: null,
  alwaysShow: 0,
  keepAlive: 0,
  redirect: null,
  params: null,
  children: [],
})

export const mid = (
  id: number,
  pid: number,
  name: string,
  route: string,
  component: string,
  perm: string,
  icon: string,
  bs: any[]
) => ({
  id,
  parentId: pid,
  name,
  type: 'M',
  sort: id % 100,
  visible: 1,
  status: 1,
  routeName: name.replace(/[^a-zA-Z0-9]/g, ''),
  routePath: route,
  component,
  icon,
  alwaysShow: 0,
  keepAlive: 1,
  perm,
  redirect: null,
  params: null,
  children: bs,
})

export const menus = [
  {
    id: 100,
    parentId: 0,
    name: '系统管理',
    type: 'C',
    sort: 10,
    visible: 1,
    status: 1,
    routeName: 'SystemRoot',
    routePath: '/admin/system',
    component: 'layouts/RouteView',
    icon: 'Setting',
    alwaysShow: 1,
    keepAlive: 0,
    perm: null,
    redirect: '/admin/users',
    params: null,
    children: [
      mid(101, 100, '用户管理', '/admin/users', 'admin/user/Users', 'sys:user:query', 'User', [
        bid(1011, 101, '新增', 'sys:user:create'),
        bid(1012, 101, '编辑', 'sys:user:update'),
        bid(1013, 101, '删除', 'sys:user:delete'),
        bid(1014, 101, '分配角色', 'sys:user:assign-role'),
        bid(1015, 101, '重置密码', 'sys:user:reset-password'),
      ]),
      mid(102, 100, '角色管理', '/admin/roles', 'admin/role/Roles', 'sys:role:query', 'Avatar', [
        bid(1021, 102, '新增', 'sys:role:create'),
        bid(1022, 102, '编辑', 'sys:role:update'),
        bid(1023, 102, '删除', 'sys:role:delete'),
        bid(1024, 102, '分配菜单', 'sys:role:assign-menu'),
      ]),
      mid(103, 100, '菜单管理', '/admin/menus', 'admin/menu/Menus', 'sys:menu:query', 'Menu', [
        bid(1031, 103, '新增', 'sys:menu:create'),
        bid(1032, 103, '编辑', 'sys:menu:update'),
        bid(1033, 103, '删除', 'sys:menu:delete'),
      ]),
      mid(
        104,
        100,
        '参数配置',
        '/admin/configs',
        'admin/config/Configs',
        'sys:config:query',
        'Tools',
        [
          bid(1041, 104, '新增', 'sys:config:create'),
          bid(1042, 104, '编辑', 'sys:config:update'),
          bid(1043, 104, '删除', 'sys:config:delete'),
        ]
      ),
      mid(
        105,
        100,
        '通知公告',
        '/admin/notices',
        'admin/notice/Notices',
        'sys:notice:query',
        'Bell',
        [
          bid(1051, 105, '新增', 'sys:notice:create'),
          bid(1052, 105, '编辑', 'sys:notice:update'),
          bid(1053, 105, '发布', 'sys:notice:publish'),
          bid(1054, 105, '撤回', 'sys:notice:revoke'),
          bid(1055, 105, '删除', 'sys:notice:delete'),
        ]
      ),
      mid(106, 100, '操作日志', '/admin/logs', 'admin/log/Logs', 'sys:log:query', 'Document', [
        bid(1061, 106, '详情', 'sys:log:detail'),
        bid(1062, 106, '删除', 'sys:log:delete'),
        bid(1063, 106, '清空', 'sys:log:clean'),
      ]),
    ],
  },
  {
    id: 200,
    parentId: 0,
    name: '内容管理',
    type: 'C',
    sort: 20,
    visible: 1,
    status: 1,
    routeName: 'ContentRoot',
    routePath: '/admin/content',
    component: 'layouts/RouteView',
    icon: 'Reading',
    alwaysShow: 1,
    keepAlive: 0,
    perm: null,
    redirect: '/admin/articles',
    params: null,
    children: [
      mid(
        201,
        200,
        '文章管理',
        '/admin/articles',
        'admin/article/Articles',
        'content:article:query',
        'DocumentCopy',
        [
          bid(2011, 201, '新增', 'content:article:create'),
          bid(2012, 201, '编辑', 'content:article:update'),
          bid(2013, 201, '删除', 'content:article:delete'),
          bid(2014, 201, '访问名单', 'content:article:access'),
        ]
      ),
      mid(
        202,
        200,
        '分类管理',
        '/admin/categories',
        'admin/category/Categories',
        'content:category:query',
        'FolderOpened',
        [
          bid(2021, 202, '新增', 'content:category:create'),
          bid(2022, 202, '编辑', 'content:category:update'),
          bid(2023, 202, '删除', 'content:category:delete'),
        ]
      ),
      mid(203, 200, '标签管理', '/admin/tags', 'admin/tag/Tags', 'content:tag:query', 'PriceTag', [
        bid(2031, 203, '新增', 'content:tag:create'),
        bid(2032, 203, '编辑', 'content:tag:update'),
        bid(2033, 203, '删除', 'content:tag:delete'),
      ]),
      mid(
        204,
        200,
        '评论管理',
        '/admin/comments',
        'admin/comment/Comments',
        'content:comment:query',
        'ChatLineSquare',
        [
          bid(2041, 204, '审核', 'content:comment:update'),
          bid(2042, 204, '删除', 'content:comment:delete'),
        ]
      ),
      mid(
        205,
        200,
        '收藏管理',
        '/admin/collections',
        'admin/collection/Collections',
        'content:collection:query',
        'Star',
        [bid(2051, 205, '删除', 'content:collection:delete')]
      ),
      mid(
        206,
        200,
        '互动记录',
        '/admin/interactions',
        'admin/interaction/Interactions',
        'content:interaction:query',
        'Pointer',
        [bid(2061, 206, '删除', 'content:interaction:delete')]
      ),
      mid(
        207,
        200,
        '关注关系',
        '/admin/follows',
        'admin/follow/Follows',
        'content:follow:query',
        'Connection',
        [bid(2071, 207, '异常清理', 'content:follow:clean')]
      ),
      mid(208, 200, '文件管理', '/admin/files', 'admin/file/Files', 'content:file:query', 'Files', [
        bid(2081, 208, '状态更新', 'content:file:update'),
        bid(2082, 208, '删除', 'content:file:delete'),
      ]),
      mid(
        209,
        200,
        '聊天管理',
        '/admin/chats',
        'admin/chat/Chats',
        'content:chat:query',
        'ChatDotRound',
        [bid(2091, 209, '治理操作', 'content:chat:update')]
      ),
      mid(
        210,
        200,
        '足迹管理',
        '/admin/footprints',
        'admin/footprint/Footprints',
        'content:footprint:query',
        'Clock',
        [bid(2101, 210, '删除/清空', 'content:footprint:delete')]
      )
    ],
  },
]

export const allIds = flat(menus).map(i => i.id)
export const contentIds = [
  200, 201, 2011, 2012, 2013, 2014, 202, 2021, 2022, 2023, 203, 2031, 2032, 2033, 204, 2041, 2042,
  205, 2051, 206, 2061, 207, 2071, 208, 2081, 2082, 209, 2091, 210, 2101,
]

const seed = cp(testData) as any
seed.roles = seed.roles.map((role: any) => {
  if (role.code === 'admin') return { ...role, menuIds: allIds }
  if (role.code === 'editor') return { ...role, menuIds: contentIds }
  if (role.code === 'reviewer')
    return { ...role, menuIds: [200, 204, 2041, 2042, 205, 2051, 206, 2061, 207, 2071, 210, 2101] }
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
    .filter(i => i.type === 'B' && i.perm)
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
  shareCount: a.shareCount,
  categories: flat(db.categories).filter(i => a.categoryIds.includes(i.id)),
  tags: db.tags.filter((i: any) => a.tagIds.includes(i.id)),
  liked: db.interactions.some(
    (i: any) => i.targetType === 'article' && i.targetId === a.id && i.actionType === 'like'
  ),
  collected: db.collections.some((i: any) => i.targetType === 'article' && i.targetId === a.id),
  canComment: true,
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
    publishTime: (b.status ?? a.status) === 1 ? b.publishTime || a.publishTime || now() : null,
    accessLevel: b.accessLevel ?? 0,
    remark: b.remark ?? null,
    categoryIds: cp(b.categoryIds ?? []),
    tagIds: cp(b.tagIds ?? []),
    accessList: cp(b.accessList ?? []),
    updatedAt: now(),
  })
