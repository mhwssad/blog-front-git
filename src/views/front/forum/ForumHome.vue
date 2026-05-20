<template>
  <div class="forum-home">
    <div class="forum-container">
      <main class="forum-main">
        <div class="forum-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>论坛</el-breadcrumb-item>
          </el-breadcrumb>

          <div class="forum-hero">
            <div class="forum-hero-content">
              <h1 class="forum-hero-title">论坛</h1>
              <p class="forum-hero-desc">与社区成员分享想法、交流经验</p>
              <div class="forum-hero-stats">
                <div class="forum-stat">
                  <span class="forum-stat__number">{{ store.postTotal }}</span>
                  <span class="forum-stat__label">篇帖子</span>
                </div>
                <div class="forum-stat">
                  <span class="forum-stat__number">{{ store.sections.length }}</span>
                  <span class="forum-stat__label">个版块</span>
                </div>
              </div>
            </div>
            <router-link v-if="authStore.isLoggedIn" to="/forum/create">
              <el-button type="primary" effect="dark" class="forum-hero-btn">发帖</el-button>
            </router-link>
          </div>

          <div class="forum-filter-row">
            <el-input
              v-model="keyword"
              placeholder="搜索帖子"
              :prefix-icon="Search"
              clearable
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
            <el-select v-model="sort" @change="handleSortChange">
              <el-option label="最新" value="latest" />
              <el-option label="热门" value="hot" />
            </el-select>
          </div>
        </div>

        <div class="forum-section-tabs">
          <button
            type="button"
            class="section-tab"
            :class="{ 'section-tab--active': selectedSectionId === undefined }"
            @click="handleSectionClick(undefined)"
          >
            <el-icon><Grid /></el-icon>
            全部
          </button>
          <button
            v-for="section in store.sections"
            :key="section.id"
            type="button"
            class="section-tab"
            :class="{ 'section-tab--active': selectedSectionId === section.id }"
            @click="handleSectionClick(section.id)"
          >
            <span class="section-tab__dot">{{ section.name?.charAt(0) }}</span>
            {{ section.name }}
          </button>
        </div>

        <div v-loading="store.loading" class="forum-post-list">
          <ForumPostCard
            v-for="post in store.posts"
            :key="post.id"
            :post="post"
            :show-section="selectedSectionId === undefined"
          />

          <el-empty v-if="!store.loading && store.posts.length === 0" description="暂无帖子" />
        </div>

        <el-pagination
          v-if="store.postTotal > pagination.size"
          background
          layout="prev, pager, next"
          :total="store.postTotal"
          :page-size="pagination.size"
          :current-page="pagination.current"
          @current-change="handlePageChange"
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

      <aside class="forum-sidebar" :class="{ 'forum-sidebar--open': sidebarOpen }">
        <div class="sidebar-card">
          <h3 class="sidebar-card__title">版块</h3>
          <ul class="sidebar-section-list">
            <li v-for="section in store.sections" :key="section.id" class="sidebar-section-item">
              <router-link :to="`/forum/sections/${section.id}`" class="sidebar-section-link">
                <span class="sidebar-section-name">{{ section.name }}</span>
                <span v-if="section.description" class="sidebar-section-desc">
                  {{ section.description }}
                </span>
              </router-link>
            </li>
          </ul>
        </div>

        <div v-if="hotPosts.length" class="sidebar-card sidebar-hot">
          <h3 class="sidebar-card__title">热门帖子</h3>
          <ul class="sidebar-hot-list">
            <li
              v-for="(hp, idx) in hotPosts"
              :key="hp.id"
              class="sidebar-hot-item"
            >
              <span class="sidebar-hot-rank" :class="rankClass(idx)">
                {{ idx + 1 }}
              </span>
              <router-link :to="`/forum/posts/${hp.id}`" class="sidebar-hot-title">
                {{ hp.title }}
              </router-link>
              <span class="sidebar-hot-count">{{ hp.replyCount }}</span>
            </li>
          </ul>
        </div>

        <div class="sidebar-card sidebar-tips">
          <h3 class="sidebar-card__title">社区公约</h3>
          <ul class="sidebar-tips-list">
            <li>友善交流，尊重他人观点</li>
            <li>分享有价值的内容和经验</li>
            <li>不发布违规或广告信息</li>
            <li>遇到问题积极反馈</li>
          </ul>
        </div>
      </aside>

      <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { Search, Expand, Fold, Grid } from '@element-plus/icons-vue'
import { useUserForumStore, useAuthStore } from '@/stores'
import { useAdminPagination } from '@/composables/useAdminPagination'
import ForumPostCard from './components/ForumPostCard.vue'

const store = useUserForumStore()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

const keyword = ref('')
const sort = ref<'latest' | 'hot'>('latest')
const selectedSectionId = ref<number | undefined>(undefined)

const { pagination, fetch, handleSearch, handleCurrentChange } =
  useAdminPagination({
    fetchFn: store.fetchPosts,
    buildParams: () => ({
      keyword: keyword.value || undefined,
      sectionId: selectedSectionId.value,
      sort: sort.value,
    }),
  })

const hotPosts = computed(() =>
  [...store.posts].sort((a, b) => b.replyCount - a.replyCount).slice(0, 5),
)

function rankClass(idx: number): string {
  if (idx === 0) return 'sidebar-hot-rank--gold'
  if (idx === 1) return 'sidebar-hot-rank--silver'
  if (idx === 2) return 'sidebar-hot-rank--bronze'
  return ''
}

function handleSectionClick(sectionId: number | undefined) {
  selectedSectionId.value = sectionId
  handleSearch()
}

function handleSortChange() {
  handleSearch()
}

function handlePageChange(page: number) {
  handleCurrentChange(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  store.fetchSections()
})
</script>

<style scoped>
.forum-home {
  min-height: 100vh;
  background: var(--color-bg-page);
}

.forum-container {
  width: min(1240px, 100%);
  margin: 0 auto;
  padding: 0 24px 48px;
  display: flex;
  gap: 24px;
  position: relative;
}

.forum-main {
  flex: 1;
  min-width: 0;
}

.forum-header {
  background: var(--color-bg-base);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.forum-header .el-breadcrumb {
  padding: 12px 24px 0;
}

.forum-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, var(--el-color-primary-light-3), var(--el-color-primary));
  padding: 24px;
  margin-top: 8px;
}

.forum-hero-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.forum-hero-title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
}

.forum-hero-desc {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.forum-hero-stats {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.forum-stat {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.forum-stat__number {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.forum-stat__label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
}

.forum-hero-btn {
  flex-shrink: 0;
}

.forum-filter-row {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
}

.forum-filter-row .el-input {
  max-width: 320px;
}

.forum-filter-row .el-select {
  width: 120px;
}

.forum-section-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.section-tab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid var(--el-border-color);
  background: var(--color-bg-base);
  color: var(--el-text-color-regular);
  font-size: 14px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
}

.section-tab:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.section-tab--active {
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: #fff;
}

.section-tab--active:hover {
  background: var(--el-color-primary-dark-2);
  color: #fff;
}

.section-tab__dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 600;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
}

.section-tab--active .section-tab__dot {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.forum-post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
}

.el-pagination {
  justify-content: center;
  margin-top: 24px;
}

.forum-sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-toggle {
  display: none;
}

.sidebar-overlay {
  display: none;
}

.sidebar-card {
  background: var(--color-bg-base);
  border-radius: 12px;
  padding: 20px;
}

.sidebar-card__title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px;
  color: var(--el-text-color-primary);
}

.sidebar-section-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar-section-item {
  margin-bottom: 4px;
}

.sidebar-section-item:last-child {
  margin-bottom: 0;
}

.sidebar-section-link {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.2s;
}

.sidebar-section-link:hover {
  background: var(--el-fill-color-light);
}

.sidebar-section-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.sidebar-section-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-hot-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar-hot-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

.sidebar-hot-item:last-child {
  border-bottom: none;
}

.sidebar-hot-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.sidebar-hot-rank--gold {
  background: #f59e0b;
  color: #fff;
}

.sidebar-hot-rank--silver {
  background: #9ca3af;
  color: #fff;
}

.sidebar-hot-rank--bronze {
  background: #b45309;
  color: #fff;
}

.sidebar-hot-title {
  flex: 1;
  font-size: 13px;
  color: var(--el-text-color-regular);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.sidebar-hot-title:hover {
  color: var(--el-color-primary);
}

.sidebar-hot-count {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

.sidebar-tips-list {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 2;
}

@media (max-width: 1024px) {
  .forum-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 300px;
    z-index: 100;
    background: var(--color-bg-base);
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
    padding: 20px;
  }

  .forum-sidebar--open {
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
  .forum-container {
    padding: 0 16px 32px;
    gap: 16px;
  }

  .forum-sidebar {
    width: 280px;
  }

  .forum-hero {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .forum-hero-title {
    font-size: 22px;
  }

  .forum-hero-desc {
    display: none;
  }

  .forum-filter-row {
    padding: 12px 16px;
    flex-direction: column;
  }

  .forum-filter-row .el-input {
    max-width: none;
  }

  .forum-filter-row .el-select {
    width: 100%;
  }

  .sidebar-tips {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .forum-sidebar {
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
