/**
 * 通用响应结构
 * @module api-types/common
 * @description 所有API接口的统一响应格式定义
 */

/**
 * API统一响应结构
 * @description 所有接口的响应包装
 * @interface ApiResponse
 * @see 所有接口的响应格式
 */
export interface ApiResponse<T = unknown> {
  /** 业务状态码，200表示成功 */
  code: number
  /** 业务提示文案 */
  message: string
  /** 实际业务数据，可能是对象、数组、分页对象或null */
  data: T
  /** 服务端响应时间戳，毫秒 */
  timestamp?: number
}

/**
 * 分页结果结构
 * @description 分页接口的data固定格式
 * @interface PageResult
 * @see 分页接口的data格式
 */
export interface PageResult<T> {
  /** 总记录数 */
  total: number
  /** 当前页码 */
  current: number
  /** 每页条数 */
  size: number
  /** 当前页数据 */
  records: T[]
  /** 总页数 */
  pages?: number
}

/**
 * API错误类型
 * @description 封装API调用错误
 * @interface ApiError
 * @extends Error
 */
export interface ApiError extends Error {
  /** 业务状态码 */
  code?: number
  /** 响应信息 */
  response?: {
    /** 响应数据 */
    data: ApiResponse
    /** HTTP状态码 */
    status: number
    /** HTTP状态文本 */
    statusText: string
  }
  /** 请求配置 */
  config?: unknown
}

/**
 * 令牌存储结构
 * @description 本地存储的令牌信息
 * @interface TokenStorage
 */
export interface TokenStorage {
  /** 访问令牌 */
  accessToken: string
  /** 刷新令牌 */
  refreshToken: string
  /** 过期时间戳，毫秒 */
  expiresAt: number
}