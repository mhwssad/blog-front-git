<template>
  <div class="sidebar-hot">
    <h3 class="sidebar-block-title">
      <el-icon aria-hidden="true" class="title-icon"><TrendCharts /></el-icon>
      热门文章
    </h3>
    <div v-if="articles.length" class="hot-list">
      <router-link
        v-for="(article, index) in articles"
        :key="article.id"
        :to="`/articles/${article.id}`"
        class="hot-item"
      >
        <span class="hot-rank" :class="{ 'hot-rank--top': index < 3 }">{{ index + 1 }}</span>
        <div class="hot-info">
          <span class="hot-title">{{ article.title }}</span>
          <span class="hot-views">{{ article.viewCount }} 阅读</span>
        </div>
      </router-link>
    </div>
    <div v-else class="sidebar-empty">暂无数据</div>
  </div>
</template>

<script lang="ts" setup>
import { TrendCharts } from '@element-plus/icons-vue'
import type { PublicArticleCardVO } from '@/types/api-types'

defineProps<{
  articles: PublicArticleCardVO[]
}>()
</script>

<style scoped>
.sidebar-block-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.title-icon {
  color: var(--el-color-primary);
}

.hot-list {
  display: flex;
  flex-direction: column;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.15s;
}

.hot-item:not(:last-child) {
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

.hot-item:hover {
  background: var(--el-fill-color-lighter);
}

.hot-item:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: -2px;
}

.hot-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.hot-rank--top:nth-child(1) {
  background: var(--el-color-primary);
  color: #fff;
}

.hot-rank--top:nth-child(2) {
  background: var(--el-color-primary-light-3);
  color: #fff;
}

.hot-rank--top:nth-child(3) {
  background: var(--el-color-primary-light-5);
  color: #fff;
}

.hot-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.hot-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.15s;
}

.hot-item:hover .hot-title {
  color: var(--el-color-primary);
}

.hot-views {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.sidebar-empty {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-align: center;
  padding: 8px 0;
}

@media (prefers-reduced-motion: reduce) {
  .hot-item {
    transition: none;
  }

  .hot-title {
    transition: none;
  }
}
</style>
