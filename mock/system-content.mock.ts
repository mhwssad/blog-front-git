import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, detail, fillArticle, find, has, now, num, ok, p, page, syncComments } from './shared'

function filterFootprints(query: Record<string, any> = {}) {
  return db.footprints.filter((item: any) => {
    if (query.userId && item.userId !== num(query.userId)) return false
    if (query.targetId && item.targetId !== num(query.targetId)) return false
    if (query.targetType && item.targetType !== query.targetType) return false
    if (query.visitedAtStart && String(item.visitedAt) < String(query.visitedAtStart)) return false
    if (query.visitedAtEnd && String(item.visitedAt) > String(query.visitedAtEnd)) return false
    return true
  })
}

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = p(req)
  const match = (r: RegExp) => path.match(r)

  if (m === 'GET' && path === '/api/sys/articles') {
    let rs = [...db.articles]
    if (req.query.keyword) rs = rs.filter((i: any) => has(i.title, req.query.keyword) || has(i.summary, req.query.keyword))
    if (req.query.authorId) rs = rs.filter((i: any) => i.authorId === num(req.query.authorId))
    if (req.query.status !== undefined && req.query.status !== '') rs = rs.filter((i: any) => i.status === num(req.query.status))
    if (req.query.accessLevel !== undefined && req.query.accessLevel !== '') rs = rs.filter((i: any) => i.accessLevel === num(req.query.accessLevel))
    if (req.query.categoryId) rs = rs.filter((i: any) => i.categoryIds.includes(num(req.query.categoryId)))
    if (req.query.tagId) rs = rs.filter((i: any) => i.tagIds.includes(num(req.query.tagId)))
    if (req.query.isTop !== undefined && req.query.isTop !== '') rs = rs.filter((i: any) => i.isTop === num(req.query.isTop))
    return ok(page(rs, req.query))
  }

  if (m === 'GET' && match(/^\/api\/sys\/articles\/(\d+)$/)) {
    const x = db.articles.find((i: any) => i.id === num(match(/^\/api\/sys\/articles\/(\d+)$/)![1]))
    return x ? ok(cp(x)) : ok(null, '文章不存在', 404)
  }

  if (m === 'GET' && path === '/api/sys/categories/tree') return ok(cp(db.categories))

  if (m === 'GET' && match(/^\/api\/sys\/categories\/(\d+)$/)) {
    const x = find(db.categories, num(match(/^\/api\/sys\/categories\/(\d+)$/)![1]))
    return x ? ok(cp(x)) : ok(null, '分类不存在', 404)
  }

  if (m === 'GET' && path === '/api/sys/tags') return ok(cp(db.tags))

  if (m === 'GET' && match(/^\/api\/sys\/tags\/(\d+)$/)) {
    const x = db.tags.find((i: any) => i.id === num(match(/^\/api\/sys\/tags\/(\d+)$/)![1]))
    return x ? ok(cp(x)) : ok(null, '标签不存在', 404)
  }

  if (m === 'GET' && path === '/api/sys/comments') {
    let rs = [...db.comments]
    if (req.query.targetId) rs = rs.filter((i: any) => i.targetId === num(req.query.targetId))
    if (req.query.targetType) rs = rs.filter((i: any) => i.targetType === req.query.targetType)
    if (req.query.userId) rs = rs.filter((i: any) => i.userId === num(req.query.userId))
    if (req.query.parentId !== undefined && req.query.parentId !== '') rs = rs.filter((i: any) => i.parentId === num(req.query.parentId))
    if (req.query.status !== undefined && req.query.status !== '') rs = rs.filter((i: any) => i.status === num(req.query.status))
    return ok(page(rs, req.query))
  }

  if (m === 'GET' && match(/^\/api\/sys\/comments\/(\d+)$/)) {
    const x = db.comments.find((i: any) => i.id === num(match(/^\/api\/sys\/comments\/(\d+)$/)![1]))
    return x ? ok(cp(x)) : ok(null, '评论不存在', 404)
  }

  if (m === 'GET' && path === '/api/sys/collections/folders') return ok(page(db.folders, req.query))
  if (m === 'GET' && path === '/api/sys/collections') return ok(page(db.collections, req.query))
  if (match(/^\/api\/sys\/collections\/(\d+)$/) && m === 'DELETE') {
    db.collections = db.collections.filter((i: any) => i.id !== num(match(/^\/api\/sys\/collections\/(\d+)$/)![1]))
    return ok(null)
  }
  if (m === 'GET' && path === '/api/sys/interactions') {
    const rs = db.interactions.map((i: any) => {
      const u = db.users.find((u: any) => u.id === i.userId)
      let targetTitle = ''
      if (i.targetType === 'article') {
        const a = db.articles.find((a: any) => a.id === i.targetId)
        targetTitle = a?.title ?? ''
      } else if (i.targetType === 'comment') {
        const c = db.comments.find((c: any) => c.id === i.targetId)
        targetTitle = c ? c.content?.slice(0, 30) : ''
      }
      return { ...i, userNickname: u?.nickname ?? '', userAvatar: u?.avatar ?? '', targetTitle }
    })
    return ok(page(rs, req.query))
  }
  if (match(/^\/api\/sys\/interactions\/(\d+)$/) && m === 'DELETE') {
    db.interactions = db.interactions.filter((i: any) => i.id !== num(match(/^\/api\/sys\/interactions\/(\d+)$/)![1]))
    return ok(null)
  }
  if (m === 'GET' && path === '/api/sys/footprints') return ok(page(filterFootprints(req.query), req.query))

  if (m === 'POST' && path === '/api/sys/articles') {
    const a = { id: ++db.seq.article, viewCount: 0, likeCount: 0, commentCount: 0, collectCount: 0, shareCount: 0, createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '), updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '), authorName: 'admin', categoryIds: [], tagIds: [], accessList: [] }
    fillArticle(a, req.body)
    db.articles.unshift(a)
    return ok(null)
  }

  if (match(/^\/api\/sys\/articles\/(\d+)\/status$/) && m === 'PUT') {
    const a = db.articles.find((i: any) => i.id === num(match(/^\/api\/sys\/articles\/(\d+)\/status$/)![1]))
    if (a) {
      a.status = req.body.status ?? a.status
      a.publishTime = a.status === 1 ? a.publishTime || new Date().toISOString().slice(0, 19).replace('T', ' ') : null
    }
    return ok(null)
  }

  if (match(/^\/api\/sys\/articles\/(\d+)\/access$/) && m === 'PUT') {
    const a = db.articles.find((i: any) => i.id === num(match(/^\/api\/sys\/articles\/(\d+)\/access$/)![1]))
    if (a) a.accessList = cp(req.body.accessList ?? [])
    return ok(null)
  }

  if (match(/^\/api\/sys\/articles\/(\d+)\/top$/) && m === 'PUT') {
    const a = db.articles.find((i: any) => i.id === num(match(/^\/api\/sys\/articles\/(\d+)\/top$/)![1]))
    if (a) a.isTop = req.body.isTop ?? (a.isTop ? 0 : 1)
    return ok(null)
  }

  if (match(/^\/api\/sys\/articles\/(\d+)\/recommend$/) && m === 'PUT') {
    const a = db.articles.find((i: any) => i.id === num(match(/^\/api\/sys\/articles\/(\d+)\/recommend$/)![1]))
    return ok(null)
  }

  if (m === 'GET' && path === '/api/sys/article-reviews') {
    let rs = db.articles.filter((i: any) => i.reviewStatus !== undefined)
    if (req.query.reviewStatus !== undefined && req.query.reviewStatus !== '') rs = rs.filter((i: any) => i.reviewStatus === num(req.query.reviewStatus))
    if (req.query.authorId) rs = rs.filter((i: any) => i.authorId === num(req.query.authorId))
    if (req.query.keyword) rs = rs.filter((i: any) => has(i.title, req.query.keyword))
    const reviews = rs.map((a: any) => ({
      id: a.id,
      articleId: a.id,
      title: a.title,
      authorId: a.authorId,
      authorName: a.authorName,
      reviewStatus: a.reviewStatus,
      reviewerId: 1,
      reviewerName: 'admin',
      reviewComment: null,
      reviewTime: a.status === 1 ? a.publishTime : null,
      createTime: a.createdAt,
      updateTime: a.updatedAt,
    }))
    return ok(page(reviews, req.query))
  }

  if (m === 'GET' && match(/^\/api\/sys\/article-reviews\/(\d+)$/)) {
    const a = db.articles.find((i: any) => i.id === num(match(/^\/api\/sys\/article-reviews\/(\d+)$/)![1]))
    if (!a) return ok(null, '审核记录不存在', 404)
    return ok({
      id: a.id,
      articleId: a.id,
      title: a.title,
      content: a.content,
      summary: a.summary,
      authorId: a.authorId,
      authorName: a.authorName,
      reviewStatus: a.reviewStatus,
      reviewerId: 1,
      reviewerName: 'admin',
      reviewComment: null,
      reviewTime: a.status === 1 ? a.publishTime : null,
      reviewLogs: a.reviewStatus !== undefined ? [{ actionType: 'submit', fromReviewStatus: 0, toReviewStatus: a.reviewStatus, operatorUsername: 'system', reviewComment: '初始状态', createTime: a.createdAt }] : [],
      createTime: a.createdAt,
      updateTime: a.updatedAt,
    })
  }

  if (match(/^\/api\/sys\/article-reviews\/(\d+)\/approve$/) && m === 'PUT') {
    const a = db.articles.find((i: any) => i.id === num(match(/^\/api\/sys\/article-reviews\/(\d+)\/approve$/)![1]))
    if (a) { a.reviewStatus = 1; a.status = 1; a.publishTime = a.publishTime || now() }
    return ok(null)
  }

  if (match(/^\/api\/sys\/article-reviews\/(\d+)\/reject$/) && m === 'PUT') {
    const a = db.articles.find((i: any) => i.id === num(match(/^\/api\/sys\/article-reviews\/(\d+)\/reject$/)![1]))
    if (a) a.reviewStatus = 3
    return ok(null)
  }

  if (match(/^\/api\/sys\/article-reviews\/(\d+)\/repair-status$/) && m === 'PUT') {
    const a = db.articles.find((i: any) => i.id === num(match(/^\/api\/sys\/article-reviews\/(\d+)\/repair-status$/)![1]))
    if (a) a.reviewStatus = req.body.targetStatus ?? a.reviewStatus
    return ok(null)
  }

  if (match(/^\/api\/sys\/articles\/(\d+)$/)) {
    const a = db.articles.find((i: any) => i.id === num(match(/^\/api\/sys\/articles\/(\d+)$/)![1]))
    if (!a) return ok(null, '文章不存在', 404)
    if (m === 'PUT') {
      fillArticle(a, req.body)
      return ok(null)
    }
    if (m === 'DELETE') {
      db.articles = db.articles.filter((i: any) => i.id !== a.id)
      return ok(null)
    }
  }

  if (m === 'POST' && path === '/api/sys/categories') {
    const t = { id: ++db.seq.category, parentId: req.body.parentId ?? 0, name: req.body.name, code: req.body.code, type: req.body.type || 'article', level: 1, sortOrder: req.body.sortOrder ?? 10, icon: req.body.icon ?? null, description: req.body.description ?? null, status: req.body.status ?? 1, createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '), updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '), children: [] }
    if (t.parentId === 0) db.categories.push(t)
    else {
      const q = find(db.categories, t.parentId)
      t.level = (q.level ?? 1) + 1
      ;(q.children || (q.children = [])).push(t)
    }
    return ok(null)
  }

  if (match(/^\/api\/sys\/categories\/(\d+)\/status$/) && m === 'PUT') {
    const t = find(db.categories, num(match(/^\/api\/sys\/categories\/(\d+)\/status$/)![1]))
    if (t) t.status = req.body.status ?? t.status
    return ok(null)
  }

  if (match(/^\/api\/sys\/categories\/(\d+)$/)) {
    const t = find(db.categories, num(match(/^\/api\/sys\/categories\/(\d+)$/)![1]))
    if (!t) return ok(null, '分类不存在', 404)
    if (m === 'PUT') {
      Object.assign(t, req.body, { updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ') })
      return ok(null)
    }
    if (m === 'DELETE') {
      const remove = (ns: any[], id: number): boolean => {
        const idx = ns.findIndex(i => i.id === id)
        if (idx >= 0) {
          ns.splice(idx, 1)
          return true
        }
        return ns.some(i => remove(i.children ?? [], id))
      }
      remove(db.categories, t.id)
      return ok(null)
    }
  }

  if (m === 'POST' && path === '/api/sys/tags') {
    db.tags.push({ id: ++db.seq.tag, name: req.body.name, color: req.body.color ?? '#409eff', createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ') })
    return ok(null)
  }

  if (match(/^\/api\/sys\/tags\/(\d+)$/)) {
    const t = db.tags.find((i: any) => i.id === num(match(/^\/api\/sys\/tags\/(\d+)$/)![1]))
    if (!t) return ok(null, '标签不存在', 404)
    if (m === 'PUT') {
      Object.assign(t, req.body)
      return ok(null)
    }
    if (m === 'DELETE') {
      db.tags = db.tags.filter((i: any) => i.id !== t.id)
      return ok(null)
    }
  }

  if (match(/^\/api\/sys\/comments\/(\d+)\/status$/) && m === 'PUT') {
    const t = db.comments.find((i: any) => i.id === num(match(/^\/api\/sys\/comments\/(\d+)\/status$/)![1]))
    if (t) {
      t.status = req.body.status ?? t.status
      syncComments(t.targetId)
    }
    return ok(null)
  }

  if (match(/^\/api\/sys\/comments\/(\d+)$/) && m === 'DELETE') {
    const t = db.comments.find((i: any) => i.id === num(match(/^\/api\/sys\/comments\/(\d+)$/)![1]))
    if (t) {
      db.comments = db.comments.filter((i: any) => i.id !== t.id)
      syncComments(t.targetId)
    }
    return ok(null)
  }


  if (match(/^\/api\/sys\/footprints\/(\d+)$/) && m === 'DELETE') {
    const id = num(match(/^\/api\/sys\/footprints\/(\d+)$/)![1])
    db.footprints = db.footprints.filter((item: any) => item.id !== id)
    return ok(null)
  }

  if (m === 'DELETE' && path === '/api/sys/footprints') {
    const matchedIds = new Set(filterFootprints(req.query).map((item: any) => item.id))
    db.footprints = db.footprints.filter((item: any) => !matchedIds.has(item.id))
    return ok(null)
  }
  return ok(null, '未匹配到系统内容接口', 404)
}

export default defineMock([
  { url: '/api/sys/articles', method: ['GET', 'POST'], body: handle },
  { url: '/api/sys/articles/:id', method: ['GET', 'PUT', 'DELETE'], body: handle },
  { url: '/api/sys/articles/:id/status', method: 'PUT', body: handle },
  { url: '/api/sys/articles/:id/access', method: 'PUT', body: handle },
  { url: '/api/sys/articles/:id/top', method: 'PUT', body: handle },
  { url: '/api/sys/articles/:id/recommend', method: 'PUT', body: handle },
  { url: '/api/sys/article-reviews', method: 'GET', body: handle },
  { url: '/api/sys/article-reviews/:id', method: 'GET', body: handle },
  { url: '/api/sys/article-reviews/:id/approve', method: 'PUT', body: handle },
  { url: '/api/sys/article-reviews/:id/reject', method: 'PUT', body: handle },
  { url: '/api/sys/article-reviews/:id/repair-status', method: 'PUT', body: handle },
  { url: '/api/sys/categories', method: 'POST', body: handle },
  { url: '/api/sys/categories/tree', method: 'GET', body: handle },
  { url: '/api/sys/categories/:id', method: ['GET', 'PUT', 'DELETE'], body: handle },
  { url: '/api/sys/categories/:id/status', method: 'PUT', body: handle },
  { url: '/api/sys/tags', method: ['GET', 'POST'], body: handle },
  { url: '/api/sys/tags/:id', method: ['GET', 'PUT', 'DELETE'], body: handle },
  { url: '/api/sys/comments', method: 'GET', body: handle },
  { url: '/api/sys/comments/:id', method: ['GET', 'DELETE'], body: handle },
  { url: '/api/sys/comments/:id/status', method: 'PUT', body: handle },
  { url: '/api/sys/collections', method: 'GET', body: handle },
  { url: '/api/sys/collections/folders', method: 'GET', body: handle },
  { url: '/api/sys/collections/:id', method: 'DELETE', body: handle },
  { url: '/api/sys/interactions', method: 'GET', body: handle },
  { url: '/api/sys/interactions/:id', method: 'DELETE', body: handle },
  { url: '/api/sys/footprints', method: ['GET', 'DELETE'], body: handle },
  { url: '/api/sys/footprints/:id', method: 'DELETE', body: handle },
])

