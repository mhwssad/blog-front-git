<template>
  <div class="front-layout">
    <header class="front-header">
      <div class="header-left">
        <router-link to="/" class="logo-link">
          <LayoutLogo />
        </router-link>
      </div>

      <div class="header-center">
        <nav class="nav-links">
          <router-link to="/" class="nav-item" exact-active-class="nav-item--active">首页</router-link>
          <router-link to="/hall" class="nav-item" exact-active-class="nav-item--active">大厅</router-link>
          <router-link to="/channels" class="nav-item" exact-active-class="nav-item--active">频道</router-link>
          <router-link to="/ai" class="nav-item" exact-active-class="nav-item--active">AI 助手</router-link>
        </nav>
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
              <span class="user-name">{{
                authStore.currentUser?.nickname || authStore.currentUser?.username
              }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/user/profile')">个人中心</el-dropdown-item>
                <el-dropdown-item @click="router.push('/user/collections')"
                  >我的收藏</el-dropdown-item
                >
                <el-dropdown-item @click="router.push('/user/footprints')"
                  >我的足迹</el-dropdown-item
                >
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

    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-columns">
          <div class="footer-col">
            <h4 class="footer-col-title">导航</h4>
            <nav class="footer-links">
              <router-link to="/">首页</router-link>
              <router-link to="/categories">分类</router-link>
              <router-link to="/tags">标签</router-link>
              <router-link to="/about">关于</router-link>
            </nav>
          </div>

          <div class="footer-col">
            <h4 class="footer-col-title">友情链接</h4>
            <nav class="footer-links">
              <a
                v-for="link in friendLinks"
                :key="link.url"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ link.name }}
              </a>
              <span v-if="!friendLinks.length" class="footer-empty">暂无友链</span>
            </nav>
          </div>

          <div class="footer-col">
            <h4 class="footer-col-title">关于本站</h4>
            <div class="footer-info">
              <p>{{ siteConfig.copyright }}</p>
              <p v-if="siteConfig.icp">
                <a :href="siteConfig.icpUrl" target="_blank" rel="noopener noreferrer">
                  {{ siteConfig.icp }}
                </a>
              </p>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>{{ siteConfig.copyright }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import LayoutLogo from '@/layouts/components/LayoutLogo.vue'

interface FriendLink {
  name: string
  url: string
}

interface SiteConfig {
  copyright: string
  icp?: string
  icpUrl?: string
}

const router = useRouter()
const authStore = useAuthStore()

const unreadCount = ref(0)

const friendLinks: FriendLink[] = [
  { name: 'Vue.js', url: 'https://vuejs.org' },
  { name: 'Element Plus', url: 'https://element-plus.org' },
  { name: 'Vite', url: 'https://vitejs.dev' },
]

const siteConfig: SiteConfig = {
  copyright: `© ${new Date().getFullYear()} 博客`,
  icp: undefined,
  icpUrl: undefined,
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

/* Footer */
.site-footer {
  background: #1d1e22;
  color: #a0a0a0;
  margin-top: 48px;
  border-top: 1px solid #2c2d32;
}

.footer-inner {
  width: min(1080px, 100%);
  margin: 0 auto;
  padding: 40px 24px 24px;
}

.footer-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.footer-col-title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: #e0e0e0;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-links a {
  color: #a0a0a0;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #fff;
}

.footer-empty {
  font-size: 13px;
  color: #666;
}

.footer-info p {
  margin: 0 0 8px;
  font-size: 14px;
  line-height: 1.6;
}

.footer-info a {
  color: #a0a0a0;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-info a:hover {
  color: #fff;
}

.footer-bottom {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #2c2d32;
  text-align: center;
  font-size: 13px;
  color: #666;
}

.footer-bottom p {
  margin: 0;
}

@media (max-width: 768px) {
  .footer-columns {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .footer-inner {
    padding: 32px 16px 20px;
  }

  .site-footer {
    margin-top: 32px;
  }
}
</style>
