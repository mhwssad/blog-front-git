import type { AuthMenuInfo } from '@/api/types'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 前台页面路由（嵌套在 FrontLayout 下）
 */
export const FRONT_ROUTES: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/FrontLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/front/home/HomeView.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'articles/:id',
        name: 'ArticleDetail',
        component: () => import('@/views/front/article/ArticleDetail.vue'),
        meta: { title: '文章详情' },
      },
      {
        path: 'categories/:id',
        name: 'CategoryArticles',
        component: () => import('@/views/front/category/CategoryView.vue'),
        meta: { title: '分类文章' },
      },
      {
        path: 'user/profile',
        name: 'UserProfile',
        component: () => import('@/views/front/profile/ProfileView.vue'),
        meta: { title: '个人中心', requiresAuth: true },
      },
      {
        path: 'user/collections',
        name: 'UserCollections',
        component: () => import('@/views/front/collection/CollectionsView.vue'),
        meta: { title: '我的收藏', requiresAuth: true },
      },
      {
        path: 'user/footprints',
        name: 'UserFootprints',
        component: () => import('@/views/front/footprint/FootprintsView.vue'),
        meta: { title: '我的足迹', requiresAuth: true },
      },
      {
        path: 'user/notices',
        name: 'UserNotices',
        component: () => import('@/views/front/notice/NoticesView.vue'),
        meta: { title: '通知中心', requiresAuth: true },
      },
      {
        path: 'user/files',
        name: 'UserFiles',
        component: () => import('@/views/front/file/UserFilesView.vue'),
        meta: { title: '我的文件', requiresAuth: true },
      },
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('@/views/front/chat/ChatView.vue'),
        meta: { title: '聊天', requiresAuth: true },
      },
      {
        path: 'users/:userId',
        name: 'OtherUserProfile',
        component: () => import('@/views/front/user/UserProfileView.vue'),
        meta: { title: '用户主页' },
      },
    ],
  },
]

/**
 * 公共页面路由（登录、注册，不在 Layout 内）
 */
export const PUBLIC_ROUTES: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/common/auth/Login.vue'),
    meta: { title: '登录', publicOnly: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/common/auth/Register.vue'),
    meta: { title: '注册', publicOnly: true },
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
