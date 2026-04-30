/**
 * Axios 实例配置和导出
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types/api-types'
import { setupRequestInterceptor } from './interceptors/request'
import { setupResponseInterceptor } from './interceptors/response'
import { setupTokenRefreshInterceptor } from './interceptors/refresh'

// 创建 axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
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
    instance.patch<ApiResponse<T>>(url, data, config)
}

export default instance
