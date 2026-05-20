<template>
  <div class="home-view">
    <div class="home-container">
      <main class="home-main">
        <HomeArticleSection
          :loading="frontContentStore.loading"
          :articles="frontContentStore.articles"
          :total="frontContentStore.total"
          :current="pagination.current"
          :size="pagination.size"
          @page-change="handleCurrentChange"
        />
      </main>

      <button
        type="button"
        class="sidebar-toggle"
        :aria-expanded="sidebarOpen"
        aria-label="切换侧边栏"
        @click="sidebarOpen = !sidebarOpen"
      >
        <el-icon v-if="!sidebarOpen"><Expand /></el-icon>
        <el-icon v-else><Fold /></el-icon>
      </button>

      <aside class="home-sidebar" :class="{ 'home-sidebar--open': sidebarOpen }">
        <HomeSidebar
          :hot-articles="frontContentStore.hotArticles"
          :tags="frontContentStore.tags"
          :comments="frontContentStore.comments"
          :format-date="formatDate"
          @select-tag="setTag"
        />
      </aside>

      <div
        v-if="sidebarOpen"
        class="sidebar-overlay"
        @click="sidebarOpen = false"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Expand, Fold } from '@element-plus/icons-vue'
import { useFrontContentStore } from '@/stores'
import { useAdminPagination } from '@/composables/useAdminPagination'
import { DateUtils } from '@/utils/dateUtils'
import type { PublicArticleQueryRequest } from '@/types/api-types'
import HomeArticleSection from './components/HomeArticleSection.vue'
import HomeSidebar from './components/HomeSidebar.vue'
const route = useRoute()
const router = useRouter()
const frontContentStore = useFrontContentStore()
const sidebarOpen = ref(false)

const filters = reactive<PublicArticleQueryRequest>({
  keyword: '',
  tagId: undefined,
  sort: 'latest',
})

const { pagination, fetch: refreshArticles } = useAdminPagination({
  fetchFn: frontContentStore.fetchArticles,
  buildParams: () => ({
    keyword: filters.keyword || undefined,
    tagId: filters.tagId,
    sort: filters.sort,
  }),
  defaultSize: 9,
  immediate: false,
})

function formatDate(value?: string | null): string {
  return value ? DateUtils.formatRelativeTime(value) : ''
}

function syncToUrl(): void {
  const query: Record<string, string> = {}
  if (filters.tagId != null) query.tag = String(filters.tagId)
  if (filters.sort && filters.sort !== 'latest') query.sort = filters.sort
  if (pagination.current > 1) query.page = String(pagination.current)
  router.replace({ query })
}

const VALID_SORTS = new Set<string>(['latest', 'top', 'hot'])

function readFromUrl(): boolean {
  const q = route.query
  const tagId = q.tag ? Number(q.tag) : undefined
  const sort = VALID_SORTS.has(q.sort as string) ? (q.sort as PublicArticleQueryRequest['sort']) : 'latest'
  const page = q.page ? Number(q.page) : 1

  const changed =
    filters.tagId !== tagId ||
    filters.sort !== sort ||
    pagination.current !== page

  filters.tagId = tagId
  filters.sort = sort
  pagination.current = page

  return changed
}

function setTag(tagId: number): void {
  filters.tagId = tagId
  pagination.current = 1
  syncToUrl()
  sidebarOpen.value = false
}

function handleCurrentChange(current: number): void {
  pagination.current = current
  syncToUrl()
  refreshArticles()
}

watch(
  () => route.query,
  async () => {
    const changed = readFromUrl()
    if (changed) {
      await refreshArticles()
    }
  },
)

onMounted(async () => {
  readFromUrl()
  await frontContentStore.initHome({
    ...filters,
    keyword: filters.keyword || undefined,
    current: pagination.current,
    size: pagination.size,
  })
  syncToUrl()
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: var(--el-fill-color-lighter);
}

.home-container {
  width: min(1240px, 100%);
  margin: 0 auto;
  padding: 0 24px 48px;
  display: flex;
  gap: 24px;
  position: relative;
}

.home-main {
  flex: 1;
  min-width: 0;
}

.home-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.sidebar-toggle {
  display: none;
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 1024px) {
  .home-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 300px;
    z-index: 100;
    background: var(--el-bg-color);
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
    padding: 20px;
  }

  .home-sidebar--open {
    transform: translateX(0);
  }

  .sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    right: 20px;
    bottom: 80px;
    z-index: 101;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    background: var(--el-color-primary);
    color: #fff;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .sidebar-toggle:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }

  .sidebar-toggle:focus-visible {
    outline: 3px solid var(--el-color-primary);
    outline-offset: 3px;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 99;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
  }
}

@media (max-width: 768px) {
  .home-container {
    padding: 0 16px 32px;
    gap: 16px;
  }

  .home-sidebar {
    width: 280px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-sidebar {
    transition: none;
  }

  .sidebar-toggle {
    transition: none;
  }

  .sidebar-toggle:hover {
    transform: none;
  }
}
</style>
