import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { useFileUpload } from '../useFileUpload'

// ==================== Mocks ====================

vi.mock('@/api/user/file', () => ({
  UserFileApi: {
    initUploadTask: vi.fn(),
    quickCheckUploadTask: vi.fn(),
    uploadFile: vi.fn(),
    uploadChunk: vi.fn(),
    completeUploadTask: vi.fn(),
  },
}))

vi.mock('@/composables/useLogger', () => ({
  log: {
    file: {
      info: vi.fn(),
      error: vi.fn(),
    },
  },
}))

vi.mock('element-plus', () => ({
  ElMessage: { error: vi.fn() },
}))

// ==================== Helpers ====================

function createFile(size: number, name = 'test.png', type = 'image/png'): File {
  const content = new ArrayBuffer(size)
  return new File([content], name, { type })
}

/** 构造 init 成功响应 */
function makeInitResponse(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      data: {
        taskId: 1,
        uploadId: 'upload-123',
        uploadMode: 3,
        quickUploadAvailable: false,
        completed: false,
        totalChunks: undefined,
        chunkSize: undefined,
        taskStatus: 0,
        fileId: undefined,
        fileUrl: undefined,
        businessId: undefined,
        ...overrides,
      },
    },
  }
}

/** 构造上传结果响应 */
function makeResultResponse(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      data: {
        uploadId: 'upload-123',
        taskId: 1,
        fileId: 100,
        businessId: 200,
        quickUpload: false,
        taskStatus: 3,
        fileUrl: '/files/100',
        ...overrides,
      },
    },
  }
}

/** 构造分片上传响应 */
function makeChunkResponse(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      data: {
        uploadId: 'upload-123',
        chunkNumber: 1,
        uploadedChunks: 1,
        totalChunks: 3,
        taskStatus: 1,
        ...overrides,
      },
    },
  }
}

// ==================== Tests ====================

describe('useFileUpload', () => {
  let upload: ReturnType<typeof useFileUpload>['upload']

  beforeEach(() => {
    vi.clearAllMocks()
    const composable = useFileUpload()
    upload = composable.upload
  })

  // ---------- 校验 ----------

  describe('文件校验', () => {
    it('超过 100MB 的文件应抛出错误', async () => {
      const bigFile = createFile(101 * 1024 * 1024)
      await expect(upload(bigFile)).rejects.toThrow('超过最大限制')
    })
  })

  // ---------- 秒传 ----------

  describe('秒传', () => {
    it('init 返回 completed=true 时直接秒传返回', async () => {
      const { UserFileApi } = await import('@/api/user/file')
      vi.mocked(UserFileApi.initUploadTask).mockResolvedValue(
        makeInitResponse({ completed: true, fileId: 50, fileUrl: '/files/50', businessId: 10 }),
      )

      const file = createFile(1024)
      const result = await upload(file)

      expect(result.quickUpload).toBe(true)
      expect(result.fileId).toBe(50)
      expect(result.fileUrl).toBe('/files/50')
      // 不应再调用上传接口
      expect(UserFileApi.uploadFile).not.toHaveBeenCalled()
      expect(UserFileApi.uploadChunk).not.toHaveBeenCalled()
      expect(UserFileApi.completeUploadTask).not.toHaveBeenCalled()
    })

    it('quickUploadAvailable=true 且 quick-check 返回 quickUpload=true 时秒传命中', async () => {
      const { UserFileApi } = await import('@/api/user/file')
      vi.mocked(UserFileApi.initUploadTask).mockResolvedValue(
        makeInitResponse({ quickUploadAvailable: true }),
      )
      vi.mocked(UserFileApi.quickCheckUploadTask).mockResolvedValue(
        makeResultResponse({ quickUpload: true }),
      )

      const file = createFile(1024)
      const result = await upload(file)

      expect(result.quickUpload).toBe(true)
      expect(UserFileApi.quickCheckUploadTask).toHaveBeenCalledWith('upload-123')
      expect(UserFileApi.uploadFile).not.toHaveBeenCalled()
    })

    it('quickUploadAvailable=true 但 quick-check 未命中时走全量上传', async () => {
      const { UserFileApi } = await import('@/api/user/file')
      vi.mocked(UserFileApi.initUploadTask).mockResolvedValue(
        makeInitResponse({ quickUploadAvailable: true }),
      )
      vi.mocked(UserFileApi.quickCheckUploadTask).mockResolvedValue(
        makeResultResponse({ quickUpload: false }),
      )
      vi.mocked(UserFileApi.uploadFile).mockResolvedValue(makeResultResponse())

      const file = createFile(1024)
      const result = await upload(file)

      expect(result.quickUpload).toBe(false)
      expect(UserFileApi.uploadFile).toHaveBeenCalledWith('upload-123', expect.any(FormData))
    })
  })

  // ---------- 全量上传 ----------

  describe('全量上传 (uploadMode=3)', () => {
    it('小文件走全量上传，使用 uploadFile 响应，不调用 completeUploadTask', async () => {
      const { UserFileApi } = await import('@/api/user/file')
      vi.mocked(UserFileApi.initUploadTask).mockResolvedValue(makeInitResponse())
      vi.mocked(UserFileApi.uploadFile).mockResolvedValue(
        makeResultResponse({ fileId: 100, fileUrl: '/files/100' }),
      )

      const file = createFile(1024)
      const result = await upload(file)

      expect(UserFileApi.uploadFile).toHaveBeenCalledWith('upload-123', expect.any(FormData))
      expect(UserFileApi.completeUploadTask).not.toHaveBeenCalled()
      expect(result.fileId).toBe(100)
      expect(result.quickUpload).toBe(false)
    })
  })

  // ---------- 分片上传 ----------

  describe('分片上传 (uploadMode=2)', () => {
    it('大文件走分片上传，传 chunkMd5，最终调用 completeUploadTask', async () => {
      const { UserFileApi } = await import('@/api/user/file')
      vi.mocked(UserFileApi.initUploadTask).mockResolvedValue(
        makeInitResponse({
          uploadMode: 2,
          totalChunks: 2,
          chunkSize: 5 * 1024 * 1024,
        }),
      )
      vi.mocked(UserFileApi.uploadChunk).mockResolvedValue(makeChunkResponse())
      vi.mocked(UserFileApi.completeUploadTask).mockResolvedValue(
        makeResultResponse({ fileId: 300 }),
      )

      // 12MB 文件，超过 6MB 阈值
      const file = createFile(12 * 1024 * 1024, 'big-video.mp4', 'video/mp4')
      const result = await upload(file)

      // uploadChunk 应被调用 totalChunks 次
      expect(UserFileApi.uploadChunk).toHaveBeenCalledTimes(2)
      // 每次调用应附带 chunkMd5
      for (const call of vi.mocked(UserFileApi.uploadChunk).mock.calls) {
        const formData = call[2] as FormData
        expect(formData.has('chunkMd5')).toBe(true)
        expect(formData.has('file')).toBe(true)
      }
      expect(UserFileApi.completeUploadTask).toHaveBeenCalledWith('upload-123')
      expect(result.fileId).toBe(300)
    })
  })

  // ---------- 状态管理 ----------

  describe('状态管理', () => {
    it('上传完成后状态正确恢复', async () => {
      const composable = useFileUpload()
      const { UserFileApi } = await import('@/api/user/file')
      vi.mocked(UserFileApi.initUploadTask).mockResolvedValue(
        makeInitResponse({ completed: true }),
      )

      await composable.upload(createFile(1024))

      expect(composable.uploading.value).toBe(false)
      expect(composable.progress.value).toBe(100)
      expect(composable.stage.value).toBe('done')
    })

    it('reset 方法清空所有状态', async () => {
      const composable = useFileUpload()
      const { UserFileApi } = await import('@/api/user/file')
      vi.mocked(UserFileApi.initUploadTask).mockResolvedValue(
        makeInitResponse({ completed: true }),
      )

      await composable.upload(createFile(1024))
      composable.reset()

      expect(composable.uploading.value).toBe(false)
      expect(composable.progress.value).toBe(0)
      expect(composable.stage.value).toBe('idle')
      expect(composable.fileName.value).toBe('')
    })

    it('上传失败时状态回到 idle 且 uploading=false', async () => {
      const composable = useFileUpload()
      const { UserFileApi } = await import('@/api/user/file')
      vi.mocked(UserFileApi.initUploadTask).mockRejectedValue(new Error('网络错误'))

      await expect(composable.upload(createFile(1024))).rejects.toThrow('网络错误')

      expect(composable.uploading.value).toBe(false)
      expect(composable.stage.value).toBe('idle')
    })
  })

  // ---------- 选项透传 ----------

  describe('选项透传', () => {
    it('默认选项和调用时选项正确合并', async () => {
      const { UserFileApi } = await import('@/api/user/file')
      const composable = useFileUpload({
        referenceType: 'avatar',
        category: 'avatar',
        isPublic: 1,
      })

      vi.mocked(UserFileApi.initUploadTask).mockResolvedValue(makeInitResponse())

      const file = createFile(1024)
      await composable.upload(file)

      const initBody = vi.mocked(UserFileApi.initUploadTask).mock.calls[0]![0]
      expect(initBody.referenceType).toBe('avatar')
      expect(initBody.category).toBe('avatar')
      expect(initBody.isPublic).toBe(1)
    })

    it('调用时选项覆盖默认选项', async () => {
      const { UserFileApi } = await import('@/api/user/file')
      const composable = useFileUpload({ referenceType: 'avatar' })

      vi.mocked(UserFileApi.initUploadTask).mockResolvedValue(makeInitResponse())

      const file = createFile(1024)
      await composable.upload(file, { referenceType: 'comment_image' })

      const initBody = vi.mocked(UserFileApi.initUploadTask).mock.calls[0]![0]
      expect(initBody.referenceType).toBe('comment_image')
    })

    it('大文件发送分片参数，小文件不发送', async () => {
      const { UserFileApi } = await import('@/api/user/file')
      vi.mocked(UserFileApi.initUploadTask).mockResolvedValue(
        makeInitResponse({ uploadMode: 2, totalChunks: 3, chunkSize: 5 * 1024 * 1024 }),
      )
      vi.mocked(UserFileApi.uploadChunk).mockResolvedValue(makeChunkResponse())
      vi.mocked(UserFileApi.completeUploadTask).mockResolvedValue(makeResultResponse())

      const bigFile = createFile(12 * 1024 * 1024)
      await upload(bigFile)

      const initBody = vi.mocked(UserFileApi.initUploadTask).mock.calls[0]![0]
      expect(initBody.totalChunks).toBeGreaterThan(1)
      expect(initBody.chunkSize).toBeDefined()
    })
  })

  // ---------- 真实文件测试 ----------

  describe('真实文件 (logo.png)', () => {
    const filePath = 'E:\\下载文件\\联想下载\\logo.png'
    let realFile: File
    let expectedMd5: string
    let fileSize: number

    beforeAll(() => {
      const buffer = readFileSync(filePath)
      fileSize = buffer.length
      expectedMd5 = createHash('md5').update(buffer).digest('hex')
      realFile = new File([buffer], 'logo.png', { type: 'image/png' })
    })

    it('MD5 计算结果与 Node.js crypto 一致', async () => {
      const { UserFileApi } = await import('@/api/user/file')
      vi.mocked(UserFileApi.initUploadTask).mockResolvedValue(
        makeInitResponse({ completed: true }),
      )

      await upload(realFile)

      const initBody = vi.mocked(UserFileApi.initUploadTask).mock.calls[0]![0]
      expect(initBody.fileMd5).toBe(expectedMd5)
      expect(initBody.fileSize).toBe(fileSize)
      expect(initBody.originalName).toBe('logo.png')
      expect(initBody.mimeType).toBe('image/png')
    })

    it('小文件真实图片走全量上传，FormData 包含完整文件', async () => {
      const { UserFileApi } = await import('@/api/user/file')
      vi.mocked(UserFileApi.initUploadTask).mockResolvedValue(makeInitResponse())
      vi.mocked(UserFileApi.uploadFile).mockResolvedValue(
        makeResultResponse({ fileId: 999, fileUrl: '/files/999' }),
      )

      const result = await upload(realFile)

      expect(UserFileApi.uploadFile).toHaveBeenCalledWith('upload-123', expect.any(FormData))
      expect(UserFileApi.completeUploadTask).not.toHaveBeenCalled()
      expect(result.fileId).toBe(999)
      expect(result.quickUpload).toBe(false)
    })

    it('强制分片模式时，每个分片 FormData 含 file 和 chunkMd5', async () => {
      const { UserFileApi } = await import('@/api/user/file')
      const chunkSize = 500 * 1024 // 500KB，确保 logo.png 被切成多片
      const totalChunks = Math.ceil(fileSize / chunkSize)

      vi.mocked(UserFileApi.initUploadTask).mockResolvedValue(
        makeInitResponse({ uploadMode: 2, totalChunks, chunkSize }),
      )
      vi.mocked(UserFileApi.uploadChunk).mockResolvedValue(makeChunkResponse())
      vi.mocked(UserFileApi.completeUploadTask).mockResolvedValue(
        makeResultResponse({ fileId: 888 }),
      )

      const result = await upload(realFile)

      expect(UserFileApi.uploadChunk).toHaveBeenCalledTimes(totalChunks)
      // 校验每个分片调用都包含 file 和 chunkMd5
      const calls = vi.mocked(UserFileApi.uploadChunk).mock.calls
      for (let i = 0; i < calls.length; i++) {
        const formData = calls[i]![2] as FormData
        expect(formData.has('file')).toBe(true)
        expect(formData.has('chunkMd5')).toBe(true)
      }
      expect(UserFileApi.completeUploadTask).toHaveBeenCalledWith('upload-123')
      expect(result.fileId).toBe(888)
    })
  })
})
