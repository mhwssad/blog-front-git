<template>
  <div class="sidebar-hot">
    <div class="sidebar-block-title">热门文章</div>
    <div v-if="articles.length" class="hot-list">
      <router-link
        v-for="(article, index) in articles"
        :key="article.id"
        :to="`/articles/${article.id}`"
        class="hot-item"
      >
        <span class="hot-rank">{{ index + 1 }}</span>
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
import type { PublicArticleCardVO } from '@/api/types'

defineProps<{
  articles: PublicArticleCardVO[]
}>()
</script>

<style scoped>
.sidebar-block-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 4px;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.15s;
}

.hot-item:hover {
  background: var(--el-fill-color-light);
}

.hot-rank {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.hot-item:nth-child(1) .hot-rank {
  background: var(--el-color-primary);
  color: #fff;
}

.hot-item:nth-child(2) .hot-rank {
  background: var(--el-color-primary-light-3);
  color: #fff;
}

.hot-item:nth-child(3) .hot-rank {
  background: var(--el-color-primary-light-5);
  color: #fff;
}

.hot-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.hot-title {
  font-size: 13px;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
}
</style>
