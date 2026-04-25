/**
 * HTTP 请求工具函数
 * 包含 Token 管理、错误处理、日志等工具函数
 */

import { ElMessage } from 'element-plus'
import type { ApiError } from '@/types/api-types'
import { apiConfig } from '@/config'
import { createLogger } from '@/utils/logger'

/**
 * 错误码映射表
 */
const ERROR_CODE_MAP: Record<number, string> = {
  400: '请求参数错误',
  401: '登录已过期，请重新登录',
  403: '没有权限访问',
  404: '请求的资源不存在',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
}

/**
 * 判断是否为开发环境
 */
export const isDev = import.meta.env.MODE === 'development'

const requestLogger = createLogger('http')

/**
 * 请求日志
 */
interface RequestLogPayload {
  url?: string
  method?: string
  params?: unknown
  data?: unknown
  headers?: unknown
}

interface ResponseLogPayload {
  url?: string
  status?: number
  data?: unknown
}

export const logger = {
  request: (config: RequestLogPayload) => {
    if (apiConfig.enableRequestLog) {
      requestLogger.debug('Request', config)
    }
  },
  response: (response: ResponseLogPayload) => {
    if (apiConfig.enableRequestLog) {
      requestLogger.debug('Response', response)
    }
  },
  error: (error: unknown) => {
    requestLogger.error('Request error', error)
  },
}

/**
 * 获取错误提示信息
 */
export function getErrorMessage(error: ApiError | Error | unknown): string {
  const normalizedError = error as ApiError | Error
  const errorWithCode = normalizedError as { code?: unknown }

  // 从响应中获取错误信息
  if (
    'response' in (normalizedError as object) &&
    (normalizedError as ApiError).response?.data?.message
  ) {
    return (normalizedError as ApiError).response!.data.message
  }

  // 根据状态码获取错误信息
  if ('response' in (normalizedError as object)) {
    const status = (normalizedError as ApiError).response?.status
    if (status && ERROR_CODE_MAP[status]) {
      return ERROR_CODE_MAP[status]
    }
  }

  // 网络错误或超时
  if (typeof errorWithCode.code === 'string' && errorWithCode.code === 'ECONNABORTED') {
    return '请求超时，请稍后重试'
  }

  if (!window.navigator.onLine) {
    return '网络连接已断开，请检查网络'
  }

  // 默认错误信息
  return normalizedError.message || '请求失败，请稍后重试'
}

/**
 * 显示错误提示
 */
export function showErrorToast(message: string): void {
  ElMessage.error(message)
}

/**
 * 处理 API 错误
 */
export function handleApiError(error: ApiError | Error | unknown): void {
  const message = getErrorMessage(error)
  logger.error(error)
  showErrorToast(message)
}

/**
 * 存储键名
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  EXPIRES_AT: 'expires_at',
}

/**
 * 获取访问令牌
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
}

/**
 * 获取刷新令牌
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
}

/**
 * 获取过期时间
 */
export function getExpiresAt(): number | null {
  const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT)
  return expiresAt ? Number.parseInt(expiresAt, 10) : null
}

/**
 * 保存令牌
 */
export function saveTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
  const expiresAt = Date.now() + expiresIn * 1000
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
  localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(expiresAt))
}

/**
 * 清除认证数据
 */
export function clearAuthData(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT)
}

/**
 * 判断令牌是否即将过期（剩余时间少于5分钟）
 */
export function isTokenExpiringSoon(): boolean {
  const expiresAt = getExpiresAt()
  if (!expiresAt) return true
  // 提前5分钟判断为即将过期
  return Date.now() > expiresAt - 5 * 60 * 1000
}

/**
 * 判断令牌是否已过期
 */
export function isTokenExpired(): boolean {
  const expiresAt = getExpiresAt()
  if (!expiresAt) return true
  return Date.now() > expiresAt
}