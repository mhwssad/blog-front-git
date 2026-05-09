/**
 * 用户文件管理 API
 * 基于 file-api.md 文档
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

/**
 * 用户文件 API
 * 提供文件上传、分页查询、删除等功能
 */
export class UserFileApi {
  /**
   * 4.1 初始化上传任务
   * POST /api/user/files/upload-tasks/init
   */
  static initUploadTask(data: FileUploadInitRequest) {
    return http.post<FileUploadInitVO>('/user/files/upload-tasks/init', data)
  }

  /**
   * 4.2 秒传检测
   * POST /api/user/files/upload-tasks/{uploadId}/quick-check
   */
  static quickCheckUploadTask(uploadId: string) {
    return http.post<FileUploadResultVO>(`/user/files/upload-tasks/${uploadId}/quick-check`)
  }

  /**
   * 4.3 普通上传
   * POST /api/user/files/upload-tasks/{uploadId}/file
   */
  static uploadFile(uploadId: string, data: FormData) {
    return http.post<FileUploadResultVO>(
      `/user/files/upload-tasks/${uploadId}/file`,
      data,
    )
  }

  /**
   * 4.4 上传分片
   * POST /api/user/files/upload-tasks/{uploadId}/chunks/{chunkNumber}
   */
  static uploadChunk(uploadId: string, chunkNumber: number, data: FormData) {
    return http.post<ChunkUploadVO>(
      `/user/files/upload-tasks/${uploadId}/chunks/${chunkNumber}`,
      data,
    )
  }

  /**
   * 4.5 完成上传
   * POST /api/user/files/upload-tasks/{uploadId}/complete
   */
  static completeUploadTask(uploadId: string) {
    return http.post<FileUploadResultVO>(`/user/files/upload-tasks/${uploadId}/complete`)
  }

  /**
   * 4.6 查询我的文件
   * GET /api/user/files
   */
  static getMyFiles(params?: UserFilePageQueryRequest) {
    return http.get<PageResult<UserFileVO>>('/user/files', params)
  }

  /**
   * 4.7 查询我的上传任务
   * GET /api/user/files/upload-tasks
   */
  static getMyUploadTasks(params?: UserFileTaskPageQueryRequest) {
    return http.get<PageResult<UserFileTaskVO>>('/user/files/upload-tasks', params)
  }

  /**
   * 4.8 删除我的文件引用
   * DELETE /api/user/files/{businessId}
   */
  static deleteMyFile(businessId: number) {
    return http.delete<void>(`/user/files/${businessId}`)
  }
}

export default UserFileApi
