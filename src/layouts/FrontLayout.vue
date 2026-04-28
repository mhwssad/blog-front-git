<template>
  <div class="front-layout">
    <header class="front-header">
      <div class="header-left">
        <router-link to="/" class="logo-link">
          <LayoutLogo />
          <span class="site-name">博客</span>
        </router-link>
      </div>

      <div class="header-center">
        <nav class="nav-links">
          <router-link to="/" class="nav-item">首页</router-link>
          <router-link to="/hall" class="nav-item">大厅</router-link>
          <router-link to="/channels" class="nav-item">频道</router-link>
          <router-link to="/ai" class="nav-item">AI 助手</router-link>
        </nav>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文章..."
          prefix-icon="Search"
          clearable
          style="max-width: 320px"
          @keyup.enter="handleSearch"
        />
      </div>

      <div class="header-right">
        <template v-if="authStore.isLoggedIn">
          <router-link to="/user/notices">
            <el-badge :value="unreadCount || undefined" :hidden="!unreadCount">
              <el-icon :size="20"><Bell /></el-icon>
            </el-badge>
          </router-link>
          <el-dropdown trigger="click">
            <div class="user-avatar">
              <el-avatar :size="32" :src="authStore.currentUser?.avatar" />
              <span class="user-name">{{ authStore.currentUser?.nickname || authStore.currentUser?.username }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/user/profile')">个人中心</el-dropdown-item>
                <el-dropdown-item @click="router.push('/user/collections')">我的收藏</el-dropdown-item>
                <el-dropdown-item @click="router.push('/user/footprints')">我的足迹</el-dropdown-item>
                <el-dropdown-item @click="router.push('/user/files')">我的文件</el-dropdown-item>
                <el-dropdown-item @click="router.push('/user/series')">我的系列</el-dropdown-item>
                <el-dropdown-item @click="router.push('/chat')">消息</el-dropdown-item>
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

    <main class="front-main">
      <router-view />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import LayoutLogo from '@/layouts/components/LayoutLogo.vue'

const router = useRouter()
const authStore = useAuthStore()

const searchKeyword = ref('')
const unreadCount = ref(0)

function handleSearch(): void {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { keyword: searchKeyword.value.trim() } })
  }
}

function handleLogout(): void {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.front-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.front-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--el-text-color-primary);
}

.site-name {
  font-size: 18px;
  font-weight: 600;
}

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 0 24px;
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
  transition: color 0.2s, background 0.2s;
}

.nav-item:hover {
  color: var(--el-color-primary);
  background: var(--el-fill-color-light);
}

.nav-item.router-link-active {
  color: var(--el-color-primary);
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
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

.front-main {
  flex: 1;
}
</style>
