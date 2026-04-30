/**
 * 动态路由管理
 * 根据后端返回的菜单权限动态生成后台路由
 */

import type { AuthMenuInfo } from '@/types/api-types'
import type { RouteRecordRaw, Router } from 'vue-router'
import { createLogger } from '@/utils/logger'
import { ADMIN_FIXED_ROUTE_PATHS } from './fixed-routes'
import { resolveMenuComponent } from './component-resolver'
import { flattenMenus, isExternalPath, normalizeAuthMenus } from './menu'

const logger = createLogger('router')

// ==================== 状态 ====================

/**
 * 已添加的动态路由名称集合
 * 用于后续清理和去重
 */
const dynamicRouteNames = new Set<string>()

/**
 * 保留的路由名称集合
 * 这些名称在动态路由中不能使用，避免与固定路由冲突
 */
const reservedRouteNames = new Set([
  'Home',
  'Login',
  'Register',
  'AdminLayout',
  'AdminDashboard',
  'Forbidden',
  'NotFound',
])

// ==================== 工具函数 ====================

/**
 * 将完整路径转为后台子路由路径
 * 例如: /admin/user -> user, /admin/dashboard -> dashboard
 */
function toAdminChildPath(fullPath: string): string {
  return fullPath.replace(/^\/admin\/?/, '') || 'dashboard'
}

/**
 * 将字符串转为 PascalCase 格式
 * 例如: user-list -> UserList
 */
function toPascalCase(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('')
}

// ==================== 路由构建 ====================

/**
 * 构建动态路由名称
 * 优先使用后端配置的 routeName，否则基于路径生成
 * 后端可能配置重复路由名，用菜单 ID 打散保证唯一性
 */
function buildRouteName(menu: AuthMenuInfo, usedRouteNames: Set<string>): string {
  const rawRouteName = menu.routeName?.trim()
  const normalizedPath = menu.routePath ?? ''
  const pathBasedName =
    normalizedPath
      .replace(/^\/admin\/?/, '')
      .split('/')
      .filter(Boolean)
      .map(toPascalCase)
      .join('') || `Menu${menu.id}`

  const baseRouteName = rawRouteName || `Admin${pathBasedName}`
  const uniqueRouteName = usedRouteNames.has(baseRouteName)
    ? `${baseRouteName}_${menu.id}`
    : baseRouteName

  usedRouteNames.add(uniqueRouteName)
  return uniqueRouteName
}

/**
 * 构建后台动态路由数组
 * 遍历拍平后的菜单树，只处理菜单类型(M)，过滤掉固定路由和外部链接
 */
function buildAdminRoutes(menus: AuthMenuInfo[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []
  const addedPaths = new Set<string>()
  const usedRouteNames = new Set<string>(reservedRouteNames)

  for (const menu of flattenMenus(normalizeAuthMenus(menus))) {
    // 只处理菜单类型(M)，忽略目录(C)和按钮(B)
    if (menu.type !== 'M' || !menu.path || isExternalPath(menu.path)) {
      continue
    }

    // 跳过固定路由
    if (ADMIN_FIXED_ROUTE_PATHS.includes(menu.path)) {
      continue
    }

    // 避免重复添加相同路径
    if (addedPaths.has(menu.path)) {
      continue
    }

    try {
      const resolvedComponent = resolveMenuComponent(menu)
      addedPaths.add(menu.path)
      routes.push({
        path: toAdminChildPath(menu.path),
        name: buildRouteName(menu, usedRouteNames),
        component: resolvedComponent.component,
        meta: {
          title: menu.name,
          requiresAuth: true,
          adminOnly: true,
          permission: menu.perm ?? undefined,
          keepAlive: menu.keepAlive === 1,
          menuId: menu.id,
          icon: menu.icon ?? undefined,
          alwaysShow: menu.alwaysShow === 1,
          params: menu.params ?? undefined,
        },
      })
    } catch (error) {
      logger.warn(error)
    }
  }

  return routes
}

// ==================== 导出函数 ====================

/**
 * 确保动态后台路由已注册到路由实例
 * 同一个会话内可能多次进入守卫，按路由名去重避免重复注册
 * @returns 是否有新路由被添加
 */
export function ensureDynamicAdminRoutes(router: Router, menus: AuthMenuInfo[]): boolean {
  let added = false

  for (const route of buildAdminRoutes(menus)) {
    const routeName = String(route.name)

    if (router.hasRoute(routeName)) {
      continue
    }

    router.addRoute('AdminLayout', route)
    dynamicRouteNames.add(routeName)
    added = true
  }

  return added
}

/**
 * 清除所有动态后台路由
 * 通常在用户退出登录时调用
 */
export function resetDynamicAdminRoutes(router: Router): void {
  for (const routeName of dynamicRouteNames) {
    if (router.hasRoute(routeName)) {
      router.removeRoute(routeName)
    }
  }

  dynamicRouteNames.clear()
}
