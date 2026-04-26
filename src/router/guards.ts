/**
 * 路由守卫
 * 处理认证、权限、动态路由注册、标签页等逻辑
 */

import type { Router } from 'vue-router'
import { useAuthStore, useTabsStore } from '@/stores'
import { ensureDynamicAdminRoutes } from './dynamic-routes'
import { getAdminMenus, getFirstAccessibleMenuPath, hasMenuPath } from './menu'

const APP_TITLE = 'Blog Admin'

/**
 * 安装路由守卫
 * @param router - Vue Router 实例
 */
export function setupRouterGuards(router: Router): void {
  // ==================== 前置守卫 ====================
  router.beforeEach(async to => {
    const authStore = useAuthStore()

    /**
     * 判断是否从 404 页面进入后台
     * 用于刷新后台页时重新匹配动态路由
     */
    const enteredAdminFromNotFound =
      to.path.startsWith('/admin') &&
      (to.name === 'NotFound' || to.matched[to.matched.length - 1]?.name === 'NotFound')

    // 首次导航时先恢复 token 和用户上下文，后续导航直接复用内存状态
    if (!authStore.initialized) {
      await authStore.initAuth()
    }

    // 判断路由是否需要认证
    const requiresAuth =
      to.matched.some(record => record.meta.requiresAuth) || to.path.startsWith('/admin')
    // 判断路由是否仅限未登录用户访问（如登录页）
    const publicOnly = to.matched.some(record => record.meta.publicOnly)

    // 需要认证但未登录，重定向到登录页
    if (requiresAuth && !authStore.isLoggedIn) {
      return {
        name: 'Login',
        query: {
          redirect: to.fullPath,
        },
      }
    }

    // 仅限未登录用户访问，已登录则重定向到后台
    if (publicOnly && authStore.isLoggedIn) {
      return '/admin'
    }

    // 未登录且不需要认证，直接放行
    if (!authStore.isLoggedIn) {
      return true
    }

    // 确保用户菜单已加载
    if (authStore.userMenus.length === 0) {
      await authStore.fetchUserMenus()
    }

    // 注册动态后台路由
    const adminMenus = getAdminMenus(authStore.userMenus)
    const dynamicRoutesAdded = ensureDynamicAdminRoutes(router, authStore.userMenus)

    // /admin 前缀统一视为后台，固定首页与后端菜单组合后作为后台可访问路由集合
    if (to.path === '/admin') {
      return getFirstAccessibleMenuPath(adminMenus) ?? '/403'
    }

    // 后台路径但不在菜单中，无权限
    if (to.path.startsWith('/admin') && !hasMenuPath(adminMenus, to.path)) {
      return '/403'
    }

    // 刷新后台页时，首次匹配可能先落到静态 404，需要在动态路由注册后重新按目标地址匹配一次
    const rematchedRoute = to.path.startsWith('/admin') ? router.resolve(to.fullPath) : null
    const shouldRematchAdminRoute =
      !!rematchedRoute &&
      rematchedRoute.name !== 'NotFound' &&
      (dynamicRoutesAdded || enteredAdminFromNotFound)

    if (shouldRematchAdminRoute) {
      return to.fullPath
    }

    return true
  })

  // ==================== 后置守卫 ====================
  router.afterEach(to => {
    const tabsStore = useTabsStore()
    const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : APP_TITLE
    document.title = `${pageTitle} - ${APP_TITLE}`

    // 只记录后台真实页面，避免把入口页和前台页面塞进标签栏
    if (!to.path.startsWith('/admin') || to.path === '/admin') {
      return
    }

    tabsStore.addTab({
      path: to.fullPath,
      title: pageTitle,
      name: typeof to.name === 'string' ? to.name : undefined,
      closable: to.path !== '/admin/dashboard',
    })
  })
}
