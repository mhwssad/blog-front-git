<template>
  <div class="about-page">
    <div class="about-hero">
      <h1 class="about-title">关于本站</h1>
      <p class="about-subtitle">一个专注于技术分享与交流的个人博客平台</p>
    </div>

    <el-card shadow="never" class="about-section">
      <h2 class="section-heading">博客介绍</h2>
      <p class="section-text">
        本站是一个基于 Vue 3 + Spring Boot
        构建的全栈博客平台。致力于为技术爱好者提供优质的文章分享、互动交流平台。
        支持文章发布、分类管理、标签系统、评论互动、用户关注等核心功能，同时提供频道、AI
        助手等特色功能。
      </p>
    </el-card>

    <el-card shadow="never" class="about-section">
      <h2 class="section-heading">站长信息</h2>
      <div class="author-card">
        <el-avatar :size="64">Admin</el-avatar>
        <div class="author-info">
          <div class="author-name">博客站长</div>
          <div class="author-desc">
            全栈开发者，热爱技术分享与开源。持续学习中，希望用文字记录技术成长之路。
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="about-section">
      <h2 class="section-heading">技术栈</h2>
      <div class="tech-grid">
        <div v-for="tech in techStack" :key="tech.name" class="tech-item">
          <span class="tech-name">{{ tech.name }}</span>
          <span class="tech-desc">{{ tech.desc }}</span>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="about-section">
      <h2 class="section-heading">联系方式</h2>
      <div class="contact-list">
        <div v-for="contact in contacts" :key="contact.label" class="contact-item">
          <span class="contact-label">{{ contact.label }}</span>
          <span class="contact-value">{{ contact.value }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
/**
 * 关于页面
 * @description 展示博客平台介绍、站长信息、技术栈、联系方式等内容
 * @module front/about
 */
const techStack = [
  { name: 'Vue 3', desc: '前端框架' },
  { name: 'TypeScript', desc: '类型安全' },
  { name: 'Element Plus', desc: 'UI 组件库' },
  { name: 'Vite', desc: '构建工具' },
  { name: 'Spring Boot', desc: '后端框架' },
  { name: 'MySQL', desc: '数据库' },
]

const contacts = [
  { label: 'GitHub', value: 'github.com/blog' },
  { label: '邮箱', value: 'admin@blog.com' },
  { label: 'QQ 群', value: '123456789' },
]
</script>

<style scoped>
.about-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.about-hero {
  text-align: center;
  margin-bottom: 32px;
  padding: 40px 0;
}

.about-title {
  margin: 0 0 12px;
  font-size: 32px;
  font-weight: 700;
}

.about-subtitle {
  margin: 0;
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.about-section {
  margin-bottom: 20px;
  border-radius: 12px;
}

.section-heading {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
}

.section-text {
  margin: 0;
  font-size: 15px;
  color: var(--el-text-color-regular);
  line-height: 1.8;
}

.author-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.author-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
}

.author-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.tech-item {
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}

.tech-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
}

.tech-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.contact-label {
  width: 80px;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.contact-value {
  font-size: 14px;
  color: var(--el-text-color-primary);
}
</style>
