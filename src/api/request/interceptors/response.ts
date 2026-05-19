/**
 * 响应拦截器
 */

import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import type { ApiError, ApiResponse } from '@/types/api-types'
import { logger, handleApiError } from '@/utils/http'

function createApiError(response: AxiosResponse<ApiResponse>): ApiError {
  const error = new Error(response.data.message || '请求失败') as ApiError
  error.code = response.data.code
  error.response = {
    data: response.data,
    status: response.status,
    statusText: response.statusText
  }
  error.config = response.config
  return error
}

async function normalizeResponse(
  response: AxiosResponse<ApiResponse | Blob>
): Promise<AxiosResponse<ApiResponse | Blob>> {
  const expectsBlob = response.config.responseType === 'blob'
  if (!expectsBlob || typeof Blob === 'undefined' || !(response.data instanceof Blob)) {
    return response
  }

  const contentType = String(response.headers?.['content-type'] || response.data.type || '')
  if (!contentType.toLowerCase().includes('json')) {
    return response
  }

  try {
    const text = await response.data.text()
    return {
      ...response,
      data: JSON.parse(text) as ApiResponse,
    }
  } catch {
    return response
  }
}

/**
 * 设置响应拦截器
 */
export function setupResponseInterceptor(axiosInstance: AxiosInstance, onUnauthorized?: () => void): void {
  axiosInstance.interceptors.response.use(
    async (rawResponse: AxiosResponse<ApiResponse | Blob>) => {
      const response = await normalizeResponse(rawResponse)

      // 打印响应日志
      logger.response({
        url: response.config.url,
        status: response.status,
        data: response.data
      })

      if (response.config.responseType === 'blob' && response.data instanceof Blob) {
        return response
      }

      const apiResponse = response as AxiosResponse<ApiResponse>

      // 检查业务状态码
      const { code } = apiResponse.data

      // code 为 200 表示成功
      if (code === 200) {
        return apiResponse
      }

      // code 为 401 表示未授权或令牌过期
      if (code === 401) {
        if (onUnauthorized) {
          onUnauthorized()
        }
        return Promise.reject(createApiError(apiResponse))
      }

      // 其他业务错误
      const error = createApiError(apiResponse)
      handleApiError(error)

      return Promise.reject(error)
    },
    (error: AxiosError<ApiResponse>) => {
      // HTTP 状态码错误
      logger.error(error)

      // 401 错误交由刷新逻辑处理
      if (error.response?.status === 401) {
        if (onUnauthorized) {
          onUnauthorized()
        }
        return Promise.reject(error)
      }

      // 其他错误处理
      handleApiError(error)
      return Promise.reject(error)
    }
  )
}
