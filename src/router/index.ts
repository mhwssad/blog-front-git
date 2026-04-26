/**
 * 路由入口文件
 * 创建并导出 Vue Router 实例
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { ADMIN_FIXED_CHILD_ROUTES, FRONT_ROUTES, PUBLIC_ROUTES } from './fixed-routes'
import { setupRouterGuards } from './guards'

// ==================== 路由配置 ====================

/**
 * 完整路由表
 * - FRONT_ROUTES: 前台页面路由（嵌套在 FrontLayout 下）
 * - PUBLIC_ROUTES: 公共路由（登录、注册等）
 * - /admin: 后台管理入口（动态路由在守卫中注册）
 * - /403: 无权限页面
 * - /:pathMatch(.*)*: 404 页面
 */
const routes: RouteRecordRaw[] = [
  ...FRONT_ROUTES,
  ...PUBLIC_ROUTES,
  {
    path: '/admin',
    name: 'AdminLayout',
    component: () => import('@/layouts/AdminLayouts.vue'),
    meta: {
      title: '后台管理',
      requiresAuth: true,
    },
    children: ADMIN_FIXED_CHILD_ROUTES,
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/common/err/Forbidden.vue'),
    meta: {
      title: '无权限',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/common/err/NotFound.vue'),
    meta: {
      title: '404 - Not Found',
    },
  },
]

// ==================== 创建路由实例 ====================

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

/**
 * 安装路由守卫
 * 在路由实例上注册 beforeEach 和 afterEach 守卫
 */
setupRouterGuards(router)

export default router
