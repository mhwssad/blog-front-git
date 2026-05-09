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
          <AuthorBadge />
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

    <div class="article-actions">
      <el-button size="small" text>
        <el-icon><Share /></el-icon> 分享
      </el-button>
      <el-button size="small" text type="danger">
        <el-icon><Warning /></el-icon> 举报
      </el-button>
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
/**
 * 文章头部组件
 * @description 展示文章标题、作者、时间、浏览量、评论数等信息
 * @module front/article/components/ArticleHeader
 */
import { computed } from 'vue'
import { ChatDotRound, Clock, User, View, Share, Warning } from '@element-plus/icons-vue'
import type { PublicArticleDetailVO } from '@/types/api-types'
import AuthorBadge from '@/components/common/AuthorBadge.vue'

const props = defineProps<{
  article: PublicArticleDetailVO
}>()

// 获取文章所属的第一个分类
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

.article-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
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
