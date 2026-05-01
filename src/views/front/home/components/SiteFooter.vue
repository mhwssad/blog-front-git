<template>
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
</template>

<script lang="ts" setup>
interface FriendLink {
  name: string
  url: string
}

interface SiteConfig {
  copyright: string
  icp?: string
  icpUrl?: string
}

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
</script>

<style scoped>
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
