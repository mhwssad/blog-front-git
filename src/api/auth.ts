/**
 * 认证模块 API
 * 基于 auth-api.md 文档
 */

import { http } from './request'
import type {
  // 请求类型
  LoginRequest,
  EmailLoginRequest,
  SendEmailCodeRequest,
  RegisterRequest,
  RefreshTokenRequest,
  TakeoverLoginRequest,
  // 响应类型
  AuthenticationToken,
  AuthUserInfo,
  AuthMenuInfo,
} from '@/types/api-types'

/**
 * 认证 API
 */
export const authApi = {
  /**
   * 1.1 账号登录
   * POST /api/auth/login
   */
  login: (data: LoginRequest) =>
    http.post<AuthenticationToken>('/auth/login', data),

  /**
   * 1.3 发送邮箱登录验证码
   * POST /api/auth/email-code
   */
  sendEmailCode: (data: SendEmailCodeRequest) =>
    http.post<void>('/auth/email-code', data),

  /**
   * 1.4 邮箱验证码登录
   * POST /api/auth/email-login
   */
  emailLogin: (data: EmailLoginRequest) =>
    http.post<AuthenticationToken>('/auth/email-login', data),

  /**
   * 1.2 用户注册
   * POST /api/auth/register
   */
  register: (data: RegisterRequest) =>
    http.post<AuthenticationToken | null>('/auth/register', data, { skipAuth: true }),

  /**
   * 1.5 刷新令牌
   * POST /api/auth/refresh
   * @note 此接口内部使用，不携带 Authorization 头
   */
  refreshToken: (data: RefreshTokenRequest) =>
    http.post<AuthenticationToken>(
      '/auth/refresh',
      data,
      {
        skipAuth: true,
        skipRefresh: true,
      } // 刷新令牌时不携带过期令牌，也不再次触发刷新拦截
    ),

  /**
   * 1.6 退出登录
   * POST /api/auth/logout
   */
  logout: (accessToken?: string) =>
    http.post<void>('/auth/logout', { accessToken }),

  /**
   * 1.7 获取当前登录用户
   * GET /api/auth/current-user
   */
  getCurrentUser: () =>
    http.get<AuthUserInfo>('/auth/current-user'),

  /**
   * 1.8 获取当前用户菜单
   * GET /api/auth/current-user-menus
   */
  getCurrentUserMenus: () =>
    http.get<AuthMenuInfo[]>('/auth/current-user-menus'),

  /**
   * 11.1 使用接管令牌登录
   * POST /api/auth/takeover/login
   */
  takeoverLogin: (data: TakeoverLoginRequest) =>
    http.post<AuthenticationToken>('/auth/takeover/login', data),
}

export default authApi
