/**
 * 博客迁移 API
 * @module api/sys/migration
 * @see docs/api文档/migration-api.md
 */

import { http } from '../request'
import type {
  BlogMigrationTaskVO,
  BlogMigrationPrecheckResultVO,
  MigrationTaskPageVO,
  MigrationRecordPageVO,
  MigrationTaskQueryRequest,
  MigrationRecordQueryRequest,
} from '@/types/api-types'

export class MigrationApi {
  /**
   * 创建迁移任务
   * POST /api/sys/migrations/blog/tasks
   * @param formData 表单数据，包含 authorId、remark 和 file
   */
  static createTask(formData: FormData) {
    return http.post<BlogMigrationTaskVO>('/sys/migrations/blog/tasks', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  /**
   * 执行预检
   * POST /api/sys/migrations/blog/tasks/{id}/precheck
   * @param taskId 任务 ID
   */
  static precheck(taskId: number) {
    return http.post<BlogMigrationPrecheckResultVO>(`/sys/migrations/blog/tasks/${taskId}/precheck`)
  }

  /**
   * 执行导入
   * POST /api/sys/migrations/blog/tasks/{id}/execute
   * @param taskId 任务 ID
   */
  static execute(taskId: number) {
    return http.post<BlogMigrationTaskVO>(`/sys/migrations/blog/tasks/${taskId}/execute`)
  }

  /**
   * 分页查询任务
   * GET /api/sys/migrations/blog/tasks
   * @param params 查询参数
   */
  static getTasks(params?: MigrationTaskQueryRequest) {
    return http.get<MigrationTaskPageVO>('/sys/migrations/blog/tasks', params)
  }

  /**
   * 查询任务详情
   * GET /api/sys/migrations/blog/tasks/{id}
   * @param taskId 任务 ID
   */
  static getTaskDetail(taskId: number) {
    return http.get<BlogMigrationTaskVO>(`/sys/migrations/blog/tasks/${taskId}`)
  }

  /**
   * 分页查询记录
   * GET /api/sys/migrations/blog/tasks/{id}/records
   * @param taskId 任务 ID
   * @param params 查询参数
   */
  static getRecords(taskId: number, params?: MigrationRecordQueryRequest) {
    return http.get<MigrationRecordPageVO>(`/sys/migrations/blog/tasks/${taskId}/records`, params)
  }

  /**
   * 导出失败记录
   * GET /api/sys/migrations/blog/tasks/{id}/failures/export
   * @param taskId 任务 ID
   * @returns Blob Excel 文件
   */
  static exportFailures(taskId: number) {
    return http.get<Blob>(`/sys/migrations/blog/tasks/${taskId}/failures/export`, undefined, {
      responseType: 'blob',
    })
  }
}

export default MigrationApi
