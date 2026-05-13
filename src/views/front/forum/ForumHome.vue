<template>
  <div class="forum-home">
    <div class="forum-container">
      <main class="forum-main">
        <div class="forum-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>论坛</el-breadcrumb-item>
          </el-breadcrumb>

          <div class="forum-title-row">
            <h1 class="forum-title">论坛</h1>
            <router-link v-if="authStore.isLoggedIn" to="/forum/create">
              <el-button type="primary">发帖</el-button>
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
          v-if="store.postTotal > pageSize"
          background
          layout="prev, pager, next"
          :total="store.postTotal"
          :page-size="pageSize"
          :current-page="currentPage"
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
      </aside>

      <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { Search, Expand, Fold } from '@element-plus/icons-vue'
import { useUserForumStore, useAuthStore } from '@/stores'
import ForumPostCard from './components/ForumPostCard.vue'

const store = useUserForumStore()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

const keyword = ref('')
const sort = ref<'latest' | 'hot'>('latest')
const selectedSectionId = ref<number | undefined>(undefined)
const currentPage = ref(1)
const pageSize = 10

function buildParams() {
  return {
    current: currentPage.value,
    size: pageSize,
    keyword: keyword.value || undefined,
    sectionId: selectedSectionId.value,
    sort: sort.value,
  }
}

async function fetchPosts() {
  await store.fetchPosts(buildParams())
}

function handleSectionClick(sectionId: number | undefined) {
  selectedSectionId.value = sectionId
  currentPage.value = 1
  fetchPosts()
}

function handleSortChange() {
  currentPage.value = 1
  fetchPosts()
}

function handleSearch() {
  currentPage.value = 1
  fetchPosts()
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchPosts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  await store.fetchSections()
  await fetchPosts()
})
</script>

<style scoped>
.forum-home {
  min-height: 100vh;
  background: var(--el-fill-color-lighter, #f5f5f5);
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
  background: var(--el-bg-color, #fff);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
}

.forum-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

.forum-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.forum-filter-row {
  display: flex;
  gap: 12px;
  margin-top: 16px;
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
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  background: var(--el-bg-color, #fff);
  color: var(--el-text-color-regular, #606266);
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
  background: var(--el-color-primary-dark-2, #337ecc);
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
}

.sidebar-toggle {
  display: none;
}

.sidebar-overlay {
  display: none;
}

.sidebar-card {
  background: var(--el-bg-color, #fff);
  border-radius: 12px;
  padding: 20px;
}

.sidebar-card__title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px;
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
  background: var(--el-fill-color-light, #f5f7fa);
}

.sidebar-section-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary, #303133);
}

.sidebar-section-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1024px) {
  .forum-sidebar {
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

  .forum-header {
    padding: 16px;
  }

  .forum-filter-row {
    flex-direction: column;
  }

  .forum-filter-row .el-input {
    max-width: none;
  }

  .forum-filter-row .el-select {
    width: 100%;
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
