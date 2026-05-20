<template>
  <header class="front-header">
    <div class="header-left">
      <LayoutLogo mode="front" />
      <nav class="nav-links">
        <router-link to="/" class="nav-item" exact-active-class="nav-item--active"
          >首页</router-link
        >
        <router-link to="/hall" class="nav-item" exact-active-class="nav-item--active"
          >大厅</router-link
        >
        <router-link to="/forum" class="nav-item" exact-active-class="nav-item--active"
          >论坛</router-link
        >
        <router-link to="/channels" class="nav-item" exact-active-class="nav-item--active"
          >频道</router-link
        >
        <router-link to="/ai" class="nav-item" exact-active-class="nav-item--active"
          >AI 助手</router-link
        >
      </nav>
    </div>

    <div class="header-center">
      <el-input
        v-model="searchKeyword"
        class="search-input"
        placeholder="搜索文章、帖子..."
        clearable
        :prefix-icon="Search"
        @keyup.enter="handleSearch"
      />
    </div>

    <div class="header-right">
      <template v-if="authStore.isLoggedIn">
        <router-link to="/user/notices" class="header-action" title="通知">
          <el-tooltip>
            <div class="action-inner">
              <el-badge
                :value="unreadCount || undefined"
                :hidden="!unreadCount"
              >
                <el-icon :size="20"><Bell /></el-icon>
              </el-badge>
              <span class="action-label">通知</span>
            </div>
            <template #content>
              <div v-if="unreadCount">您有 {{ unreadCount }} 条未读通知</div>
              <div v-else>没有新通知</div>
            </template>
          </el-tooltip>
        </router-link>
        <router-link to="/chat" class="header-action" title="消息">
          <div class="action-inner">
            <el-icon :size="20"><ChatDotRound /></el-icon>
            <span class="action-label">消息</span>
          </div>
        </router-link>
        <router-link to="/user/profile" class="header-action" title="我的">
          <div class="action-inner">
            <el-icon :size="20"><User /></el-icon>
            <span class="action-label">我的</span>
          </div>
        </router-link>
        <el-dropdown trigger="click">
          <div class="user-avatar">
            <el-avatar :size="32" :src="authStore.currentUser?.avatar" />
            <span class="user-name">{{
              authStore.currentUser?.nickname || authStore.currentUser?.username
            }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="router.push('/user/collections')"
                >我的收藏</el-dropdown-item
              >
              <el-dropdown-item @click="router.push('/user/footprints')">我的足迹</el-dropdown-item>
              <el-dropdown-item @click="router.push('/user/files')">我的文件</el-dropdown-item>
              <el-dropdown-item @click="router.push('/user/series')">我的系列</el-dropdown-item>
              <el-dropdown-item @click="router.push('/user/forum/posts')"
                >我的帖子</el-dropdown-item
              >
              <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
      <template v-else>
        <el-button type="primary" @click="router.push('/login')">登录</el-button>
        <el-button @click="router.push('/register')">注册</el-button>
      </template>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, ChatDotRound, Search, User } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import LayoutLogo from '@/layouts/components/LayoutLogo.vue'

const router = useRouter()
const authStore = useAuthStore()

const unreadCount = ref(0)
const searchKeyword = ref('')

function handleSearch(): void {
  const keyword = searchKeyword.value.trim()
  if (keyword) {
    router.push({ path: '/search', query: { q: keyword } })
  }
}

function handleLogout(): void {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.front-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 24px;
  background: var(--color-bg-base);
  border-bottom: 1px solid var(--color-border-base);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
}

.nav-links {
  display: flex;
  gap: 4px;
}

.nav-item {
  padding: 6px 14px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  text-decoration: none;
  border-radius: 6px;
  transition:
    color 0.2s,
    background 0.2s;
}

.nav-item:hover {
  color: var(--el-color-primary);
  background: var(--el-fill-color-light);
}

.nav-item--active {
  color: var(--el-color-primary);
  font-weight: 500;
}

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32px;
  max-width: 480px;
}

.search-input {
  width: 100%;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.header-action {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-regular);
  text-decoration: none;
  transition:
    color 0.2s,
    background 0.2s;
}

.header-action:hover {
  color: var(--el-color-primary);
}

.action-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.action-label {
  font-size: 11px;
  line-height: 1;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.user-name {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

@media (max-width: 768px) {
  .header-center {
    display: none;
  }

  .nav-links {
    display: none;
  }

  .action-label {
    display: none;
  }
}
</style>
