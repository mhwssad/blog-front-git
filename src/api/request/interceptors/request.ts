/**
 * 请求拦截器
 */

import { AxiosHeaders, type AxiosInstance } from 'axios'
import type { CustomInternalAxiosRequestConfig } from '../index'
import { getAccessToken, logger } from '../utils'

/**
 * 生成请求 ID
 */
let requestId = 0
function generateRequestId(): string {
  return `req_${Date.now()}_${++requestId}`
}

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === 'string' && error.trim()) {
    return new Error(error)
  }

  return new Error('Request interceptor failed')
}

/**
 * 设置请求拦截器
 */
export function setupRequestInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.request.use(
    (config: CustomInternalAxiosRequestConfig) => {
      // 添加请求 ID
      const headers = AxiosHeaders.from(config.headers)
      headers.set('X-Request-ID', generateRequestId())

      // 注入令牌
      if (!config.skipAuth) {
        const token = getAccessToken()
        if (token) {
          headers.set('Authorization', `Bearer ${token}`)
        }
      }

      config.headers = headers

      // 打印请求日志
      logger.request({
        url: config.url,
        method: config.method?.toUpperCase(),
        params: config.params,
        data: config.data,
        headers: config.headers
      })

      return config
    },
    (error: unknown) => {
      const normalizedError = toError(error)
      logger.error(normalizedError)
      throw normalizedError
    }
  )
}
