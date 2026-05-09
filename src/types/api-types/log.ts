/**
 * 日志管理类型
 * @module api-types/log
 * @see docs/api文档/auth-api.md
 */

// ==================== 后台日志管理 ====================

/**
 * 日志查询请求
 * @description 后台分页查询系统日志
 * @interface LogQueryRequest
 * @see GET /api/sys/logs - 查询参数
 */
export interface LogQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10 */
  size?: number
  /** 日志模块 */
  module?: string
  /** 请求方式（如GET/POST） */
  requestMethod?: string
  /** 请求路径 */
  requestUri?: string
  /** IP地址 */
  ip?: string
  /** 创建人 */
  createBy?: string
  /** 创建开始时间 */
  createTimeStart?: string
  /** 创建结束时间 */
  createTimeEnd?: string
}

/**
 * 审计日志查询请求
 * @see GET /api/sys/audit-logs - 查询参数
 */
export interface AuditLogQueryRequest {
  current?: number
  size?: number
  operatorUserId?: number
  targetUserId?: number
  operationType?: string
}

/**
 * 审计日志视图对象
 * @see GET /api/sys/audit-logs - 响应项
 * @see GET /api/sys/audit-logs/{id} - 响应
 */
export interface AuditLogVO {
  id: number
  operatorUserId: number
  operatorUsername: string
  targetUserId?: number
  targetUsername?: string
  operationType: string
  operationTypeDesc?: string
  targetTypeName?: string
  targetId?: number
  beforeState?: string
  afterState?: string
  mfaPassed?: number
  requestIp?: string
  userAgent?: string
  remark?: string
  createdAt: string
}

/**
 * 后台系统日志视图对象
 * @description 后台系统日志详情
 * @interface SysLogAdminVO
 * @see GET /api/sys/logs - 响应项
 * @see GET /api/sys/logs/{id} - 响应
 */
export interface SysLogAdminVO {
  /** 日志ID */
  id: number
  /** 日志模块 */
  module: string
  /** 日志动作 */
  action: string
  /** 日志描述 */
  description: string
  /** 用户名 */
  username: string
  /** IP地址 */
  ip: string
  /** 地理位置 */
  location: string
  /** User-Agent */
  userAgent: string
  /** 请求方式 */
  requestMethod: string
  /** 请求URL */
  requestUrl: string
  /** 请求路径 */
  requestUri?: string
  /** 请求参数 */
  requestParams?: string
  /** 响应内容 */
  responseContent?: string
  /** 日志内容 */
  content?: string
  /** 处理方法 */
  method?: string
  /** 省份 */
  province?: string
  /** 城市 */
  city?: string
  /** 执行耗时（毫秒） */
  executionTime?: number
  /** 浏览器 */
  browser?: string
  /** 浏览器版本 */
  browserVersion?: string
  /** 操作系统 */
  os?: string
  /** 创建人ID */
  createBy?: number
  /** 执行耗时（毫秒） */
  executeTime: number
  /** 状态 */
  status: number
  /** 创建时间 */
  createTime: string
}

/**
 * 清理日志请求
 * @description 按条件清理系统日志
 * @interface SysLogCleanRequest
 * @see POST /api/sys/logs/clean - 请求体
 */
export interface SysLogCleanRequest {
  /** 日志模块 */
  module?: string
  /** 请求方式 */
  requestMethod?: string
  /** 请求路径 */
  requestUri?: string
  /** IP地址 */
  ip?: string
  /** 创建人 */
  createBy?: string
  /** 创建开始时间 */
  createTimeStart?: string
  /** 创建结束时间 */
  createTimeEnd?: string
}
