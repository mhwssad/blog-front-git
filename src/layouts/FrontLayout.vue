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
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文章..."
          prefix-icon="Search"
          clearable
          style="max-width: 400px"
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
    router.push({ path: '/', query: { keyword: searchKeyword.value.trim() } })
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
  justify-content: center;
  padding: 0 24px;
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
