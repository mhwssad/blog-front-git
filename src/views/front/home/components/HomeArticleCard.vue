<template>
  <el-card shadow="hover" class="article-card">
    <div class="article-card-top">
      <el-tag v-if="article.isTop === 1" type="danger" effect="light" round>TOP</el-tag>
      <span class="article-time">{{ article.publishTime || '待发布' }}</span>
    </div>

    <h3 class="article-title">{{ article.title }}</h3>
    <p class="article-summary">
      {{ article.summary || '该文章当前未提供摘要。' }}
    </p>

    <div class="article-meta">
      <span><el-icon><User /></el-icon>{{ article.authorName }}</span>
      <span><el-icon><View /></el-icon>{{ article.viewCount }}</span>
      <span><el-icon><Star /></el-icon>{{ article.likeCount }}</span>
      <span><el-icon><ChatDotRound /></el-icon>{{ article.commentCount }}</span>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { ChatDotRound, Star, User, View } from '@element-plus/icons-vue'
import type { PublicArticleCardVO } from '@/api/types'

defineProps<{
  article: PublicArticleCardVO
}>()
</script>

<style scoped>
.article-card {
  height: 100%;
  border-radius: 24px;
}

.article-card-top,
.article-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.article-time {
  color: #64748b;
  font-size: 13px;
}

.article-title {
  margin-top: 18px;
  font-size: 22px;
  line-height: 1.35;
  font-weight: 700;
  color: #0f172a;
}

.article-summary {
  min-height: 88px;
  margin-top: 12px;
  color: #475569;
  line-height: 1.75;
}

.article-meta {
  flex-wrap: wrap;
  margin-top: 18px;
  color: #475569;
}

.article-meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}
</style>
