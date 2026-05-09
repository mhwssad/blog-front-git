import { readFileSync } from 'node:fs'
import { defineMock } from 'vite-plugin-mock-dev-server'
import { cp, db, has, now, num, ok, page } from './shared'

function normalizeTask(task: any) {
  return {
    ...task,
    authorId: num(task.authorId),
    sourcePlatform: task.sourcePlatform ?? task.sourceType ?? 'unknown',
    status: num(task.status),
    totalCount: num(task.totalCount),
    successCount: num(task.successCount),
    failedCount: num(task.failedCount ?? task.failCount),
    skippedCount: num(task.skippedCount),
    createdAt: task.createdAt ?? task.createdTime ?? now(),
  }
}

function normalizeRecord(record: any) {
  return {
    ...record,
    externalPostId: record.externalPostId ?? record.sourceId ?? '',
    status: num(record.status),
    errorMessage: record.errorMessage ?? null,
    createdAt: record.createdAt ?? now(),
  }
}

function getPayload(task: any): { sourcePlatform: string; posts: any[] } {
  if (task?.payload?.posts) {
    return task.payload
  }

  const records = (db.migrationRecords || [])
    .filter((item: any) => item.taskId === task.id)
    .map((item: any) => ({
      externalPostId: item.externalPostId ?? item.sourceId ?? `post-${item.id}`,
      title: item.title ?? `文章 ${item.id}`,
      summary: '',
      content: '',
      categoryCodes: ['tech'],
      tagNames: ['blog'],
      isOriginal: 1,
      sourceUrl: null,
      status: item.status === 1 ? 1 : 0,
      publishTime: null,
      attachments: [],
    }))

  return {
    sourcePlatform: task.sourcePlatform ?? 'unknown',
    posts: records,
  }
}

function collectExportRows(taskId: number) {
  return (db.migrationRecords || [])
    .filter((item: any) => item.taskId === taskId && num(item.status) === 2)
    .map((item: any) => normalizeRecord(item))
}

function validatePosts(posts: any[]) {
  const errors: any[] = []
  const seen = new Set<string>()

  posts.forEach((post: any, index: number) => {
    const externalPostId = String(post.externalPostId ?? '').trim()
    const title = String(post.title ?? '').trim()
    const categoryCodes = Array.isArray(post.categoryCodes) ? post.categoryCodes : []
    const tagNames = Array.isArray(post.tagNames) ? post.tagNames : []

    if (!externalPostId) {
      errors.push({
        id: index + 1,
        externalPostId: '',
        title: title || `文章 ${index + 1}`,
        status: 2,
        errorMessage: 'externalPostId 不能为空',
      })
      return
    }

    if (seen.has(externalPostId)) {
      errors.push({
        id: index + 1,
        externalPostId,
        title: title || `文章 ${index + 1}`,
        status: 2,
        errorMessage: '迁移文件中存在重复的 externalPostId',
      })
      return
    }
    seen.add(externalPostId)

    if (!title) {
      errors.push({
        id: index + 1,
        externalPostId,
        title: '',
        status: 2,
        errorMessage: '标题不能为空',
      })
      return
    }

    if (!categoryCodes.length) {
      errors.push({
        id: index + 1,
        externalPostId,
        title,
        status: 2,
        errorMessage: '分类编码不能为空',
      })
      return
    }

    if (!tagNames.length) {
      errors.push({
        id: index + 1,
        externalPostId,
        title,
        status: 2,
        errorMessage: '标签不能为空',
      })
    }
  })

  return errors
}

function createImportedRecords(taskId: number, posts: any[]) {
  const records = posts.map((post: any, index: number) => ({
    id: ++db.seq.migrationRecord,
    taskId,
    externalPostId: String(post.externalPostId ?? `post-${index + 1}`),
    title: String(post.title ?? `文章 ${index + 1}`),
    status: index % 5 === 0 && index !== 0 ? 2 : 1,
    errorMessage: index % 5 === 0 && index !== 0 ? '标签不存在' : null,
    createdAt: now(),
  }))

  db.migrationRecords.push(...records)

  return {
    totalCount: records.length,
    successCount: records.filter((item: any) => item.status === 1).length,
    failedCount: records.filter((item: any) => item.status === 2).length,
    skippedCount: 0,
  }
}

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const match = (r: RegExp) => path.match(r)

  if (m === 'GET' && path === '/api/sys/migrations/blog/tasks') {
    let rs = [...db.migrationTasks].map(normalizeTask)
    if (req.query.status !== undefined && req.query.status !== '') {
      rs = rs.filter((item: any) => item.status === num(req.query.status))
    }
    if (req.query.sourcePlatform) {
      rs = rs.filter((item: any) => has(item.sourcePlatform, req.query.sourcePlatform))
    }
    if (req.query.authorId !== undefined && req.query.authorId !== '') {
      rs = rs.filter((item: any) => item.authorId === num(req.query.authorId))
    }
    return ok(page(rs, req.query))
  }

  if (m === 'POST' && path === '/api/sys/migrations/blog/tasks') {
    const file = req.body?.file
    const filePath = file?.filepath || file?.path
    const fileName = file?.originalFilename || file?.name || 'migration.json'

    let payload: { sourcePlatform: string; posts: any[] } = { sourcePlatform: 'unknown', posts: [] }
    if (filePath) {
      try {
        payload = JSON.parse(readFileSync(filePath, 'utf-8'))
      } catch {
        // 忽略解析失败，回落到默认任务数据
      }
    }

    const sourcePlatform = String(payload.sourcePlatform || fileName.replace(/\.json$/i, '') || 'unknown').toLowerCase()
    const posts = Array.isArray(payload.posts) ? cp(payload.posts) : []
    const task = {
      id: ++db.seq.migrationTask,
      authorId: num(req.body?.authorId),
      sourcePlatform,
      status: 0,
      totalCount: posts.length,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      createdAt: now(),
      payload: {
        sourcePlatform,
        posts,
      },
    }

    db.migrationTasks.push(task)
    return ok(cp(normalizeTask(task)))
  }

  if (m === 'GET' && match(/^\/api\/sys\/migrations\/blog\/tasks\/(\d+)$/)) {
    const x = db.migrationTasks.find((i: any) => i.id === num(match(/^\/api\/sys\/migrations\/blog\/tasks\/(\d+)$/)![1]))
    return x ? ok(cp(normalizeTask(x))) : ok(null, '迁移任务不存在', 404)
  }

  if (m === 'POST' && match(/^\/api\/sys\/migrations\/blog\/tasks\/(\d+)\/precheck$/)) {
    const taskId = num(match(/^\/api\/sys\/migrations\/blog\/tasks\/(\d+)\/precheck$/)![1])
    const task = db.migrationTasks.find((i: any) => i.id === taskId)
    if (!task) return ok(null, '迁移任务不存在', 404)

    const payload = getPayload(task)
    const errors = validatePosts(payload.posts)
    if (errors.length === 0) {
      task.status = 1
    }
    task.totalCount = payload.posts.length
    task.updatedAt = now()

    return ok({
      taskId,
      totalCount: payload.posts.length,
      passed: errors.length === 0,
      errors,
    })
  }

  if (m === 'POST' && match(/^\/api\/sys\/migrations\/blog\/tasks\/(\d+)\/execute$/)) {
    const taskId = num(match(/^\/api\/sys\/migrations\/blog\/tasks\/(\d+)\/execute$/)![1])
    const task = db.migrationTasks.find((i: any) => i.id === taskId)
    if (!task) return ok(null, '迁移任务不存在', 404)

    if (task.status !== 1) {
      return ok(null, '任务状态不允许当前操作', 400)
    }

    const payload = getPayload(task)
    const counts = createImportedRecords(taskId, payload.posts)
    task.status = 3
    task.totalCount = counts.totalCount
    task.successCount = counts.successCount
    task.failedCount = counts.failedCount
    task.skippedCount = counts.skippedCount
    task.updatedAt = now()

    return ok(cp(normalizeTask(task)))
  }

  if (m === 'GET' && match(/^\/api\/sys\/migrations\/blog\/tasks\/(\d+)\/records$/)) {
    const taskId = num(match(/^\/api\/sys\/migrations\/blog\/tasks\/(\d+)\/records$/)![1])
    let rs = (db.migrationRecords || [])
      .filter((i: any) => i.taskId === taskId)
      .map(normalizeRecord)

    if (req.query.status !== undefined && req.query.status !== '') {
      rs = rs.filter((item: any) => item.status === num(req.query.status))
    }

    return ok(page(rs, req.query))
  }

  if (m === 'GET' && match(/^\/api\/sys\/migrations\/blog\/tasks\/(\d+)\/failures\/export$/)) {
    const taskId = num(match(/^\/api\/sys\/migrations\/blog\/tasks\/(\d+)\/failures\/export$/)![1])
    return collectExportRows(taskId)
  }

  return ok(null, '未匹配到迁移管理接口', 404)
}

export default defineMock([
  { url: '/api/sys/migrations/blog/tasks', method: ['GET', 'POST'], body: handle },
  { url: '/api/sys/migrations/blog/tasks/:id', method: 'GET', body: handle },
  { url: '/api/sys/migrations/blog/tasks/:id/precheck', method: 'POST', body: handle },
  { url: '/api/sys/migrations/blog/tasks/:id/execute', method: 'POST', body: handle },
  { url: '/api/sys/migrations/blog/tasks/:id/records', method: 'GET', body: handle },
  {
    url: '/api/sys/migrations/blog/tasks/:id/failures/export',
    method: 'GET',
    response(req, res, next) {
      const result = handle(req)
      if (Array.isArray(result)) {
        const lines = [
          'externalPostId\ttitle\terrorMessage',
          ...result.map((item: any) => `${item.externalPostId}\t${item.title}\t${item.errorMessage ?? ''}`),
        ]
        const content = Buffer.from(lines.join('\n'), 'utf-8')
        res.setHeader('Content-Type', 'application/octet-stream')
        res.setHeader('Content-Disposition', `attachment; filename=blog-migration-failures-${num(req.url.match(/(\d+)/)?.[1])}.xlsx`)
        res.end(content)
        return
      }

      next()
    },
  },
])
