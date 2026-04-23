import type { AuthMenuInfo } from '@/api/types'
import type { RouteRecordRaw, Router } from 'vue-router'
import { createLogger } from '@/utils/logger'
import { ADMIN_FIXED_ROUTE_PATHS } from './fixed-routes'
import { resolveMenuComponent } from './component-resolver'
import { flattenMenus, isExternalPath, normalizeAuthMenus } from './menu'

const logger = createLogger('router')

const dynamicRouteNames = new Set<string>()
const reservedRouteNames = new Set([
  'Home',
  'Login',
  'Register',
  'AdminLayout',
  'AdminDashboard',
  'Forbidden',
  'NotFound',
])

function toAdminChildPath(fullPath: string): string {
  return fullPath.replace(/^\/admin\/?/, '') || 'dashboard'
}

function toPascalCase(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('')
}

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
  // 后端可能配置重复路由名，这里用菜单 ID 打散，保证 removeRoute 时仍然可定位。
  const uniqueRouteName = usedRouteNames.has(baseRouteName)
    ? `${baseRouteName}_${menu.id}`
    : baseRouteName

  usedRouteNames.add(uniqueRouteName)
  return uniqueRouteName
}

function buildAdminRoutes(menus: AuthMenuInfo[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []
  const addedPaths = new Set<string>()
  const usedRouteNames = new Set<string>(reservedRouteNames)

  for (const menu of flattenMenus(normalizeAuthMenus(menus))) {
    if (menu.type !== 'M' || !menu.path || isExternalPath(menu.path)) {
      continue
    }

    if (ADMIN_FIXED_ROUTE_PATHS.includes(menu.path)) {
      continue
    }

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

export function ensureDynamicAdminRoutes(router: Router, menus: AuthMenuInfo[]): boolean {
  let added = false

  // 同一个会话内可能多次进入守卫，这里按路由名去重，避免重复注册。
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

export function resetDynamicAdminRoutes(router: Router): void {
  for (const routeName of dynamicRouteNames) {
    if (router.hasRoute(routeName)) {
      router.removeRoute(routeName)
    }
  }

  dynamicRouteNames.clear()
}
