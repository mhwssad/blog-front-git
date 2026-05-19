import { ref } from 'vue'
import SparkMD5 from 'spark-md5'
import { ElMessage } from 'element-plus'
import { UserFileApi } from '@/api/user/file'
import type { FileUploadInitRequest } from '@/types/api-types'
import { log } from './useLogger'

// ==================== 常量 ====================

// 分片大小：5MB
const CHUNK_SIZE = 5 * 1024 * 1024
// 触发分片上传的文件大小阈值：6MB（大于此值才分片）
const CHUNK_SIZE_THRESHOLD = 6 * 1024 * 1024
// 最大文件尺寸：100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024
// MD5 计算时的分块读取大小：2MB（避免大文件读取溢出）
const MD5_BLOCK_SIZE = 2 * 1024 * 1024

// ==================== 类型 ====================

export type UploadStage =
  | 'idle'
  | 'hashing'
  | 'init'
  | 'quick-check'
  | 'uploading'
  | 'merging'
  | 'done'

export interface UseFileUploadOptions {
  // 关联业务类型（如 'article'|'comment'）
  referenceType?: string
  // 关联业务 ID
  referenceId?: number
  // 文件分类（如 'avatar'|'image'|'video'）
  category?: string
  // 是否公开文件：1=公开，0=私有
  isPublic?: number
  // 文件备注
  remark?: string
  // 并发上传的分片数（默认 3）
  concurrency?: number
  // 分片大小（字节），默认 5MB
  chunkSize?: number
  // 触发分片上传的文件大小阈值（字节），默认 6MB
  chunkSizeThreshold?: number
  // 最大文件尺寸（字节），默认 100MB
  maxFileSize?: number
  // MD5 计算时的分块读取大小（字节），默认 2MB
  md5BlockSize?: number
}

export interface UploadResult {
  // 后端文件记录 ID
  fileId?: number
  // 关联业务 ID（如文章 ID）
  businessId?: number
  // 文件访问 URL
  fileUrl?: string | null
  // 是否为秒传（true 表示文件已存在直接复用）
  quickUpload: boolean
}

// ==================== Composable ====================

export function useFileUpload(defaultOptions?: UseFileUploadOptions) {
  const uploading = ref(false)
  const progress = ref(0)
  const stage = ref<UploadStage>('idle')
  const fileName = ref('')

  // 合并默认配置
  const config = {
    chunkSize: defaultOptions?.chunkSize ?? CHUNK_SIZE,
    chunkSizeThreshold: defaultOptions?.chunkSizeThreshold ?? CHUNK_SIZE_THRESHOLD,
    maxFileSize: defaultOptions?.maxFileSize ?? MAX_FILE_SIZE,
    md5BlockSize: defaultOptions?.md5BlockSize ?? MD5_BLOCK_SIZE,
  }

  // ==================== 内部方法 ====================

  /**
   * 增量计算文件 MD5（SparkMD5 分块读取，避免大文件内存溢出）
   * @param file 待计算的文件
   * @returns MD5 字符串
   */
  function calculateMD5(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const spark = new SparkMD5.ArrayBuffer()
      const reader = new FileReader()
      // 按 md5BlockSize 分块读取，totalBlocks 为总块数
      const totalBlocks = Math.ceil(file.size / config.md5BlockSize)
      let currentBlock = 0

      // 每块读取完成后追加到 MD5 计算器
      reader.onload = (e) => {
        if (!e.target?.result) return
        spark.append(e.target.result as ArrayBuffer)
        currentBlock++
        if (currentBlock < totalBlocks) {
          loadNext()
        } else {
          // 所有块读取完毕，获取最终 MD5
          resolve(spark.end())
        }
      }

      reader.onerror = () => reject(reader.error ?? new Error('文件读取失败'))

      // 加载下一块
      function loadNext(): void {
        const start = currentBlock * config.md5BlockSize
        const end = Math.min(start + config.md5BlockSize, file.size)
        reader.readAsArrayBuffer(file.slice(start, end))
      }

      loadNext()
    })
  }

  /**
   * 将文件按指定大小切片
   * @param file 原始文件
   * @param chunkSize 单个分片大小（字节）
   * @returns 分片 Blob 数组
   */
  function sliceFile(file: File, chunkSize: number): Blob[] {
    const total = Math.ceil(file.size / chunkSize)
    return Array.from({ length: total }, (_, i) => {
      const start = i * chunkSize
      return file.slice(start, Math.min(start + chunkSize, file.size))
    })
  }

  /**
   * 并发上传分片（工人池模式）
   * 服务端支持同一分片重复上传（幂等覆盖），所以始终从第 1 片开始，
   * 利用服务端的覆盖机制跳过已完成的分片，避免依赖不可靠的 uploadedChunks 计数推断。
   * @param uploadId 上传任务 ID
   * @param chunks 分片数组（含 chunkMd5）
   * @param totalChunks 总分片数
   * @param concurrency 并发工人数
   */
  async function uploadChunksConcurrently(
    uploadId: string,
    chunks: { blob: Blob; md5: string }[],
    totalChunks: number,
    concurrency: number,
  ): Promise<void> {
    const queue = Array.from({ length: totalChunks }, (_, i) => i + 1)
    let completed = 0

    async function worker(): Promise<void> {
      while (queue.length > 0) {
        const index = queue.shift()
        if (index === undefined) break
        const chunk = chunks[index - 1]
        if (!chunk) break
        const formData = new FormData()
        formData.append('file', chunk.blob)
        formData.append('chunkMd5', chunk.md5)
        await UserFileApi.uploadChunk(uploadId, index, formData)
        completed++
        progress.value = Math.round((completed / totalChunks) * 100)
      }
    }

    const workerCount = Math.min(concurrency, queue.length)
    await Promise.all(Array.from({ length: workerCount }, () => worker()))
  }

  /**
   * 全量上传（小文件，直接一次性上传整个文件）
   * 普通上传流程：初始化 → uploadFile，不需要调用 complete（complete 仅适用于分片任务）
   * @param uploadId 上传任务 ID
   * @param file 原始文件
   * @returns 上传结果
   */
  async function handleFullUpload(uploadId: string, file: File): Promise<UploadResult> {
    stage.value = 'uploading'
    progress.value = 50

    const formData = new FormData()
    formData.append('file', file)
    const resp = await UserFileApi.uploadFile(uploadId, formData)
    const result = resp.data.data
    return {
      fileId: result.fileId,
      businessId: result.businessId,
      fileUrl: result.fileUrl,
      quickUpload: false,
    }
  }

  /**
   * 分片上传（含断点续传）
   * @param uploadId 上传任务 ID
   * @param file 原始文件
   * @param chunkSize 单个分片大小
   * @param totalChunks 总分片数
   * @param concurrency 并发数
   * @returns 上传结果
   */
  async function handleChunkedUpload(
    uploadId: string,
    file: File,
    chunkSize: number,
    totalChunks: number,
    concurrency: number,
  ): Promise<UploadResult> {
    const rawChunks = sliceFile(file, chunkSize)

    // 为每个分片计算 MD5，用于服务端校验分片完整性
    stage.value = 'uploading'
    const chunks: { blob: Blob; md5: string }[] = await Promise.all(
      rawChunks.map(async (blob) => ({
        blob,
        md5: await calculateMD5(blob as File),
      })),
    )

    // 从第 1 片开始上传，服务端支持同一分片重复上传（幂等覆盖），无需探针
    await uploadChunksConcurrently(uploadId, chunks, totalChunks, concurrency)

    // 所有分片上传完毕，通知后端合并
    stage.value = 'merging'
    progress.value = 95
    const resp = await UserFileApi.completeUploadTask(uploadId)
    const result = resp.data.data
    return {
      fileId: result.fileId,
      businessId: result.businessId,
      fileUrl: result.fileUrl,
      quickUpload: false,
    }
  }

  // ==================== 对外方法 ====================

  /**
   * 重置上传状态
   */
  function reset(): void {
    uploading.value = false
    progress.value = 0
    stage.value = 'idle'
    fileName.value = ''
  }

  /**
   * 统一上传入口 — 自动检测上传模式（秒传/分片/全量）
   * @param file 待上传的文件
   * @param options 上传选项（可覆盖默认值）
   * @returns 上传结果（含 fileId、businessId、fileUrl、quickUpload）
   */
  async function upload(file: File, options?: UseFileUploadOptions): Promise<UploadResult> {
    // 合并默认选项与传入选项
    const merged = { ...defaultOptions, ...options }
    const concurrency = merged.concurrency ?? 3
    const maxFileSize = merged.maxFileSize ?? config.maxFileSize
    const chunkSize = merged.chunkSize ?? config.chunkSize
    const chunkSizeThreshold = merged.chunkSizeThreshold ?? config.chunkSizeThreshold

    // 文件大小校验
    if (file.size > maxFileSize) {
      throw new Error(
        `文件大小 ${(file.size / 1024 / 1024).toFixed(1)}MB 超过最大限制 ${maxFileSize / 1024 / 1024}MB`,
      )
    }

    // 重置状态并标记为上传中
    reset()
    uploading.value = true
    fileName.value = file.name

    try {
      // 阶段 1：计算 MD5（用于秒传和任务初始化）
      log.file.info(`[上传] 开始计算 MD5: ${file.name}`)
      stage.value = 'hashing'
      const fileMd5 = await calculateMD5(file)
      log.file.info(`[上传] MD5 计算完成: ${fileMd5}`)

      // 阶段 2：初始化上传任务
      stage.value = 'init'
      // 超过阈值才启用分片上传，否则全量上传
      const needChunk = file.size > chunkSizeThreshold

      const initRequest: FileUploadInitRequest = {
        originalName: file.name,
        fileSize: file.size,
        fileMd5,
        mimeType: file.type || undefined,
        referenceType: merged.referenceType,
        referenceId: merged.referenceId,
        category: merged.category,
        isPublic: merged.isPublic,
        // 分片模式下才传分片相关参数
        totalChunks: needChunk ? Math.ceil(file.size / chunkSize) : undefined,
        chunkSize: needChunk ? chunkSize : undefined,
        remark: merged.remark,
      }

      const initResp = await UserFileApi.initUploadTask(initRequest)
      const initData = initResp.data.data

      if (!initData) {
        throw new Error('服务器未返回上传任务信息')
      }

      // 阶段 3-a：秒传命中 — 文件已存在于后端，直接返回
      if (initData.completed) {
        log.file.info(`[上传] 秒传命中，文件已存在: fileId=${initData.fileId}`)
        stage.value = 'done'
        progress.value = 100
        return {
          fileId: initData.fileId,
          businessId: initData.businessId,
          fileUrl: initData.fileUrl,
          quickUpload: true,
        }
      }

      // 阶段 3-b：快速检查 — 再次确认是否可秒传
      if (initData.quickUploadAvailable) {
        log.file.info(`[上传] 快速检查中...`)
        stage.value = 'quick-check'
        progress.value = 50
        const checkResp = await UserFileApi.quickCheckUploadTask(initData.uploadId)
        const checkResult = checkResp.data.data

        if (checkResult.quickUpload) {
          log.file.info(`[上传] 快速检查秒传命中: fileId=${checkResult.fileId}`)
          stage.value = 'done'
          progress.value = 100
          return {
            fileId: checkResult.fileId,
            businessId: checkResult.businessId,
            fileUrl: checkResult.fileUrl,
            quickUpload: true,
          }
        }
        // 秒传未命中，走正常上传流程
        log.file.info(`[上传] 快速检查未命中，将进行实际上传`)
      }

      // 阶段 4：实际上传（分片 or 全量）
      log.file.info(`[上传] 开始实际上传，uploadMode=${initData.uploadMode}`)
      let result: UploadResult

      if (initData.uploadMode === 2 && initData.totalChunks && initData.totalChunks > 1) {
        // 分片上传（uploadMode=2 表示后端要求分片）
        log.file.info(`[上传] 启用分片上传，共 ${initData.totalChunks} 片`)
        result = await handleChunkedUpload(
          initData.uploadId,
          file,
          initData.chunkSize ?? chunkSize,
          initData.totalChunks,
          concurrency,
        )
      } else {
        // 全量上传（兜底，包括 uploadMode 为 3 或未知值的情况）
        log.file.info(`[上传] 启用全量上传`)
        result = await handleFullUpload(initData.uploadId, file)
      }

      log.file.info(`[上传] 完成: fileId=${result.fileId}, businessId=${result.businessId}`)
      stage.value = 'done'
      progress.value = 100
      return result
    } catch (error) {
      stage.value = 'idle'
      const msg = error instanceof Error ? error.message : '上传失败'
      log.file.error(`[上传] 失败: ${msg}`)
      ElMessage.error(msg)
      throw error
    } finally {
      uploading.value = false
    }
  }

  return {
    uploading,
    progress,
    stage,
    fileName,
    upload,
    reset,
  }
}
