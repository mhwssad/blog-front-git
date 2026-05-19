/**
 * 令牌刷新逻辑
 * 处理 401 错误时的自动令牌刷新和请求重试
 */

import { AxiosHeaders, type AxiosError, type AxiosInstance } from 'axios'
import type { ApiResponse } from '@/types/api-types'
import type { CustomAxiosRequestConfig, CustomInternalAxiosRequestConfig } from '../index'
import { getRefreshToken, saveTokens, clearAuthData } from '@/utils/http'

/**
 * 刷新状态管理
 */
const refreshState = {
  isRefreshing: false,
  failedQueue: Array<{
    resolve: (value: string | null) => void
    reject: (reason: Error) => void
  }>()
}

/**
 * 处理队列中的请求
 */
function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === 'string' && error.trim()) {
    return new Error(error)
  }

  return new Error('Token refresh failed')
}

function processQueue(error: Error | null, token: string | null = null): void {
  refreshState.failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token)
    }
  })

  refreshState.failedQueue = []
}

function toHeaderValue(value: unknown): string | number | boolean | null | undefined {
  if (value == null) {
    return value
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
    return value.join(', ')
  }

  return undefined
}

function withAuthHeader(
  config: CustomAxiosRequestConfig | CustomInternalAxiosRequestConfig,
  token: string
): CustomAxiosRequestConfig | CustomInternalAxiosRequestConfig {
  const headers = new AxiosHeaders()
  const originalHeaders = config.headers as Record<string, unknown> | AxiosHeaders | undefined

  const rawHeaders =
    originalHeaders instanceof AxiosHeaders ? originalHeaders.toJSON() : originalHeaders

  if (rawHeaders) {
    Object.entries(rawHeaders).forEach(([key, value]) => {
      const headerValue = toHeaderValue(value)
      if (headerValue !== undefined) {
        headers.set(key, headerValue)
      }
    })
  }

  headers.set('Authorization', `Bearer ${token}`)
  config.headers = headers
  return config
}

function getOriginalRequest(
  error: AxiosError<ApiResponse>
): CustomInternalAxiosRequestConfig | undefined {
  return (error.config || error.response?.config) as CustomInternalAxiosRequestConfig | undefined
}

function isUnauthorizedError(error: AxiosError<ApiResponse>): boolean {
  return error.response?.status === 401 || error.response?.data?.code === 401
}

async function syncAuthStoreFromStorage(): Promise<void> {
  try {
    const { useAuthStore } = await import('../../../stores')
    const authStore = useAuthStore()
    authStore.syncTokensFromStorage()
  } catch {
    // 请求层兜底逻辑，不阻塞主流程
  }
}

async function clearAuthStoreState(): Promise<void> {
  try {
    const { useAuthStore } = await import('../../../stores')
    const authStore = useAuthStore()
    authStore.clearAuthState()
  } catch {
    clearAuthData()
  }
}

/**
 * 刷新令牌
 */
async function refreshToken(): Promise<string> {
  const refreshTokenValue = getRefreshToken()

  if (!refreshTokenValue) {
    throw new Error('No refresh token available')
  }

  // 动态导入避免循环依赖
  const { AuthApi } = await import('../../auth')

  const response = await AuthApi.refreshToken({ refreshToken: refreshTokenValue })
  const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data.data

  // 保存新令牌
  saveTokens(accessToken, newRefreshToken, expiresIn)
  await syncAuthStoreFromStorage()

  return accessToken
}

/**
 * 设置令牌刷新拦截器
 */
export function setupTokenRefreshInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.response.use(
    response => response,
    async (error: AxiosError<ApiResponse>) => {
      const originalRequest = getOriginalRequest(error)

      if (!originalRequest) {
        return Promise.reject(error)
      }

      // 跳过刷新的请求直接返回错误
      if (originalRequest.skipRefresh || originalRequest.retry) {
        return Promise.reject(error)
      }

      // 只处理 HTTP 401 或业务 code=401
      if (!isUnauthorizedError(error)) {
        return Promise.reject(error)
      }

      // 如果正在刷新，将请求加入队列
      if (refreshState.isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          refreshState.failedQueue.push({ resolve, reject })
        })
          .then(token => {
            if (token) {
              withAuthHeader(originalRequest, token)
            }
            return axiosInstance(originalRequest)
          })
          .catch(err => {
            throw toError(err)
          })
      }

      // 开始刷新流程
      refreshState.isRefreshing = true

      try {
        const newToken = await refreshToken()

        // 刷新成功，处理队列中的请求
        processQueue(null, newToken)

        // 重试当前请求
        originalRequest.retry = true
        return axiosInstance(withAuthHeader(originalRequest, newToken))
      } catch (refreshError) {
        const normalizedRefreshError = toError(refreshError)

        // 刷新失败，清除数据
        processQueue(normalizedRefreshError, null)
        await clearAuthStoreState()
        throw normalizedRefreshError
      } finally {
        refreshState.isRefreshing = false
      }
    }
  )
}
