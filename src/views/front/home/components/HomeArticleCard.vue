<template>
  <router-link :to="`/articles/${article.id}`" class="article-card">
    <div class="article-cover">
      <img
        v-if="article.coverImage"
        :src="article.coverImage"
        :alt="article.title"
        width="360"
        height="202"
        loading="lazy"
      />
      <div v-else class="cover-placeholder">
        <el-icon :size="28" aria-hidden="true"><Picture /></el-icon>
      </div>
      <el-tag
        v-if="article.isTop === 1"
        class="top-badge"
        size="small"
        type="danger"
        effect="dark"
        round
      >
        置顶
      </el-tag>
    </div>

    <div class="article-body">
      <h3 class="article-title">{{ article.title }}</h3>

      <p class="article-summary">{{ article.summary || '暂无摘要' }}</p>

      <div class="article-footer">
        <div class="article-meta">
          <span class="meta-author">{{ article.authorName }}</span>
          <span class="meta-sep">&middot;</span>
          <time>{{ article.publishTime ?? '待发布' }}</time>
        </div>

        <div class="article-stats">
          <span class="stat-item">
            <el-icon aria-hidden="true"><View /></el-icon>{{ formatCount(article.viewCount) }}
          </span>
          <span class="stat-item">
            <el-icon aria-hidden="true"><Star /></el-icon>{{ formatCount(article.likeCount) }}
          </span>
          <span class="stat-item">
            <el-icon aria-hidden="true"><ChatDotRound /></el-icon>{{ formatCount(article.commentCount) }}
          </span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script lang="ts" setup>
import { ChatDotRound, Picture, Star, View } from '@element-plus/icons-vue'
import type { PublicArticleCardVO } from '@/types/api-types'

defineProps<{
  article: PublicArticleCardVO
}>()

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
</script>

<style scoped>
.article-card {
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color, #fff);
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);
}

.article-card:focus-visible {
  outline: 3px solid var(--el-color-primary);
  outline-offset: 2px;
}

.article-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-card:hover .article-cover img {
  transform: scale(1.06);
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--el-color-primary-light-7),
    var(--el-color-primary-light-9)
  );
  color: var(--el-color-primary-light-3);
}

.top-badge {
  position: absolute;
  top: 10px;
  left: 10px;
}

.article-body {
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.article-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--el-text-color-primary);
  text-wrap: balance;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s;
}

.article-card:hover .article-title {
  color: var(--el-color-primary);
}

.article-summary {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--el-border-color-extra-light, #f2f2f2);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.meta-author {
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.meta-sep {
  font-size: 10px;
}

.article-stats {
  display: flex;
  gap: 12px;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .article-card {
    transition: none;
  }

  .article-cover img {
    transition: none;
  }

  .article-card:hover {
    transform: none;
  }

  .article-card:hover .article-cover img {
    transform: none;
  }

  .article-title {
    transition: none;
  }
}
</style>
