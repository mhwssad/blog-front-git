<template>
  <router-link :to="`/articles/${article.id}`" class="article-card">
    <div class="article-cover">
      <img v-if="article.coverImage" :src="article.coverImage" :alt="article.title" />
      <div v-else class="cover-placeholder" />
    </div>

    <div class="article-body">
      <div class="article-top">
        <el-tag v-if="article.isTop === 1" size="small" type="danger" effect="plain">置顶</el-tag>
        <span class="article-category">{{ article.authorName }}</span>
        <span class="article-dot">·</span>
        <span class="article-date">{{ article.publishTime ?? '待发布' }}</span>
      </div>

      <h3 class="article-title">{{ article.title }}</h3>

      <p class="article-summary">
        {{ article.summary || '暂无摘要' }}
      </p>

      <div class="article-meta">
        <span><el-icon><View /></el-icon>{{ article.viewCount }}</span>
        <span><el-icon><Star /></el-icon>{{ article.likeCount }}</span>
        <span><el-icon><ChatDotRound /></el-icon>{{ article.commentCount }}</span>
      </div>
    </div>
  </router-link>
</template>

<script lang="ts" setup>
import { ChatDotRound, Star, View } from '@element-plus/icons-vue'
import type { PublicArticleCardVO } from '@/api/types'

defineProps<{
  article: PublicArticleCardVO
}>()
</script>

<style scoped>
.article-card {
  display: flex;
  gap: 20px;
  padding: 20px 0;
  text-decoration: none;
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background 0.15s;
}

.article-card:hover {
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.article-cover {
  flex-shrink: 0;
  width: 200px;
  height: 140px;
  border-radius: 6px;
  overflow: hidden;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--el-color-primary-light-7), var(--el-color-primary-light-9));
}

.article-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.article-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

.article-dot {
  color: var(--el-text-color-placeholder);
}

.article-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-card:hover .article-title {
  color: var(--el-color-primary);
}

.article-summary {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  gap: 16px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

.article-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 768px) {
  .article-card {
    flex-direction: column;
    gap: 12px;
  }

  .article-cover {
    width: 100%;
    height: 180px;
  }
}
</style>
