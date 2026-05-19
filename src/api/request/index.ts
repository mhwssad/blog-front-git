/**
 * Axios 实例配置和导出
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types/api-types'
import { apiConfig } from '@/config'
import { setupRequestInterceptor } from './interceptors/request'
import { setupResponseInterceptor } from './interceptors/response'
import { setupTokenRefreshInterceptor } from './interceptors/refresh'
import { setupRetryInterceptor } from './interceptors/retry'

// 创建 axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

/**
 * 扩展请求配置，添加自定义属性
 */
export interface RequestControlConfig {
  skipAuth?: boolean // 跳过令牌注入
  skipRefresh?: boolean // 跳过令牌刷新
  retry?: boolean // 是否为重试请求
  /** 自动重试次数（仅对网络错误/5xx 生效） */
  retryCount?: number
  /** 重试间隔（毫秒），默认 1000 */
  retryDelay?: number
}

export interface CustomAxiosRequestConfig<D = unknown> extends AxiosRequestConfig<D>, RequestControlConfig {}

export interface CustomInternalAxiosRequestConfig<D = unknown>
  extends InternalAxiosRequestConfig<D>,
    RequestControlConfig {}

// 设置请求拦截器
setupRequestInterceptor(instance)

// 设置响应拦截器（业务错误处理）
setupResponseInterceptor(instance)

// 设置令牌刷新拦截器（必须在响应拦截器之后设置）
setupTokenRefreshInterceptor(instance)

// 设置重试拦截器（必须在令牌刷新拦截器之后设置）
setupRetryInterceptor(instance)

/**
 * 生成带 AbortController 的请求配置
 */
function withSignal(signal?: AbortSignal, config?: CustomAxiosRequestConfig): CustomAxiosRequestConfig {
  if (!signal) return config ?? {}
  return { ...config, signal }
}

/**
 * HTTP 请求方法封装
 */
export const http = {
  get: <T = unknown, P = unknown>(url: string, params?: P, config?: CustomAxiosRequestConfig) =>
    instance.get<ApiResponse<T>>(url, { params, ...config }),

  post: <T = unknown, D = unknown>(url: string, data?: D, config?: CustomAxiosRequestConfig<D>) =>
    instance.post<ApiResponse<T>>(url, data, config),

  put: <T = unknown, D = unknown>(url: string, data?: D, config?: CustomAxiosRequestConfig<D>) =>
    instance.put<ApiResponse<T>>(url, data, config),

  delete: <T = unknown, P = unknown>(url: string, params?: P, config?: CustomAxiosRequestConfig) =>
    instance.delete<ApiResponse<T>>(url, { params, ...config }),

  patch: <T = unknown, D = unknown>(url: string, data?: D, config?: CustomAxiosRequestConfig<D>) =>
    instance.patch<ApiResponse<T>>(url, data, config),

  /**
   * 批量并发请求，封装 Promise.all
   */
  all: <T extends readonly unknown[]>(requests: T): Promise<T> => {
    return Promise.all(requests)
  },

  /**
   * 创建 AbortController，用于取消请求
   */
  createAbortController: () => new AbortController(),

  /**
   * 发送带取消能力的 GET 请求
   */
  getWithAbort: <T = unknown, P = unknown>(
    url: string,
    params?: P,
    signal?: AbortSignal,
    config?: CustomAxiosRequestConfig
  ) => instance.get<ApiResponse<T>>(url, { params, ...withSignal(signal, config) }),

  /**
   * 发送带取消能力的 POST 请求
   */
  postWithAbort: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    signal?: AbortSignal,
    config?: CustomAxiosRequestConfig<D>
  ) => instance.post<ApiResponse<T>>(url, data, withSignal(signal, config)),
}

export default instance
