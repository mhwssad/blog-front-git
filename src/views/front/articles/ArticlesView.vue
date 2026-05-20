<template>
  <div class="articles-page">
    <div class="articles-container">
      <div class="articles-main">
        <header class="articles-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>文章</el-breadcrumb-item>
          </el-breadcrumb>

          <div class="title-row">
            <h1 class="page-title">文章</h1>
            <el-select v-model="currentSort" size="small" class="sort-select">
              <el-option label="最新发布" value="latest" />
              <el-option label="置顶优先" value="top" />
              <el-option label="热门内容" value="hot" />
            </el-select>
          </div>

          <div class="filter-categories">
            <button
              type="button"
              class="filter-chip"
              :class="{ 'filter-chip--active': !selectedCategoryId }"
              @click="selectCategory(undefined)"
            >
              全部
            </button>
            <button
              v-for="cat in store.categories"
              :key="cat.id"
              type="button"
              class="filter-chip"
              :class="{ 'filter-chip--active': selectedCategoryId === cat.id }"
              @click="selectCategory(cat.id)"
            >
              {{ cat.name }}
            </button>
          </div>
        </header>

        <div class="article-section">
          <div v-if="store.loading" class="section-loading">
            <div class="skeleton-list">
              <div v-for="n in 4" :key="n" class="skeleton-item">
                <div class="skeleton-cover" />
                <div class="skeleton-body">
                  <div class="skeleton-line skeleton-line--title" />
                  <div class="skeleton-line skeleton-line--text" />
                  <div class="skeleton-line skeleton-line--short" />
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="store.articles.length" class="article-list">
            <ArticleListCard v-for="article in store.articles" :key="article.id" :article="article" />
          </div>

          <el-empty v-else description="暂无文章" />

          <div v-if="store.articles.length" class="section-pagination">
            <el-pagination
              v-model:current-page="pagination.current"
              :page-size="pagination.size"
              :total="store.total"
              background
              layout="prev, pager, next"
              @current-change="loadArticles"
            />
          </div>
        </div>
      </div>

      <aside class="articles-sidebar">
        <HomeSidebar
          :hot-articles="store.hotArticles"
          :tags="store.tags"
          :comments="store.comments"
          :format-date="formatDate"
          @select-tag="setTag"
        />
      </aside>

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
    </div>

    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Expand, Fold } from '@element-plus/icons-vue'
import { useFrontContentStore } from '@/stores'
import { useAdminPagination } from '@/composables/useAdminPagination'
import { DateUtils } from '@/utils/dateUtils'
import type { PublicArticleQueryRequest } from '@/types/api-types'
import HomeSidebar from '../home/components/HomeSidebar.vue'
import ArticleListCard from './ArticleListCard.vue'

const route = useRoute()
const router = useRouter()
const store = useFrontContentStore()
const sidebarOpen = ref(false)

const currentSort = ref<PublicArticleQueryRequest['sort']>('latest')
const selectedCategoryId = ref<number | undefined>(undefined)

const { pagination, fetch: loadArticles } = useAdminPagination({
  fetchFn: store.fetchArticles,
  buildParams: () => ({
    categoryId: selectedCategoryId.value,
    sort: currentSort.value,
  }),
  defaultSize: 12,
  immediate: false,
})

function formatDate(value?: string | null): string {
  return value ? DateUtils.formatRelativeTime(value) : ''
}

function syncToUrl(): void {
  const query: Record<string, string> = {}
  if (selectedCategoryId.value != null) query.category = String(selectedCategoryId.value)
  if (currentSort.value && currentSort.value !== 'latest') query.sort = currentSort.value
  if (pagination.current > 1) query.page = String(pagination.current)
  router.replace({ query })
}

const VALID_SORTS = new Set<string>(['latest', 'top', 'hot'])

function readFromUrl(): void {
  const q = route.query
  selectedCategoryId.value = q.category ? Number(q.category) : undefined
  currentSort.value = VALID_SORTS.has(q.sort as string)
    ? (q.sort as PublicArticleQueryRequest['sort'])
    : 'latest'
  pagination.current = q.page ? Number(q.page) : 1
}

function selectCategory(id?: number): void {
  selectedCategoryId.value = id
  pagination.current = 1
  syncToUrl()
  loadArticles()
}

function setTag(): void {
  sidebarOpen.value = false
}

watch(currentSort, () => {
  pagination.current = 1
  syncToUrl()
  loadArticles()
})

onMounted(async () => {
  readFromUrl()
  await Promise.all([
    store.fetchCategoryTree(),
    loadArticles(),
    store.fetchHotArticles(),
    store.fetchComments({ current: 1, size: 6, targetType: 'article' }),
  ])
  syncToUrl()
})
</script>

<style scoped>
.articles-page {
  min-height: 100vh;
  background: var(--el-fill-color-lighter, #f5f5f5);
}

.articles-container {
  width: min(1240px, 100%);
  margin: 0 auto;
  padding: 0 24px 48px;
  display: flex;
  gap: 24px;
  position: relative;
}

.articles-main {
  flex: 1;
  min-width: 0;
}

.articles-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.sidebar-toggle {
  display: none;
}

.sidebar-overlay {
  display: none;
}

/* Header */
.articles-header {
  margin-bottom: 20px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.sort-select {
  width: 128px;
}

.filter-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}

.filter-chip {
  padding: 6px 18px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 20px;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  transition:
    color 0.2s,
    background 0.2s,
    border-color 0.2s;
}

.filter-chip:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}

.filter-chip:hover {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

.filter-chip--active {
  color: #fff;
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.filter-chip--active:hover {
  color: #fff;
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

/* Article section */
.article-section {
  background: var(--el-bg-color, #fff);
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-loading {
  padding: 0;
}

/* Skeleton */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  border-radius: 12px;
  background: var(--el-bg-color, #fff);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.skeleton-cover {
  width: 240px;
  min-width: 240px;
  aspect-ratio: 3 / 2;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    var(--el-fill-color-light) 25%,
    var(--el-fill-color) 50%,
    var(--el-fill-color-light) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-line {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    var(--el-fill-color-light) 25%,
    var(--el-fill-color) 50%,
    var(--el-fill-color-light) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-line--title {
  width: 80%;
  height: 16px;
}

.skeleton-line--text {
  width: 100%;
}

.skeleton-line--short {
  width: 50%;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.section-pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
}

/* Responsive */
@media (max-width: 1024px) {
  .articles-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 300px;
    z-index: 100;
    background: var(--el-bg-color, #fff);
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
    padding: 20px;
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
  .articles-container {
    padding: 0 16px 32px;
    gap: 16px;
  }

  .article-section {
    padding: 20px;
    border-radius: 0;
  }

  .skeleton-item {
    flex-direction: column;
    gap: 12px;
  }

  .skeleton-cover {
    width: 100%;
    min-width: unset;
  }

  .articles-sidebar {
    width: 280px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .filter-chip {
    transition: none;
  }

  .articles-sidebar {
    transition: none;
  }

  .sidebar-toggle {
    transition: none;
  }

  .sidebar-toggle:hover {
    transform: none;
  }

  .skeleton-cover,
  .skeleton-line {
    animation: none;
  }
}
</style>
