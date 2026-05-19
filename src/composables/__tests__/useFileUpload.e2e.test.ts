/**
 * 真实环境上传测试 — 直连后端，不走 Mock
 *
 * 使用方式：
 *   1. 确保后端运行在 localhost:8080
 *   2. 运行: pnpm test:run -- src/composables/__tests__/useFileUpload.e2e.test.ts
 */
import { createHash } from 'node:crypto'
import { writeFileSync, readFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import axios from 'axios'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { useFileUpload } from '../useFileUpload'
import { http } from '@/api/request'
import { AuthApi } from '@/api/auth'
import { saveTokens, clearAuthData } from '@/utils/http'
import instance from '@/api/request'

// ==================== 配置 ====================

const BASE_URL = 'http://localhost:8080/api'
const LOGIN_USERNAME = 'admin'
const LOGIN_PASSWORD = 'QWEasdzxc123'

// ==================== 辅助函数 ====================

/** 跟踪所有创建的临时文件路径，测试结束后统一清理 */
const tempFilePaths: string[] = []

/**
 * 在磁盘上创建临时测试文件，模拟真实上传场景
 */
function createTestFile() {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const fileName = `test-${nonce}.png`
  const filePath = join(tmpdir(), fileName)

  const content = `e2e-test-${nonce}`
  writeFileSync(filePath, content)
  tempFilePaths.push(filePath)

  const buffer = readFileSync(filePath)
  const md5 = createHash('md5').update(buffer).digest('hex')
  const file = new File([buffer], fileName, { type: 'image/png' })

  return { buffer, md5, file, size: buffer.length, filePath }
}

/** 检查后端是否可访问 */
async function checkBackendAlive(): Promise<boolean> {
  try {
    await axios.get(`${BASE_URL.replace('/api', '')}/actuator/health`, { timeout: 3000 })
    return true
  } catch {
    try {
      await axios.get(`${BASE_URL}/public/files/0`, { timeout: 3000 })
      return true
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response) return true
      return false
    }
  }
}

/** 清理测试产生的文件引用 */
async function cleanupFile(businessId: number) {
  try {
    await http.delete(`/user/files/${businessId}`)
    console.log(`[清理] 已删除文件引用 businessId=${businessId}`)
  } catch (e) {
    console.warn(`[清理] 删除失败（可手动清理）: businessId=${businessId}`, e)
  }
}

// ==================== 测试 ====================

describe('真实环境上传测试', () => {
  let fileInfo: ReturnType<typeof createTestFile>
  let originalBaseURL: string | undefined

  beforeAll(async () => {
    // 将 axios baseURL 指向真实后端
    originalBaseURL = instance.defaults.baseURL
    instance.defaults.baseURL = BASE_URL

    // 登录获取 token，供所有测试复用
    const loginResp = await AuthApi.login({
      username: LOGIN_USERNAME,
      password: LOGIN_PASSWORD,
    })

    expect(loginResp.data.code).toBe(200)
    const tokenData = loginResp.data.data
    expect(tokenData.accessToken).toBeDefined()

    saveTokens(tokenData.accessToken, tokenData.refreshToken, tokenData.expiresIn)
    console.log(`[登录] 成功，token 将在 ${tokenData.expiresIn}s 后过期`)

    fileInfo = createTestFile()
  })

  afterAll(() => {
    instance.defaults.baseURL = originalBaseURL
    clearAuthData()

    // 清理所有测试创建的临时文件
    for (const filePath of tempFilePaths) {
      try {
        unlinkSync(filePath)
      } catch {
        // 文件可能已被清理或不存在，忽略
      }
    }
  })

  it('后端服务可访问', async () => {
    const alive = await checkBackendAlive()
    expect(alive).toBe(true)
  })

  it('直接调用 API — 初始化上传任务', async () => {
    // 用独立的临时文件测试，避免与其他测试串扰
    const directFile = createTestFile()

    const resp = await http.post('/user/files/upload-tasks/init', {
      originalName: directFile.file.name,
      fileSize: directFile.size,
      fileMd5: directFile.md5,
      mimeType: 'image/png',
      referenceType: 'temp',
      category: 'temp',
      isPublic: 1,
      remark: '自动测试',
    })

    expect(resp.data.code).toBe(200)
    const data = resp.data.data
    expect(data.uploadId).toBeDefined()
    expect(data.taskId).toBeDefined()

    if (data.completed) {
      console.log(`[秒传] 命中！fileId=${data.fileId}`)
      if (data.businessId) await cleanupFile(data.businessId)
      return
    }

    if (data.uploadMode === 3) {
      console.log(`[全量上传] uploadId=${data.uploadId}`)
      const formData = new FormData()
      formData.append('file', directFile.file)

      const uploadResp = await http.post(
        `/user/files/upload-tasks/${data.uploadId}/file`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )

      expect(uploadResp.data.code).toBe(200)
      const result = uploadResp.data.data
      expect(result.fileId).toBeDefined()
      console.log(`[完成] fileId=${result.fileId}, fileUrl=${result.fileUrl}`)

      if (result.businessId) await cleanupFile(result.businessId)
    }
  })

  it('composable 完整流程 — 全量上传 temp 文件', async () => {
    const composable = useFileUpload({
      referenceType: 'temp',
      category: 'temp',
      isPublic: 1,
      remark: 'e2e 测试',
    })

    // 首次上传，应走全量流程
    const result = await composable.upload(fileInfo.file)

    expect(result.fileId).toBeDefined()
    expect(composable.stage.value).toBe('done')
    expect(composable.progress.value).toBe(100)
    console.log(
      `[composable] 上传成功: fileId=${result.fileId}, fileUrl=${result.fileUrl}, quickUpload=${result.quickUpload}`,
    )

    // 保留 businessId 给下一个测试（秒传），不在这里清理
  })

  it('composable 秒传 — 同一文件第二次上传应命中', async () => {
    const composable = useFileUpload({
      referenceType: 'temp',
      category: 'temp',
      isPublic: 1,
    })

    // 上传同一个文件（与上一个测试相同），应命中秒传
    const result = await composable.upload(fileInfo.file)

    expect(result.fileId).toBeDefined()
    expect(result.quickUpload).toBe(true)
    expect(composable.stage.value).toBe('done')
    console.log(`[秒传] 命中！fileId=${result.fileId}`)

    if (result.businessId) await cleanupFile(result.businessId)
  })
})
