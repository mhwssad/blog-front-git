/**
 * 请求重试拦截器
 * 对网络错误和 5xx 服务端错误自动重试
 */

import type { AxiosError, AxiosInstance } from 'axios'
import type { ApiResponse } from '@/types/api-types'
import type { CustomAxiosRequestConfig, CustomInternalAxiosRequestConfig } from '../index'

const DEFAULT_RETRY_COUNT = 0
const DEFAULT_RETRY_DELAY = 1000

function isRetryableError(error: AxiosError<ApiResponse>): boolean {
  // 网络错误（无响应）
  if (!error.response) return true
  // 5xx 服务端错误
  if (error.response.status >= 500) return true
  return false
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 设置重试拦截器（应在令牌刷新拦截器之后设置）
 */
export function setupRetryInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.response.use(
    response => response,
    async (error: AxiosError<ApiResponse>) => {
      const config = error.config as CustomInternalAxiosRequestConfig | undefined
      if (!config) return Promise.reject(error)

      // 没有配置重试
      const maxRetries = (config as CustomAxiosRequestConfig).retryCount ?? DEFAULT_RETRY_COUNT
      if (maxRetries <= 0) return Promise.reject(error)

      // 不重试非网络错误/非5xx
      if (!isRetryableError(error)) return Promise.reject(error)

      // 已重试次数通过 __retryCount 标记
      const retryCount = (config as unknown as Record<string, unknown>).__retryCount as number || 0
      if (retryCount >= maxRetries) return Promise.reject(error)

      ;(config as unknown as Record<string, unknown>).__retryCount = retryCount + 1

      const retryDelay = (config as CustomAxiosRequestConfig).retryDelay ?? DEFAULT_RETRY_DELAY
      await delay(retryDelay)

      return axiosInstance(config)
    }
  )
}
