import type { AuthMenuInfo } from '@/api/types'
import type { RouteRecordRaw } from 'vue-router'

export const FRONT_FIXED_ROUTES: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/front/home/HomeView.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/common/auth/Login.vue'),
    meta: {
      title: '登录',
      publicOnly: true,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/common/auth/Register.vue'),
    meta: {
      title: '注册',
      publicOnly: true,
    },
  },
]

export const ADMIN_FIXED_CHILD_ROUTES: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    name: 'AdminDashboard',
    component: () => import('@/views/Layouts.vue'),
    meta: {
      title: '首页',
      requiresAuth: true,
      adminOnly: true,
    },
  },
]

export const ADMIN_FIXED_ROUTE_PATHS = ['/admin/dashboard']

export const ADMIN_FIXED_MENUS: AuthMenuInfo[] = [
  {
    id: -1,
    parentId: 0,
    routeName: 'AdminDashboard',
    routePath: '/admin/dashboard',
    name: '首页',
    component: 'dashboard',
    perm: null,
    redirect: null,
    alwaysShow: 0,
    keepAlive: 1,
    icon: 'Home',
    type: 'M',
    sort: -1,
    visible: 1,
    params: null,
    children: [],
  },
]
