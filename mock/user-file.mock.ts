import { defineMock } from 'vite-plugin-mock-dev-server'
import { db, me, now, num, ok, page } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const u = me(req)
  const match = (r: RegExp) => path.match(r)

  if (m === 'POST' && path === '/api/user/files/upload-tasks/init') {
    const uploadId = `upl_${Date.now()}`
    const totalChunks = req.body?.totalChunks ?? 1
    return ok({
      taskId: ++db.seq.fileTask,
      uploadId,
      uploadMode: totalChunks > 1 ? 2 : 3,
      quickUploadAvailable: false,
      completed: false,
      totalChunks: totalChunks > 1 ? totalChunks : undefined,
      chunkSize: req.body?.chunkSize ?? undefined,
      taskStatus: 0,
      fileId: null,
      fileUrl: null,
      businessId: null,
    })
  }

  if (m === 'POST' && match(/^\/api\/user\/files\/upload-tasks\/([^/]+)\/quick-check$/)) {
    return ok({ quickUploadAvailable: false, matched: false, completed: false })
  }

  if (m === 'POST' && match(/^\/api\/user\/files\/upload-tasks\/([^/]+)\/file$/)) {
    const uploadId = match(/^\/api\/user\/files\/upload-tasks\/([^/]+)\/file$/)![1]
    const id = ++db.seq.file
    const body = req.body || {}
    const file = {
      id,
      fileName: `mock-file-${id}`,
      originalName: body.originalName ?? `mock-file-${id}`,
      filePath: `/uploads/mock/${id}`,
      fileUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=file${id}`,
      storageKey: `mock/${id}`,
      fileSize: body.fileSize ?? 0,
      fileType: 'file',
      mimeType: body.mimeType ?? 'application/octet-stream',
      fileExtension: '',
      uploadUserId: u.id,
      isPublic: body.isPublic ?? 0,
      category: body.category ?? 'other',
      status: 1,
      referenceCount: 0,
      createdAt: now(),
    }
    db.files.push(file)
    return ok({
      uploadId,
      taskId: db.seq.fileTask,
      fileId: id,
      businessId: id,
      fileUrl: file.fileUrl,
      quickUpload: false,
      taskStatus: 3,
    })
  }

  if (m === 'POST' && match(/^\/api\/user\/files\/upload-tasks\/([^/]+)\/chunks\/(\d+)$/)) {
    return ok({ uploadedChunks: 1, totalChunks: 1, taskStatus: 0 })
  }

  if (m === 'POST' && match(/^\/api\/user\/files\/upload-tasks\/([^/]+)\/complete$/)) {
    const uploadId = match(/^\/api\/user\/files\/upload-tasks\/([^/]+)\/complete$/)![1]
    const id = ++db.seq.file
    const file = {
      id,
      fileName: `mock-chunked-${id}`,
      originalName: `mock-chunked-${id}`,
      filePath: `/uploads/mock/${id}`,
      fileUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=chunk${id}`,
      storageKey: `mock/${id}`,
      fileSize: 0,
      fileType: 'file',
      mimeType: 'application/octet-stream',
      fileExtension: '',
      uploadUserId: u.id,
      isPublic: 0,
      category: 'other',
      status: 1,
      referenceCount: 0,
      createdAt: now(),
    }
    db.files.push(file)
    return ok({
      uploadId,
      taskId: db.seq.fileTask,
      fileId: id,
      businessId: id,
      fileUrl: file.fileUrl,
      quickUpload: false,
      taskStatus: 3,
    })
  }

  if (m === 'GET' && path === '/api/user/files') {
    const rs = db.files.filter((i: any) => i.uploadUserId === u.id)
    return ok(page(rs, req.query))
  }

  if (m === 'GET' && path === '/api/user/files/upload-tasks') return ok(page([], req.query))

  if (m === 'DELETE' && match(/^\/api\/user\/files\/([^/]+)$/)) {
    const businessId = num(match(/^\/api\/user\/files\/([^/]+)$/)![1])
    db.files = db.files.filter((i: any) => i.id !== businessId)
    return ok(null)
  }

  return ok(null, '未匹配到用户文件接口', 404)
}

export default defineMock([
  { url: '/api/user/files/upload-tasks/init', method: 'POST', body: handle },
  { url: '/api/user/files/upload-tasks/:uploadId/quick-check', method: 'POST', body: handle },
  { url: '/api/user/files/upload-tasks/:uploadId/file', method: 'POST', body: handle },
  { url: '/api/user/files/upload-tasks/:uploadId/chunks/:chunkNumber', method: 'POST', body: handle },
  { url: '/api/user/files/upload-tasks/:uploadId/complete', method: 'POST', body: handle },
  { url: '/api/user/files', method: 'GET', body: handle },
  { url: '/api/user/files/upload-tasks', method: 'GET', body: handle },
  { url: '/api/user/files/:businessId', method: 'DELETE', body: handle },
])
