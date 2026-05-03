import { defineMock } from 'vite-plugin-mock-dev-server'
import { db, me, now, num, ok, page } from './shared'

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const path = new URL(req.url || '/', 'http://mock').pathname
  const u = me(req)
  const match = (r: RegExp) => path.match(r)

  if (m === 'POST' && path === '/api/user/files/upload-tasks/init') {
    const uploadId = `upl_${Date.now()}`
    const totalChunks = req.body.totalChunks ?? 1
    return ok({
      taskId: ++db.seq.fileTask,
      uploadId,
      uploadMode: totalChunks > 1 ? 'chunked' : 'simple',
      quickUploadAvailable: false,
      completed: false,
      totalChunks: totalChunks > 1 ? totalChunks : undefined,
      chunkSize: req.body.chunkSize ?? undefined,
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
    const id = ++db.seq.file
    const file = { id, fileName: `mock-file-${id}`, originalName: req.body.originalName ?? `mock-file-${id}`, filePath: `/uploads/mock/${id}`, fileUrl: `https://mock.local/files/mock-file-${id}`, storageKey: `mock/${id}`, fileSize: req.body.fileSize ?? 0, fileType: 'file', mimeType: req.body.mimeType ?? 'application/octet-stream', fileExtension: '', uploadUserId: u.id, isPublic: req.body.isPublic ?? 0, category: req.body.category ?? 'other', status: 1, referenceCount: 0, createdAt: now() }
    db.files.push(file)
    return ok({ businessId: id, fileId: id, fileUrl: file.fileUrl })
  }

  if (m === 'POST' && match(/^\/api\/user\/files\/upload-tasks\/([^/]+)\/chunks\/(\d+)$/)) {
    return ok({ uploadedChunks: 1, totalChunks: 1, taskStatus: 0 })
  }

  if (m === 'POST' && match(/^\/api\/user\/files\/upload-tasks\/([^/]+)\/complete$/)) {
    const id = ++db.seq.file
    const file = { id, fileName: `mock-chunked-${id}`, originalName: `mock-chunked-${id}`, filePath: `/uploads/mock/${id}`, fileUrl: `https://mock.local/files/mock-chunked-${id}`, storageKey: `mock/${id}`, fileSize: 0, fileType: 'file', mimeType: 'application/octet-stream', fileExtension: '', uploadUserId: u.id, isPublic: 0, category: 'other', status: 1, referenceCount: 0, createdAt: now() }
    db.files.push(file)
    return ok({ businessId: id, fileId: id, fileUrl: file.fileUrl })
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
