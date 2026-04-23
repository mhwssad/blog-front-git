import type { AuthMenuInfo } from '@/api/types'
import { ADMIN_FIXED_MENUS } from './fixed-routes'

export interface AppMenuInfo extends AuthMenuInfo {
  path: string
  routePath: string
  children?: AppMenuInfo[]
}

function sortMenus<T extends { sort?: number }>(menus: T[]): T[] {
  return [...menus].sort((left, right) => (left.sort ?? 0) - (right.sort ?? 0))
}

export function isExternalPath(path?: string | null): boolean {
  return /^(https?:)?\/\//i.test(path ?? '')
}

function normalizeRawPath(path?: string | null): string {
  if (!path) {
    return ''
  }

  if (isExternalPath(path)) {
    return path
  }

  return `/${path}`.replace(/\/+/g, '/').replace(/\/$/, '')
}

export function normalizeMenuPath(path?: string | null): string {
  return normalizeRawPath(path)
}

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

export function filterVisibleMenus(menus: AuthMenuInfo[]): AppMenuInfo[] {
  return normalizeAuthMenus(menus)
    .filter(menu => menu.visible === 1 && menu.type !== 'B')
    .map(menu => ({
      ...menu,
      children: filterVisibleMenus(menu.children ?? []),
    }))
}

export function flattenMenus(menus: AuthMenuInfo[]): AppMenuInfo[] {
  // 守卫和动态路由判断都按拍平后的叶子/菜单项处理，避免反复写树遍历。
  return normalizeAuthMenus(menus).flatMap(menu => [menu, ...flattenMenus(menu.children ?? [])])
}

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

export function hasMenuPath(menus: AuthMenuInfo[], path: string): boolean {
  const normalizedPath = normalizeMenuPath(path)
  return flattenMenus(menus).some(menu => menu.type !== 'B' && menu.path === normalizedPath)
}

export function getFirstAccessibleMenuPath(menus: AuthMenuInfo[]): string | null {
  const firstMenu = flattenMenus(menus).find(
    menu => menu.type === 'M' && menu.path && !isExternalPath(menu.path)
  )
  return firstMenu?.path ?? null
}
