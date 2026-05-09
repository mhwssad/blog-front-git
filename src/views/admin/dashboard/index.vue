<template>
  <div v-if="canAccessDashboard" class="dashboard-page">
    <DashboardHero v-model:range-type="rangeType" v-model:custom-range="customRange" />

    <StatCards v-if="visibleStats.length" :stats="visibleStats" />

    <ShortcutGrid v-if="shortcutItems.length" :items="shortcutItems" />

    <el-row v-if="showContent || showCommunity" :gutter="12" class="content-grid stretch-row">
      <el-col
        v-if="showContent"
        :lg="showContent && showCommunity ? 12 : 24"
        :span="24"
        class="stretch-col"
      >
        <ContentPanel :content="dashboardStore.content" />
      </el-col>
      <el-col
        v-if="showCommunity"
        :lg="showContent && showCommunity ? 12 : 24"
        :span="24"
        class="stretch-col"
      >
        <CommunityPanel :community="dashboardStore.community" />
      </el-col>
    </el-row>

    <el-row v-if="showAi || showGovernance" :gutter="12" class="content-grid stretch-row">
      <el-col v-if="showAi" :lg="showAi && showGovernance ? 12 : 24" :span="24" class="stretch-col">
        <AiPanel :ai="dashboardStore.ai" />
      </el-col>
      <el-col
        v-if="showGovernance"
        :lg="showAi && showGovernance ? 12 : 24"
        :span="24"
        class="stretch-col"
      >
        <GovernancePanel
          :governance="dashboardStore.governance"
          :pending-article-review-count="dashboardStore.overview?.pendingArticleReviewCount ?? 0"
          :pending-author-app-count="pendingAuthorAppCount"
        />
      </el-col>
    </el-row>

    <SidebarPanel :focus-items="visibleFocusItems" :notices="notices" />
  </div>

  <FeaturePlaceholder
    v-else
    scope="admin"
    title="后台总览"
    summary="当前账号缺少 sys:dashboard:query 权限，无法加载看板数据。"
    :permissions="['sys:dashboard:query']"
    :api-refs="['GET /api/sys/dashboard/overview', 'GET /api/sys/dashboard/governance']"
    :doc-refs="['docs/api文档/dashboard-api.md']"
    :next-steps="['补齐后台总览权限后重新进入页面']"
  />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ChatDotRound, Document, User, Warning } from '@element-plus/icons-vue'
import { SysChatApi } from '@/api/sys/chat'
import { SysFileApi } from '@/api/sys/file'
import { SysFollowApi } from '@/api/sys/follow'
import { NoticeApi } from '@/api/sys/notice'
import { AuthorApplicationSysApi } from '@/api/sys/authorApplication'
import { flattenMenus, type AppMenuInfo } from '@/router/menu'
import { useAuthStore, useDashboardStore } from '@/stores'
import type { NoticeSummary, DashboardStat, ShortcutItem, FocusItem } from '@/types/ui'
import FeaturePlaceholder from '@/components/common/FeaturePlaceholder.vue'
import DashboardHero from './DashboardHero.vue'
import StatCards from './StatCards.vue'
import ShortcutGrid from './ShortcutGrid.vue'
import ContentPanel from './ContentPanel.vue'
import CommunityPanel from './CommunityPanel.vue'
import AiPanel from './AiPanel.vue'
import GovernancePanel from './GovernancePanel.vue'
import SidebarPanel from './SidebarPanel.vue'

const shortcutColors: Array<{ color: string; background: string }> = [
  { color: '#1d4ed8', background: 'linear-gradient(135deg, #dbeafe, #eff6ff)' },
  { color: '#047857', background: 'linear-gradient(135deg, #dcfce7, #f0fdf4)' },
  { color: '#7c3aed', background: 'linear-gradient(135deg, #ede9fe, #f5f3ff)' },
  { color: '#ea580c', background: 'linear-gradient(135deg, #ffedd5, #fff7ed)' },
  { color: '#0f766e', background: 'linear-gradient(135deg, #ccfbf1, #f0fdfa)' },
  { color: '#be123c', background: 'linear-gradient(135deg, #ffe4e6, #fff1f2)' },
  { color: '#0284c7', background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)' },
  { color: '#b45309', background: 'linear-gradient(135deg, #fef3c7, #fffbeb)' },
]

// 统计卡片权限映射（与 overviewStats 数组顺序一致）
const statPermissions = [
  'sys:user:query',
  'sys:user:query',
  'sys:user:query',
  'content:article:query',
  'content:comment:query',
  'sys:report:query',
]

// 关注项权限映射
const focusPermissionMap: Record<string, string> = {
  异常关注关系: 'content:follow:query',
  失败上传任务: 'content:file:query',
  冻结会话: 'content:chat:query',
}

const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

const canAccessDashboard = computed(() => authStore.hasPermission('sys:dashboard:query'))
const rangeType = ref<'today' | 'week' | 'month' | 'all' | 'custom'>('today')
const customRange = ref<[string, string] | []>([])
const pendingAuthorAppCount = ref(0)

// 面板权限控制
const showContent = computed(() => authStore.hasPermission('content:article:query'))
const showCommunity = computed(() =>
  authStore.hasAnyPermission(['content:comment:query', 'content:interaction:query'])
)
const showAi = computed(() =>
  authStore.hasAnyPermission(['ai:usage-stats:query', 'ai:channel-config:query'])
)
const showGovernance = computed(() =>
  authStore.hasAnyPermission([
    'content:article-review:query',
    'sys:report:query',
    'sys:author-application:query',
  ])
)
const showNotices = computed(() => authStore.hasPermission('sys:notice:query'))

watch(rangeType, () => {
  if (!canAccessDashboard.value) {
    return
  }

  if (rangeType.value === 'custom') {
    if (customRange.value.length === 2) {
      void refreshDashboard()
    }
    return
  }

  void refreshDashboard()
})

watch(customRange, () => {
  if (!canAccessDashboard.value) {
    return
  }

  if (rangeType.value === 'custom' && customRange.value.length === 2) {
    void refreshDashboard()
  }
})

const overviewStats = computed<DashboardStat[]>(() => [
  {
    title: '注册用户',
    value: dashboardStore.overview?.registeredUserCount ?? 0,
    description: '',
    icon: User,
    color: '#1d4ed8',
    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    link: '/admin/users',
  },
  {
    title: '活跃用户',
    value: dashboardStore.overview?.activeUserCount ?? 0,
    description: '',
    icon: User,
    color: '#047857',
    background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    link: '/admin/users',
  },
  {
    title: '作者数',
    value: dashboardStore.overview?.authorCount ?? 0,
    description: '',
    icon: User,
    color: '#7c3aed',
    background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
    link: '/admin/author-applications',
  },
  {
    title: '文章数',
    value: dashboardStore.overview?.articleCount ?? 0,
    description: '',
    icon: Document,
    color: '#047857',
    background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    link: '/admin/articles',
  },
  {
    title: '评论数',
    value: dashboardStore.overview?.commentCount ?? 0,
    description: '',
    icon: ChatDotRound,
    color: '#be123c',
    background: 'linear-gradient(135deg, #ffe4e6, #fecdd3)',
    link: '/admin/comments',
  },
  {
    title: '举报数',
    value: dashboardStore.overview?.reportCount ?? 0,
    description: '',
    icon: Warning,
    color: '#b45309',
    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    link: '/admin/reports',
  },
])

const visibleStats = computed(() =>
  overviewStats.value.filter((_, idx) => {
    const perm = statPermissions[idx]
    return perm != null && authStore.hasPermission(perm)
  })
)

const allFocusItems = ref<FocusItem[]>([
  { title: '异常关注关系', description: '待清理的异常 / 失效关注', total: 0 },
  { title: '失败上传任务', description: '上传失败需人工处理', total: 0 },
  { title: '冻结会话', description: '当前被冻结的聊天会话', total: 0 },
])

const visibleFocusItems = computed(() =>
  allFocusItems.value.filter(item => {
    const perm = focusPermissionMap[item.title]
    return perm != null && authStore.hasPermission(perm)
  })
)

const notices = ref<NoticeSummary[]>([])

const shortcutItems = computed<ShortcutItem[]>(() => {
  const normalizedMenus = flattenMenus(authStore.userMenus)
  const leafMenus = normalizedMenus.filter(
    menu => menu.visible === 1 && menu.type === 'M' && menu.path && !menu.path.startsWith('http')
  )

  return leafMenus.map((menu: AppMenuInfo, idx: number) => {
    const style = shortcutColors[idx % shortcutColors.length]
    return {
      title: menu.name,
      description: menu.perm ?? '',
      path: menu.path,
      icon: Document,
      color: style?.color ?? '#1d4ed8',
      background: style?.background ?? 'linear-gradient(135deg, #dbeafe, #eff6ff)',
    }
  })
})

async function refreshDashboard(): Promise<void> {
  if (!canAccessDashboard.value) {
    return
  }

  if (rangeType.value === 'custom' && customRange.value.length !== 2) {
    return
  }

  const params =
    rangeType.value === 'custom' && customRange.value.length === 2
      ? {
          rangeType: rangeType.value,
          startTime: customRange.value[0],
          endTime: customRange.value[1],
        }
      : { rangeType: rangeType.value }

  const dashboardFetches: Promise<unknown>[] = []
  if (visibleStats.value.length > 0) dashboardFetches.push(dashboardStore.fetchOverview(params))
  if (showContent.value) dashboardFetches.push(dashboardStore.fetchContent(params))
  if (showCommunity.value) dashboardFetches.push(dashboardStore.fetchCommunity(params))
  if (showAi.value) dashboardFetches.push(dashboardStore.fetchAi(params))
  if (showGovernance.value) dashboardFetches.push(dashboardStore.fetchGovernance(params))

  const [, focusResults, noticeResult, authorAppResult] = await Promise.allSettled([
    Promise.allSettled(dashboardFetches),
    Promise.allSettled([
      SysFollowApi.getFollows({ current: 1, size: 1, followStatus: 2 }),
      SysFileApi.getUploadTasks({ current: 1, size: 1, taskStatus: 3 }),
      SysChatApi.getConversations({ current: 1, size: 1, status: 0 }),
    ]),
    showNotices.value
      ? NoticeApi.getNotices({ current: 1, size: 3 })
      : Promise.resolve({ data: { data: { records: [] } } }),
    showGovernance.value
      ? AuthorApplicationSysApi.getApplications({ current: 1, size: 1, applyStatus: 1 })
      : Promise.resolve({ data: { data: { total: 0 } } }),
  ])

  if (focusResults.status === 'fulfilled') {
    const [followResult, fileResult, chatResult] = focusResults.value as [
      PromiseSettledResult<{ data: { data: { total: number } } }>,
      PromiseSettledResult<{ data: { data: { total: number } } }>,
      PromiseSettledResult<{ data: { data: { total: number } } }>,
    ]

    const getTotal = (
      result: PromiseSettledResult<{ data: { data: { total: number } } }> | undefined
    ) => {
      if (result?.status !== 'fulfilled') return 0
      return Number(result.value.data.data?.total ?? 0)
    }

    allFocusItems.value = [
      {
        title: '异常关注关系',
        description: '待清理的异常 / 失效关注',
        total: getTotal(followResult),
      },
      { title: '失败上传任务', description: '上传失败需人工处理', total: getTotal(fileResult) },
      { title: '冻结会话', description: '当前被冻结的聊天会话', total: getTotal(chatResult) },
    ]
  }

  if (showNotices.value && noticeResult?.status === 'fulfilled') {
    notices.value = noticeResult.value.data.data?.records ?? []
  }

  if (showGovernance.value && authorAppResult?.status === 'fulfilled') {
    pendingAuthorAppCount.value = authorAppResult.value.data.data?.total ?? 0
  }
}

onMounted(() => {
  if (canAccessDashboard.value) {
    void refreshDashboard()
  }
})
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-grid {
  margin: 0;
}

.stretch-row {
  display: flex;
}

.stretch-row .stretch-col {
  display: flex;
}

.stretch-row .stretch-col > :deep(.el-card) {
  flex: 1;
}
</style>
