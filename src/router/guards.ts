import type { Router } from 'vue-router'
import { useAuthStore, useTabsStore } from '@/stores'
import { ensureDynamicAdminRoutes } from './dynamic-routes'
import { getAdminMenus, getFirstAccessibleMenuPath, hasMenuPath } from './menu'

const APP_TITLE = 'Blog Admin'

export function setupRouterGuards(router: Router): void {
  router.beforeEach(async to => {
    const authStore = useAuthStore()
    const enteredAdminFromNotFound =
      to.path.startsWith('/admin') &&
      (to.name === 'NotFound' || to.matched[to.matched.length - 1]?.name === 'NotFound')

    // 首次导航时先恢复 token 和用户上下文，后续导航直接复用内存状态。
    if (!authStore.initialized) {
      await authStore.initAuth()
    }

    const requiresAuth =
      to.matched.some(record => record.meta.requiresAuth) || to.path.startsWith('/admin')
    const publicOnly = to.matched.some(record => record.meta.publicOnly)

    if (requiresAuth && !authStore.isLoggedIn) {
      return {
        name: 'Login',
        query: {
          redirect: to.fullPath,
        },
      }
    }

    if (publicOnly && authStore.isLoggedIn) {
      return '/admin'
    }

    if (!authStore.isLoggedIn) {
      return true
    }

    if (authStore.userMenus.length === 0) {
      await authStore.fetchUserMenus()
    }

    const adminMenus = getAdminMenus(authStore.userMenus)
    const dynamicRoutesAdded = ensureDynamicAdminRoutes(router, authStore.userMenus)

    // /admin 前缀统一视为后台，固定首页与后端菜单组合后作为后台可访问路由集合。
    if (to.path === '/admin') {
      return getFirstAccessibleMenuPath(adminMenus) ?? '/403'
    }

    if (to.path.startsWith('/admin') && !hasMenuPath(adminMenus, to.path)) {
      return '/403'
    }

    // 刷新后台页时，首次匹配可能先落到静态 404，需要在动态路由注册后重新按目标地址匹配一次。
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

  router.afterEach(to => {
    const tabsStore = useTabsStore()
    const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : APP_TITLE
    document.title = `${pageTitle} - ${APP_TITLE}`

    // 只记录后台真实页面，避免把入口页和前台页面塞进标签栏。
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
