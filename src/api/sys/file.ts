/**
 * 文件管理模块 API
 * 基于 auth-api.md 文档
 */

import { http } from '../request'
import type {
  FileAdminPageQueryRequest,
  FileAdminVO,
  FileDetailVO,
  FileStatusUpdateRequest,
  FileTaskAdminVO,
  FileTaskPageQueryRequest,
  PageResult,
} from '@/types/api-types'

/**
 * 系统文件管理 API
 * 提供文件的查询、状态修改、删除和上传任务查询操作
 */
export class SysFileApi {
  /**
   * 分页查询文件列表
   * GET /api/sys/files
   */
  static getFiles(params?: FileAdminPageQueryRequest) {
    return http.get<PageResult<FileAdminVO>>('/sys/files', params)
  }

  /**
   * 查询文件详情
   * GET /api/sys/files/{id}
   */
  static getFileById(id: number) {
    return http.get<FileDetailVO>(`/sys/files/${id}`)
  }

  /**
   * 修改文件状态
   * PUT /api/sys/files/{id}/status
   */
  static updateFileStatus(id: number, data: FileStatusUpdateRequest) {
    return http.put<void>(`/sys/files/${id}/status`, data)
  }

  /**
   * 删除文件
   * DELETE /api/sys/files/{id}
   */
  static deleteFile(id: number) {
    return http.delete<void>(`/sys/files/${id}`)
  }

  /**
   * 分页查询上传任务列表
   * GET /api/sys/files/upload-tasks
   */
  static getUploadTasks(params?: FileTaskPageQueryRequest) {
    return http.get<PageResult<FileTaskAdminVO>>('/sys/files/upload-tasks', params)
  }
}

export default SysFileApi
