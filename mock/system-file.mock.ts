import { defineMock } from 'vite-plugin-mock-dev-server'
import { db, has, num, ok, p, page } from './shared'

function getFileDetail(id: number) {
  const file = db.files.find((item: any) => item.id === id)
  if (!file) {
    return null
  }

  return {
    ...file,
    references: db.fileReferences.filter((item: any) => item.fileId === id),
    tasks: db.fileTasks.filter((item: any) => item.fileId === id),
  }
}

function handle(req: any) {
  const method = String(req.method).toUpperCase()
  const path = p(req)
  const fileMatch = path.match(/^\/api\/sys\/files\/(\d+)$/)
  const statusMatch = path.match(/^\/api\/sys\/files\/(\d+)\/status$/)

  if (method === 'GET' && path === '/api/sys/files') {
    let records = [...db.files]

    if (req.query.keyword) records = records.filter((item: any) => has(item.fileName, req.query.keyword) || has(item.originalName, req.query.keyword))
    if (req.query.uploadUserId) records = records.filter((item: any) => item.uploadUserId === num(req.query.uploadUserId))
    if (req.query.status !== undefined && req.query.status !== '') records = records.filter((item: any) => item.status === num(req.query.status))
    if (req.query.category) records = records.filter((item: any) => item.category === req.query.category)
    if (req.query.isPublic !== undefined && req.query.isPublic !== '') records = records.filter((item: any) => item.isPublic === num(req.query.isPublic))
    if (req.query.referenceType) {
      records = records.filter((item: any) => db.fileReferences.some((reference: any) => reference.fileId === item.id && reference.referenceType === req.query.referenceType))
    }

    return ok(page(records, req.query))
  }

  if (method === 'GET' && path === '/api/sys/files/upload-tasks') {
    let records = [...db.fileTasks]

    if (req.query.uploadUserId) records = records.filter((item: any) => item.uploadUserId === num(req.query.uploadUserId))
    if (req.query.taskStatus !== undefined && req.query.taskStatus !== '') records = records.filter((item: any) => item.taskStatus === num(req.query.taskStatus))
    if (req.query.isQuickUpload !== undefined && req.query.isQuickUpload !== '') records = records.filter((item: any) => item.isQuickUpload === num(req.query.isQuickUpload))
    if (req.query.isChunked !== undefined && req.query.isChunked !== '') records = records.filter((item: any) => item.isChunked === num(req.query.isChunked))

    return ok(page(records, req.query))
  }

  if (method === 'GET' && fileMatch) {
    const detail = getFileDetail(num(fileMatch[1]))
    return detail ? ok(detail) : ok(null, '文件不存在', 404)
  }

  if (method === 'PUT' && statusMatch) {
    const file = db.files.find((item: any) => item.id === num(statusMatch[1]))
    if (!file) return ok(null, '文件不存在', 404)

    file.status = req.body.status ?? file.status
    return ok(null)
  }

  if (method === 'DELETE' && fileMatch) {
    const fileId = num(fileMatch[1])
    db.files = db.files.filter((item: any) => item.id !== fileId)
    db.fileReferences = db.fileReferences.filter((item: any) => item.fileId !== fileId)
    return ok(null)
  }

  return ok(null, '未匹配到文件后台接口', 404)
}

export default defineMock([
  { url: '/api/sys/files', method: 'GET', body: handle },
  { url: '/api/sys/files/upload-tasks', method: 'GET', body: handle },
  { url: '/api/sys/files/:id', method: ['GET', 'DELETE'], body: handle },
  { url: '/api/sys/files/:id/status', method: 'PUT', body: handle },
])
