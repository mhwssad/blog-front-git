import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { ADMIN_FIXED_CHILD_ROUTES, FRONT_FIXED_ROUTES } from './fixed-routes'
import { setupRouterGuards } from './guards'

// 静态路由只保留公共页面和后台壳，后台业务页由接口菜单动态注入。
const routes: RouteRecordRaw[] = [
  ...FRONT_FIXED_ROUTES,
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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

setupRouterGuards(router)

export default router
