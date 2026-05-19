/**
 * 认证管理 Store
 * 基于 auth-api.md 文档 第1节
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { AuthApi } from '@/api/auth'
import { normalizeAuthMenus } from '@/router/menu'
import {
  hasAllPermissions as checkAllPermissions,
  hasAnyPermission as checkAnyPermission,
  hasPermission as checkPermission,
  isSuperAdmin as checkSuperAdmin,
  type PermissionRequirement,
} from '@/utils/permission'
import type {
  LoginRequest,
  EmailLoginRequest,
  SendEmailCodeRequest,
  RegisterRequest,
  PasswordResetCodeRequest,
  PasswordResetSelfRequest,
  AuthenticationToken,
  AuthUserInfo,
  AuthMenuInfo,
  UserSearchVO,
} from '@/types/api-types'

export const useAuthStore = defineStore('auth', () => {
  // ==================== 状态 ====================

  /**
   * 访问令牌
   */
  const accessToken = ref<string | null>(null)

  /**
   * 刷新令牌
   */
  const refreshToken = ref<string | null>(null)

  /**
   * 令牌过期时间（时间戳）
   */
  const expiresAt = ref<number | null>(null)

  /**
   * 当前用户信息
   */
  const currentUser = ref<AuthUserInfo | null>(null)

  /**
   * 当前用户菜单
   */
  const userMenus = ref<AuthMenuInfo[]>([])

  /**
   * 是否正在加载
   */
  const loading = ref(false)

  /**
   * 认证上下文是否已初始化
   */
  const initialized = ref(false)

  /**
   * 是否已登录
   */
  const isLoggedIn = computed(() => !!accessToken.value && !isTokenExpired())

  // ==================== 存储键名 ====================

  const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    EXPIRES_AT: 'expires_at'
  }

  // ==================== 工具函数 ====================

  /**
   * 判断令牌是否已过期
   */
  function isTokenExpired(): boolean {
    if (!expiresAt.value) return true
    return Date.now() > expiresAt.value
  }

  /**
   * 保存令牌到 localStorage
   */
  function saveTokensToStorage(token: AuthenticationToken): void {
    const expires = Date.now() + token.expiresIn * 1000
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token.accessToken)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token.refreshToken)
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(expires))
  }

  /**
   * 将认证令牌同步到状态和本地存储
   */
  function applyToken(token: AuthenticationToken): void {
    accessToken.value = token.accessToken
    refreshToken.value = token.refreshToken
    expiresAt.value = Date.now() + token.expiresIn * 1000
    saveTokensToStorage(token)
  }

  /**
   * 从 localStorage 恢复令牌
   */
  function loadTokensFromStorage(): void {
    accessToken.value = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    refreshToken.value = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    const expires = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT)
    expiresAt.value = expires ? Number.parseInt(expires, 10) : null
  }

  function syncTokensFromStorage(): void {
    loadTokensFromStorage()
  }

  /**
   * 仅清理内存中的用户上下文
   */
  function resetUserContext(): void {
    currentUser.value = null
    userMenus.value = []
  }

  /**
   * 清除令牌和用户上下文
   */
  function clearTokens(): void {
    accessToken.value = null
    refreshToken.value = null
    expiresAt.value = null
    resetUserContext()
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT)
  }

  function clearAuthState(): void {
    clearTokens()
  }

  // ==================== 认证操作 ====================

  /**
   * 账号密码登录
   */
  async function login(data: LoginRequest): Promise<void> {
    loading.value = true
    try {
      const response = await AuthApi.login(data)
      const token = response.data.data

      applyToken(token)
      await fetchCurrentUser()
      await fetchUserMenus()
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  /**
   * 发送邮箱验证码
   */
  async function sendEmailCode(data: SendEmailCodeRequest): Promise<void> {
    await AuthApi.sendEmailCode(data)
  }

  /**
   * 邮箱验证码登录
   */
  async function emailLogin(data: EmailLoginRequest): Promise<void> {
    loading.value = true
    try {
      const response = await AuthApi.emailLogin(data)
      const token = response.data.data

      applyToken(token)
      await fetchCurrentUser()
      await fetchUserMenus()
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  /**
   * 用户注册
   */
  async function register(data: RegisterRequest): Promise<{ autoLoggedIn: boolean }> {
    loading.value = true
    try {
      const response = await AuthApi.register(data)
      const token = response.data.data

      if (token?.accessToken && token?.refreshToken) {
        applyToken(token)
        await fetchCurrentUser()
        await fetchUserMenus()
        initialized.value = true
        return { autoLoggedIn: true }
      }

      return { autoLoggedIn: false }
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新令牌
   */
  async function refreshAccessToken(): Promise<boolean> {
    if (!refreshToken.value) return false

    try {
      const response = await AuthApi.refreshToken({
        refreshToken: refreshToken.value
      })
      const token = response.data.data

      applyToken(token)

      return true
    } catch {
      clearTokens()
      return false
    }
  }

  /**
   * 退出登录
   */
  async function logout(): Promise<void> {
    try {
      await AuthApi.logout(accessToken.value || undefined)
    } finally {
      clearTokens()
      initialized.value = true
    }
  }

  /**
   * 获取当前用户信息
   */
  async function fetchCurrentUser(): Promise<AuthUserInfo | null> {
    if (!isLoggedIn.value) return null

    try {
      const response = await AuthApi.getCurrentUser()
      currentUser.value = response.data.data
      return currentUser.value
    } catch {
      currentUser.value = null
      return null
    }
  }

  /**
   * 获取当前用户菜单
   */
  async function fetchUserMenus(): Promise<AuthMenuInfo[]> {
    if (!isLoggedIn.value) return []

    try {
      const response = await AuthApi.getCurrentUserMenus()
      userMenus.value = normalizeAuthMenus(response.data.data ?? [])
      return userMenus.value
    } catch {
      userMenus.value = []
      return []
    }
  }

  /**
   * 检查用户是否有指定权限
   */
  function hasPermission(permission: string): boolean {
    return checkPermission(currentUser.value?.permissions, permission)
  }

  /**
   * 检查用户是否拥有任一权限
   */
  function hasAnyPermission(permissions: PermissionRequirement): boolean {
    return checkAnyPermission(currentUser.value?.permissions, permissions)
  }

  /**
   * 检查用户是否拥有全部权限
   */
  function hasAllPermissions(permissions: PermissionRequirement): boolean {
    return checkAllPermissions(currentUser.value?.permissions, permissions)
  }

  /**
   * 检查用户是否有指定角色
   */
  function hasRole(role: string): boolean {
    return currentUser.value?.roles.includes(role) || false
  }

  /**
   * 检查当前用户是否为超级管理员
   */
  function isSuperAdmin(): boolean {
    return checkSuperAdmin(currentUser.value?.permissions)
  }

  /**
   * 发送密码重置验证码
   */
  async function sendPasswordResetCode(data: PasswordResetCodeRequest): Promise<boolean> {
    try {
      await AuthApi.sendPasswordResetCode(data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 重置密码
   */
  async function resetPassword(data: PasswordResetSelfRequest): Promise<boolean> {
    try {
      await AuthApi.resetPassword(data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 搜索用户（公开接口）
   */
  async function searchUsers(params?: { keyword?: string; current?: number; size?: number }): Promise<UserSearchVO[]> {
    try {
      const response = await AuthApi.searchUsers(params)
      return response.data.data?.records ?? []
    } catch {
      return []
    }
  }

  /**
   * 初始化认证状态（从 localStorage 恢复）
   */
  async function initAuth(): Promise<void> {
    if (initialized.value) {
      return
    }

    loadTokensFromStorage()

    if ((!accessToken.value || isTokenExpired()) && refreshToken.value) {
      const refreshed = await refreshAccessToken()

      if (!refreshed) {
        clearTokens()
        initialized.value = true
        return
      }
    }

    if (!isLoggedIn.value) {
      resetUserContext()
      initialized.value = true
      return
    }

    const user = await fetchCurrentUser()
    if (!user) {
      clearTokens()
      initialized.value = true
      return
    }

    await fetchUserMenus()
    initialized.value = true
  }

  return {
    // 状态
    isLoggedIn,
    accessToken,
    currentUser,
    userMenus,
    loading,
    initialized,

    // 操作
    login,
    sendEmailCode,
    emailLogin,
    register,
    logout,
    fetchCurrentUser,
    fetchUserMenus,
    refreshAccessToken,
    syncTokensFromStorage,
    clearAuthState,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isSuperAdmin,
    initAuth,
    sendPasswordResetCode,
    resetPassword,
    searchUsers,
  }
})
