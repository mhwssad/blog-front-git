<template>
  <div class="dashboard-page">
    <section class="hero-section">
      <div>
        <p class="hero-eyebrow">Admin Overview</p>
        <h1 class="hero-title">后台总览</h1>
        <p class="hero-subtitle">
          基于当前菜单权限展示系统概况、治理重点和快捷入口，默认适配全量 Mock 联调。
        </p>
      </div>
      <div class="hero-actions">
        <el-button type="primary" @click="goFirstShortcut">进入常用模块</el-button>
        <el-button plain @click="refreshDashboard">刷新总览</el-button>
      </div>
    </section>

    <el-row :gutter="16" class="stat-grid">
      <el-col v-for="card in stats" :key="card.title" :lg="6" :md="12" :span="24">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-inner">
            <div>
              <div class="stat-label">{{ card.title }}</div>
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-desc">{{ card.description }}</div>
            </div>
            <div class="stat-icon" :style="{ background: card.background }">
              <el-icon :size="24" :color="card.color">
                <component :is="card.icon" />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="content-grid">
      <el-col :lg="16" :span="24">
        <el-card shadow="never" class="panel-card">
          <template #header>
            <div class="panel-header">
              <span>快捷入口</span>
              <span class="panel-tip">仅展示当前账号可访问模块</span>
            </div>
          </template>

          <div class="shortcut-grid">
            <button
              v-for="item in shortcutItems"
              :key="item.path"
              class="shortcut-card"
              type="button"
              @click="router.push(item.path)"
            >
              <div class="shortcut-icon" :style="{ background: item.background }">
                <el-icon :size="18" :color="item.color">
                  <component :is="item.icon" />
                </el-icon>
              </div>
              <div class="shortcut-title">{{ item.title }}</div>
              <div class="shortcut-desc">{{ item.description }}</div>
            </button>
          </div>
        </el-card>
      </el-col>

      <el-col :lg="8" :span="24">
        <el-card shadow="never" class="panel-card">
          <template #header>
            <div class="panel-header">
              <span>治理重点</span>
              <span class="panel-tip">按当前 Mock 数据实时汇总</span>
            </div>
          </template>

          <div class="focus-list">
            <div v-for="item in focusItems" :key="item.title" class="focus-item">
              <div>
                <div class="focus-title">{{ item.title }}</div>
                <div class="focus-desc">{{ item.description }}</div>
              </div>
              <el-tag :type="item.total > 0 ? 'warning' : 'success'">
                {{ item.total }}
              </el-tag>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="panel-card">
          <template #header>
            <div class="panel-header">
              <span>近期通知</span>
              <span class="panel-tip">系统公告与联调提示</span>
            </div>
          </template>

          <el-empty v-if="notices.length === 0" description="暂无通知" />
          <div v-else class="notice-list">
            <div v-for="notice in notices" :key="notice.id" class="notice-item">
              <div class="notice-title">{{ notice.title }}</div>
              <div class="notice-time">{{ notice.publishTime || notice.createTime }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Bell,
  ChatDotRound,
  Connection,
  Document,
  Files,
  FolderOpened,
  Monitor,
  User,
} from '@element-plus/icons-vue'
import { articleApi } from '@/api/sys/article'
import { sysChatApi } from '@/api/sys/chat'
import { sysFileApi } from '@/api/sys/file'
import { sysFollowApi } from '@/api/sys/follow'
import { noticeApi } from '@/api/sys/notice'
import { userApi } from '@/api/sys/user'
import { flattenMenus } from '@/router/menu'
import { useAuthStore } from '@/stores'

interface DashboardStat {
  title: string
  value: number
  description: string
  icon: typeof User
  color: string
  background: string
}

interface ShortcutItem {
  title: string
  description: string
  path: string
  icon: typeof User
  color: string
  background: string
}

interface FocusItem {
  title: string
  description: string
  total: number
}

interface NoticeSummary {
  id: number
  title: string
  publishTime?: string | null
  createTime?: string | null
}

const router = useRouter()
const authStore = useAuthStore()

const stats = ref<DashboardStat[]>([
  {
    title: '用户规模',
    value: 0,
    description: '后台可查询用户总量',
    icon: User,
    color: '#1d4ed8',
    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
  },
  {
    title: '内容文章',
    value: 0,
    description: '内容管理域文章总量',
    icon: Document,
    color: '#047857',
    background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
  },
  {
    title: '文件库',
    value: 0,
    description: '文件与附件总量',
    icon: Files,
    color: '#b45309',
    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
  },
  {
    title: '聊天会话',
    value: 0,
    description: '当前治理中的会话总量',
    icon: ChatDotRound,
    color: '#be123c',
    background: 'linear-gradient(135deg, #ffe4e6, #fecdd3)',
  },
])

const focusItems = ref<FocusItem[]>([
  { title: '异常关注关系', description: '待清理的异常 / 失效关注', total: 0 },
  { title: '失败上传任务', description: '上传失败需人工处理', total: 0 },
  { title: '冻结会话', description: '当前被冻结的聊天会话', total: 0 },
])

const notices = ref<NoticeSummary[]>([])

const shortcutCatalog: ShortcutItem[] = [
  {
    title: '用户管理',
    description: '账号、角色与启停管理',
    path: '/admin/users',
    icon: User,
    color: '#1d4ed8',
    background: 'linear-gradient(135deg, #dbeafe, #eff6ff)',
  },
  {
    title: '文章管理',
    description: '内容查询与发布治理',
    path: '/admin/articles',
    icon: Document,
    color: '#047857',
    background: 'linear-gradient(135deg, #dcfce7, #f0fdf4)',
  },
  {
    title: '关注关系',
    description: '异常关注关系排查与清理',
    path: '/admin/follows',
    icon: Connection,
    color: '#c2410c',
    background: 'linear-gradient(135deg, #ffedd5, #fff7ed)',
  },
  {
    title: '文件管理',
    description: '文件库与上传任务治理',
    path: '/admin/files',
    icon: Files,
    color: '#7c2d12',
    background: 'linear-gradient(135deg, #fee2e2, #fff1f2)',
  },
  {
    title: '聊天管理',
    description: '成员、消息与回执治理',
    path: '/admin/chats',
    icon: ChatDotRound,
    color: '#7c3aed',
    background: 'linear-gradient(135deg, #ede9fe, #f5f3ff)',
  },
  {
    title: '通知公告',
    description: '公告发布与广播管理',
    path: '/admin/notices',
    icon: Bell,
    color: '#0f766e',
    background: 'linear-gradient(135deg, #ccfbf1, #f0fdfa)',
  },
  {
    title: '分类管理',
    description: '分类结构与状态治理',
    path: '/admin/categories',
    icon: FolderOpened,
    color: '#1f2937',
    background: 'linear-gradient(135deg, #e5e7eb, #f9fafb)',
  },
  {
    title: '菜单管理',
    description: '后台菜单与路由配置',
    path: '/admin/menus',
    icon: Monitor,
    color: '#0f766e',
    background: 'linear-gradient(135deg, #cffafe, #ecfeff)',
  },
]

const accessiblePaths = computed(() => {
  const normalizedMenus = flattenMenus(authStore.userMenus)
  return new Set(normalizedMenus.map(menu => menu.path))
})

const shortcutItems = computed(() =>
  shortcutCatalog.filter(item => accessiblePaths.value.has(item.path))
)

function goFirstShortcut(): void {
  const firstShortcut = shortcutItems.value[0]
  if (firstShortcut) {
    void router.push(firstShortcut.path)
  }
}

async function refreshDashboard(): Promise<void> {
  const results = await Promise.allSettled([
    userApi.getUsers({ current: 1, size: 1 }),
    articleApi.getArticles({ current: 1, size: 1 }),
    sysFileApi.getFiles({ current: 1, size: 1 }),
    sysChatApi.getConversations({ current: 1, size: 1 }),
    sysFollowApi.getFollows({ current: 1, size: 1, followStatus: 2 }),
    sysFileApi.getUploadTasks({ current: 1, size: 1, taskStatus: 3 }),
    sysChatApi.getConversations({ current: 1, size: 1, status: 0 }),
    noticeApi.getNotices({ current: 1, size: 3 }),
  ])

  const getTotal = (index: number) => {
    const result = results[index]
    if (result?.status !== 'fulfilled') {
      return 0
    }

    return Number(result.value.data.data?.total ?? 0)
  }

  stats.value = stats.value.map((item, index) => ({
    ...item,
    value: [getTotal(0), getTotal(1), getTotal(2), getTotal(3)][index] ?? 0,
  }))

  focusItems.value = [
    { title: '异常关注关系', description: '待清理的异常 / 失效关注', total: getTotal(4) },
    { title: '失败上传任务', description: '上传失败需人工处理', total: getTotal(5) },
    { title: '冻结会话', description: '当前被冻结的聊天会话', total: getTotal(6) },
  ]

  const noticeResult = results[7]
  notices.value =
    noticeResult?.status === 'fulfilled' ? noticeResult.value.data.data?.records ?? [] : []
}

onMounted(() => {
  void refreshDashboard()
})
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.9), transparent 35%),
    linear-gradient(135deg, #0f172a, #1e293b 55%, #0f766e);
  color: #f8fafc;
}

.hero-eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.72;
}

.hero-title {
  margin: 0;
  font-size: 32px;
  line-height: 1.1;
}

.hero-subtitle {
  max-width: 640px;
  margin: 12px 0 0;
  line-height: 1.7;
  color: rgba(248, 250, 252, 0.84);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.stat-grid,
.content-grid {
  margin: 0;
}

.stat-card {
  border: none;
}

.stat-card-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.stat-value {
  margin-top: 8px;
  font-size: 32px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.stat-desc {
  margin-top: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
}

.panel-card {
  min-height: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 600;
}

.panel-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.shortcut-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  text-align: left;
  background: #fff;
  border: 1px solid var(--el-border-color-light);
  border-radius: 18px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.shortcut-card:hover {
  transform: translateY(-2px);
  border-color: rgba(15, 118, 110, 0.28);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
}

.shortcut-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
}

.shortcut-title {
  font-size: 15px;
  font-weight: 600;
}

.shortcut-desc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.focus-list,
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.focus-item,
.notice-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: var(--el-fill-color-light);
}

.focus-title,
.notice-title {
  font-weight: 600;
}

.focus-desc,
.notice-time {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

@media (max-width: 992px) {
  .hero-section {
    flex-direction: column;
  }
}
</style>
