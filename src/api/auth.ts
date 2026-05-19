/**
 * 认证模块 API
 * 基于 auth-api.md 文档
 * @see docs/api文档/auth-api.md
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
  PasswordResetCodeRequest,
  PasswordResetSelfRequest,
  // 响应类型
  AuthenticationToken,
  AuthUserInfo,
  AuthMenuInfo,
  UserSearchVO,
  PageResult,
} from '@/types/api-types'

/**
 * 认证 API
 */
export class AuthApi {
  /**
   * 1.1 账号登录
   * POST /api/auth/login
   */
  static login(data: LoginRequest) {
    return http.post<AuthenticationToken>('/auth/login', data)
  }

  /**
   * 1.3 发送邮箱登录验证码
   * POST /api/auth/email-code
   */
  static sendEmailCode(data: SendEmailCodeRequest) {
    return http.post<void>('/auth/email-code', data)
  }

  /**
   * 1.4 邮箱验证码登录
   * POST /api/auth/email-login
   */
  static emailLogin(data: EmailLoginRequest) {
    return http.post<AuthenticationToken>('/auth/email-login', data)
  }

  /**
   * 1.2 用户注册
   * POST /api/auth/register
   */
  static register(data: RegisterRequest) {
    return http.post<AuthenticationToken>('/auth/register', data, { skipAuth: true })
  }

  /**
   * 1.5 刷新令牌
   * POST /api/auth/refresh
   * @note 此接口内部使用，不携带 Authorization 头
   */
  static refreshToken(data: RefreshTokenRequest) {
    return http.post<AuthenticationToken>('/auth/refresh', data, {
      skipAuth: true,
      skipRefresh: true,
    })
  }

  /**
   * 1.6 退出登录
   * POST /api/auth/logout
   */
  static logout(accessToken?: string) {
    return http.post<void>('/auth/logout', { accessToken })
  }

  /**
   * 1.7 获取当前登录用户
   * GET /api/auth/current-user
   */
  static getCurrentUser() {
    return http.get<AuthUserInfo>('/auth/current-user')
  }

  /**
   * 1.8 获取当前用户菜单
   * GET /api/auth/current-user-menus
   */
  static getCurrentUserMenus() {
    return http.get<AuthMenuInfo[]>('/auth/current-user-menus')
  }

  /**
   * 11.1 使用接管令牌登录
   * POST /api/auth/takeover/login
   */
  static takeoverLogin(data: TakeoverLoginRequest) {
    return http.post<AuthenticationToken>('/auth/takeover/login', data)
  }

  /**
   * 发送密码重置验证码
   * POST /api/auth/password-reset/code
   */
  static sendPasswordResetCode(data: PasswordResetCodeRequest) {
    return http.post<void>('/auth/password-reset/code', data, { skipAuth: true })
  }

  /**
   * 重置密码
   * POST /api/auth/password-reset
   */
  static resetPassword(data: PasswordResetSelfRequest) {
    return http.post<void>('/auth/password-reset', data, { skipAuth: true })
  }

  /**
   * 搜索用户（公开）
   * GET /api/users/search
   */
  static searchUsers(params?: { keyword?: string; current?: number; size?: number }) {
    return http.get<PageResult<UserSearchVO>>('/users/search', params)
  }
}

export default AuthApi
