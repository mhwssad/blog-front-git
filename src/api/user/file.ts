/**
 * 用户文件管理 API
 * 基于 auth-api.md 文档 第6节
 */

import { http } from '../request'
import type {
  ChunkUploadVO,
  FileUploadInitRequest,
  FileUploadInitVO,
  FileUploadResultVO,
  PageResult,
  UserFilePageQueryRequest,
  UserFileTaskPageQueryRequest,
  UserFileTaskVO,
  UserFileVO,
} from '@/types/api-types'

const multipartHeaders = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
}

/**
 * 用户文件 API
 * 提供文件上传、分页查询、删除等功能
 */
export class UserFileApi {
  /**
   * 6.1 初始化上传任务
   * POST /api/user/files/upload-tasks/init
   */
  static initUploadTask(data: FileUploadInitRequest) {
    return http.post<FileUploadInitVO>('/user/files/upload-tasks/init', data)
  }

  /**
   * 6.2 快速检查上传任务状态
   * POST /api/user/files/upload-tasks/{uploadId}/quick-check
   */
  static quickCheckUploadTask(uploadId: string) {
    return http.post<FileUploadResultVO>(`/user/files/upload-tasks/${uploadId}/quick-check`)
  }

  /**
   * 6.3 上传文件（简单模式）
   * POST /api/user/files/upload-tasks/{uploadId}/file
   */
  static uploadFile(uploadId: string, data: FormData) {
    return http.post<FileUploadResultVO>(
      `/user/files/upload-tasks/${uploadId}/file`,
      data,
      multipartHeaders
    )
  }

  /**
   * 6.4 上传分片（分片模式）
   * POST /api/user/files/upload-tasks/{uploadId}/chunks/{chunkNumber}
   */
  static uploadChunk(uploadId: string, chunkNumber: number, data: FormData) {
    return http.post<ChunkUploadVO>(
      `/user/files/upload-tasks/${uploadId}/chunks/${chunkNumber}`,
      data,
      multipartHeaders
    )
  }

  /**
   * 6.5 完成上传任务
   * POST /api/user/files/upload-tasks/{uploadId}/complete
   */
  static completeUploadTask(uploadId: string) {
    return http.post<FileUploadResultVO>(`/user/files/upload-tasks/${uploadId}/complete`)
  }

  /**
   * 6.6 分页查询我的文件列表
   * GET /api/user/files
   */
  static getMyFiles(params?: UserFilePageQueryRequest) {
    return http.get<PageResult<UserFileVO>>('/user/files', params)
  }

  /**
   * 6.7 分页查询我的上传任务列表
   * GET /api/user/files/upload-tasks
   */
  static getMyUploadTasks(params?: UserFileTaskPageQueryRequest) {
    return http.get<PageResult<UserFileTaskVO>>('/user/files/upload-tasks', params)
  }

  /**
   * 6.8 删除我的文件
   * DELETE /api/user/files/{businessId}
   */
  static deleteMyFile(businessId: number) {
    return http.delete<void>(`/user/files/${businessId}`)
  }
}

export default UserFileApi
