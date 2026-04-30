/**
 * 菜单处理工具
 * 提供菜单规范化、过滤、扁平化等操作
 */

import type { AuthMenuInfo } from '@/types/api-types'
import { ADMIN_FIXED_MENUS } from './fixed-routes'

// ==================== 类型定义 ====================

/**
 * 扩展后的菜单信息
 * 在 AuthMenuInfo 基础上添加规范化后的 path 字段
 */
export interface AppMenuInfo extends AuthMenuInfo {
  /** 规范化后的完整路径 */
  path: string
  /** 规范化后的路由路径 */
  routePath: string
  children?: AppMenuInfo[]
}

// ==================== 工具函数 ====================

/**
 * 按 sort 字段排序菜单
 */
function sortMenus<T extends { sort?: number }>(menus: T[]): T[] {
  return [...menus].sort((left, right) => (left.sort ?? 0) - (right.sort ?? 0))
}

/**
 * 判断路径是否为外部链接
 * 匹配 http://, https://, // 开头的路径
 */
export function isExternalPath(path?: string | null): boolean {
  return /^(https?:)?\/\//i.test(path ?? '')
}

/**
 * 规范化原始路径
 * - 外部链接保持原样
 * - 其他路径确保以 / 开头，去除多余斜杠和末尾斜杠
 */
function normalizeRawPath(path?: string | null): string {
  if (!path) {
    return ''
  }

  if (isExternalPath(path)) {
    return path
  }

  return `/${path}`.replace(/\/+/g, '/').replace(/\/$/, '')
}

// ==================== 核心导出函数 ====================

/**
 * 规范化菜单路径
 */
export function normalizeMenuPath(path?: string | null): string {
  return normalizeRawPath(path)
}

/**
 * 规范化菜单树
 * - 按 sort 排序
 * - 规范化路径
 * - 递归处理子菜单
 */
export function normalizeAuthMenus(menus: AuthMenuInfo[]): AppMenuInfo[] {
  return sortMenus(menus).map(menu => {
    const routePath = normalizeMenuPath(menu.routePath)
    const redirect = isExternalPath(menu.redirect)
      ? menu.redirect
      : normalizeMenuPath(menu.redirect)
    const children = normalizeAuthMenus(menu.children ?? [])

    return {
      ...menu,
      redirect,
      routePath,
      path: routePath,
      children,
    }
  })
}

/**
 * 过滤可见菜单
 * - visible === 1
 * - 排除按钮类型(B)
 */
export function filterVisibleMenus(menus: AuthMenuInfo[]): AppMenuInfo[] {
  return normalizeAuthMenus(menus)
    .filter(menu => menu.visible === 1 && menu.type !== 'B')
    .map(menu => ({
      ...menu,
      children: filterVisibleMenus(menu.children ?? []),
    }))
}

/**
 * 拍平菜单树为数组
 * 守卫和动态路由判断都按拍平后的叶子/菜单项处理，避免反复写树遍历
 */
export function flattenMenus(menus: AuthMenuInfo[]): AppMenuInfo[] {
  return normalizeAuthMenus(menus).flatMap(menu => [menu, ...flattenMenus(menu.children ?? [])])
}

// ==================== 后台菜单相关 ====================

/**
 * 获取后台菜单列表
 * 如果没有 /admin/dashboard 则补充固定首页
 */
export function getAdminMenus(menus: AuthMenuInfo[]): AppMenuInfo[] {
  const normalizedMenus = normalizeAuthMenus(menus)

  if (normalizedMenus.length === 0) {
    return []
  }

  if (hasMenuPath(normalizedMenus, '/admin/dashboard')) {
    return normalizedMenus
  }

  return [...normalizeAuthMenus(ADMIN_FIXED_MENUS), ...normalizedMenus]
}

/**
 * 检查菜单列表中是否包含指定路径
 */
export function hasMenuPath(menus: AuthMenuInfo[], path: string): boolean {
  const normalizedPath = normalizeMenuPath(path)
  return flattenMenus(menus).some(menu => menu.type !== 'B' && menu.path === normalizedPath)
}

/**
 * 获取第一个可访问的菜单路径
 */
export function getFirstAccessibleMenuPath(menus: AuthMenuInfo[]): string | null {
  const firstMenu = flattenMenus(menus).find(
    menu => menu.type === 'M' && menu.path && !isExternalPath(menu.path)
  )
  return firstMenu?.path ?? null
}
