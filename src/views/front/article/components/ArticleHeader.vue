<template>
  <div class="article-header">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-if="firstCategory">
        {{ firstCategory.name }}
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ article.title }}</el-breadcrumb-item>
    </el-breadcrumb>

    <h1 class="article-title">{{ article.title }}</h1>

    <div class="article-meta">
      <div class="meta-left">
        <span class="meta-item">
          <el-icon><User /></el-icon>
          {{ article.authorName }}
        </span>
        <span class="meta-item">
          <el-icon><Clock /></el-icon>
          {{ article.publishTime ?? '—' }}
        </span>
        <span class="meta-item">
          <el-icon><View /></el-icon>
          {{ article.viewCount }}
        </span>
        <span class="meta-item">
          <el-icon><ChatDotRound /></el-icon>
          {{ article.commentCount }}
        </span>
      </div>
    </div>

    <div v-if="article.tags?.length" class="article-tags">
      <el-tag
        v-for="tag in article.tags"
        :key="tag.id"
        :color="tag.color ?? undefined"
        effect="dark"
        size="small"
        round
        class="article-tag"
      >
        {{ tag.name }}
      </el-tag>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ChatDotRound, Clock, User, View } from '@element-plus/icons-vue'
import type { PublicArticleDetailVO } from '@/api/types'

const props = defineProps<{
  article: PublicArticleDetailVO
}>()

const firstCategory = computed(() => props.article.categories?.[0])
</script>

<style scoped>
.article-header {
  margin-bottom: 8px;
}

.article-title {
  margin: 16px 0 12px;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--el-text-color-primary);
}

.article-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.meta-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.article-tag {
  border: none;
}
</style>
