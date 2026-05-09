/**
 * 博客迁移 API 类型
 * @module api-types/migration
 * @see docs/api文档/migration-api.md
 */

import type { PageResult } from './common'

// ==================== 枚举 ====================

/**
 * 迁移任务状态
 * @description 任务从创建到完成的生命周期状态
 */
export enum MigrationTaskStatus {
  /** 已创建 */
  CREATED = 0,
  /** 预检通过 */
  PRECHECKED = 1,
  /** 执行中 */
  RUNNING = 2,
  /** 已完成 */
  COMPLETED = 3,
  /** 失败 */
  FAILED = 4,
  /** 已取消 */
  CANCELLED = 5,
}

/**
 * 迁移记录状态
 * @description 单篇文章的迁移处理状态
 */
export enum MigrationRecordStatus {
  /** 待处理 */
  PENDING = 0,
  /** 成功 */
  SUCCESS = 1,
  /** 失败 */
  FAILED = 2,
  /** 已跳过 */
  SKIPPED = 3,
}

// ==================== 视图对象 ====================

/**
 * 迁移任务视图对象
 * @description 迁移任务的基本信息
 * @interface BlogMigrationTaskVO
 * @see POST /api/sys/migrations/blog/tasks - 创建任务响应
 * @see POST /api/sys/migrations/blog/tasks/{id}/execute - 执行导入响应
 * @see GET /api/sys/migrations/blog/tasks/{id} - 查询任务详情响应
 */
export interface BlogMigrationTaskVO {
  /** 任务 ID */
  id: number
  /** 作者 ID */
  authorId: number
  /** 来源平台 */
  sourcePlatform: string
  /** 任务状态 */
  status: MigrationTaskStatus
  /** 总文章数 */
  totalCount: number
  /** 成功数 */
  successCount: number
  /** 失败数 */
  failedCount: number
  /** 跳过数 */
  skippedCount: number
  /** 创建时间 */
  createdAt: string
}

/**
 * 迁移记录视图对象
 * @description 单篇文章的迁移处理记录
 * @interface BlogMigrationRecordVO
 * @see GET /api/sys/migrations/blog/tasks/{id}/records - 分页查询记录响应
 */
export interface BlogMigrationRecordVO {
  /** 记录 ID */
  id: number
  /** 外部文章 ID */
  externalPostId: string
  /** 文章标题 */
  title: string
  /** 处理状态 */
  status: MigrationRecordStatus
  /** 错误信息 */
  errorMessage: string | null
}

/**
 * 迁移预检结果视图对象
 * @description 执行预检后的结果
 * @interface BlogMigrationPrecheckResultVO
 * @see POST /api/sys/migrations/blog/tasks/{id}/precheck - 执行预检响应
 */
export interface BlogMigrationPrecheckResultVO {
  /** 任务 ID */
  taskId: number
  /** 总文章数 */
  totalCount: number
  /** 是否通过 */
  passed: boolean
  /** 错误明细 */
  errors: BlogMigrationRecordVO[]
}

// ==================== 请求类型 ====================

/**
 * 创建迁移任务请求
 * @description 表单数据，包含作者 ID、备注和 JSON 文件
 * @interface CreateMigrationTaskRequest
 * @see POST /api/sys/migrations/blog/tasks - 创建任务
 */
export interface CreateMigrationTaskRequest {
  /** 导入文章归属作者 ID */
  authorId: number
  /** 备注，最多 256 字符 */
  remark?: string
  /** JSON 迁移文件 */
  file: File
}

/**
 * 迁移任务查询请求
 * @description 分页查询任务的筛选条件
 * @interface MigrationTaskQueryRequest
 * @see GET /api/sys/migrations/blog/tasks - 分页查询任务
 */
export interface MigrationTaskQueryRequest {
  /** 页码，默认 1 */
  current?: number
  /** 每页条数，最大 100 */
  size?: number
  /** 任务状态 */
  status?: MigrationTaskStatus
  /** 来源平台 */
  sourcePlatform?: string
  /** 作者 ID */
  authorId?: number
}

/**
 * 迁移记录查询请求
 * @description 分页查询记录的筛选条件
 * @interface MigrationRecordQueryRequest
 * @see GET /api/sys/migrations/blog/tasks/{id}/records - 分页查询记录
 */
export interface MigrationRecordQueryRequest {
  /** 页码，默认 1 */
  current?: number
  /** 每页条数，最大 100 */
  size?: number
  /** 记录状态 */
  status?: MigrationRecordStatus
}

// ==================== 响应类型 ====================

/**
 * 迁移任务分页响应
 * @description 分页查询任务列表的响应
 * @interface MigrationTaskPageVO
 * @see GET /api/sys/migrations/blog/tasks - 分页查询任务响应
 */
export interface MigrationTaskPageVO extends PageResult<BlogMigrationTaskVO> {}

/**
 * 迁移记录分页响应
 * @description 分页查询记录列表的响应
 * @interface MigrationRecordPageVO
 * @see GET /api/sys/migrations/blog/tasks/{id}/records - 分页查询记录响应
 */
export interface MigrationRecordPageVO extends PageResult<BlogMigrationRecordVO> {}
