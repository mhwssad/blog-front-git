import type { AuthMenuInfo } from '@/types/api-types'
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
        path: 'articles',
        name: 'Articles',
        component: () => import('@/views/front/articles/ArticlesView.vue'),
        meta: { title: '文章' },
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
      {
        path: 'user/author-apply',
        name: 'AuthorApply',
        component: () => import('@/views/front/author/AuthorApply.vue'),
        meta: { title: '申请作者', requiresAuth: true },
      },
      {
        path: 'user/series',
        name: 'SeriesList',
        component: () => import('@/views/front/series/SeriesList.vue'),
        meta: { title: '我的系列', requiresAuth: true },
      },
      {
        path: 'series/:id',
        name: 'SeriesDetail',
        component: () => import('@/views/front/series/SeriesDetail.vue'),
        meta: { title: '系列详情' },
      },
      {
        path: 'hall',
        name: 'Hall',
        component: () => import('@/views/front/hall/HallView.vue'),
        meta: { title: '大厅', hideFooter: true },
      },
      {
        path: 'forum',
        name: 'ForumHome',
        component: () => import('@/views/front/forum/ForumHome.vue'),
        meta: { title: '论坛' },
      },
      {
        path: 'forum/sections/:sectionId',
        name: 'ForumSection',
        component: () => import('@/views/front/forum/ForumSection.vue'),
        meta: { title: '论坛版块' },
      },
      {
        path: 'forum/posts/:postId',
        name: 'ForumPost',
        component: () => import('@/views/front/forum/ForumPost.vue'),
        meta: { title: '帖子详情' },
      },
      {
        path: 'forum/create',
        name: 'ForumCreate',
        component: () => import('@/views/front/forum/ForumCreate.vue'),
        meta: { title: '发布帖子', requiresAuth: true },
      },
      {
        path: 'forum/posts/:postId/edit',
        name: 'ForumEdit',
        component: () => import('@/views/front/forum/ForumEdit.vue'),
        meta: { title: '编辑帖子', requiresAuth: true },
      },
      {
        path: 'user/forum/posts',
        name: 'MyForumPosts',
        component: () => import('@/views/front/forum/MyForumPosts.vue'),
        meta: { title: '我的帖子', requiresAuth: true },
      },
      {
        path: 'channels',
        name: 'ChannelList',
        component: () => import('@/views/front/channel/ChannelList.vue'),
        meta: { title: '频道列表' },
      },
      {
        path: 'channels/:id',
        name: 'ChannelDetail',
        component: () => import('@/views/front/channel/ChannelDetail.vue'),
        meta: { title: '频道详情' },
      },
      {
        path: 'user/channel-apply',
        name: 'ChannelApply',
        component: () => import('@/views/front/channel/ChannelApply.vue'),
        meta: { title: '申请创建频道', requiresAuth: true },
      },
      {
        path: 'chat/groups/:id/settings',
        name: 'GroupSettings',
        component: () => import('@/views/front/chat/GroupSettings.vue'),
        meta: { title: '群设置', requiresAuth: true },
      },
      {
        path: 'user/join-requests',
        name: 'UserJoinRequests',
        component: () => import('@/views/front/chat/JoinRequestsView.vue'),
        meta: { title: '入群申请', requiresAuth: true },
      },
      {
        path: 'ai',
        name: 'AiAssistant',
        component: () => import('@/views/front/ai/AiAssistant.vue'),
        meta: { title: 'AI 助手', requiresAuth: true, hideFooter: true },
      },
      {
        path: 'user/notification-settings',
        name: 'NotificationSettings',
        component: () => import('@/views/front/notification/NotificationSettings.vue'),
        meta: { title: '通知设置', requiresAuth: true },
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('@/views/front/search/SearchView.vue'),
        meta: { title: '搜索' },
      },
      {
        path: 'tags/:id',
        name: 'TagDetail',
        component: () => import('@/views/front/tag/TagDetailView.vue'),
        meta: { title: '标签详情' },
      },
      {
        path: 'user/settings',
        name: 'UserSettings',
        component: () => import('@/views/front/settings/UserSettings.vue'),
        meta: { title: '账号设置', requiresAuth: true },
      },
      {
        path: 'friends',
        name: 'Friends',
        component: () => import('@/views/front/friends/FriendsView.vue'),
        meta: { title: '友情链接' },
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/front/about/AboutView.vue'),
        meta: { title: '关于' },
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
    component: () => import('@/views/admin/dashboard/index.vue'),
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
