<template>
  <router-link :to="`/articles/${article.id}`" class="article-list-card">
    <div class="card-cover">
      <img
        v-if="article.coverImage"
        :src="article.coverImage"
        :alt="article.title"
        width="240"
        height="160"
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

    <div class="card-content">
      <h3 class="card-title">{{ article.title }}</h3>

      <p class="card-summary">{{ article.summary || '暂无摘要' }}</p>

      <div class="card-footer">
        <div class="card-meta">
          <span class="meta-author">{{ article.authorName }}</span>
          <span class="meta-sep">&middot;</span>
          <time>{{ article.publishTime ?? '待发布' }}</time>
        </div>

        <div class="card-stats">
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
.article-list-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 12px;
  text-decoration: none;
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
}

.article-list-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
}

.article-list-card:focus-visible {
  outline: 3px solid var(--el-color-primary);
  outline-offset: 2px;
}

/* Cover */
.card-cover {
  position: relative;
  width: 240px;
  min-width: 240px;
  aspect-ratio: 3 / 2;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-list-card:hover .card-cover img {
  transform: scale(1.05);
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
  top: 8px;
  left: 8px;
}

/* Content */
.card-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  min-width: 0;
  padding: 4px 0;
}

.card-title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--el-text-color-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s;
}

.article-list-card:hover .card-title {
  color: var(--el-color-primary);
}

.card-summary {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-extra-light);
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

.meta-author {
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.meta-sep {
  font-size: 10px;
}

.card-stats {
  display: flex;
  gap: 14px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

/* Responsive */
@media (max-width: 768px) {
  .article-list-card {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .card-cover {
    width: 100%;
    min-width: unset;
  }

  .card-title {
    font-size: 16px;
  }

  .card-summary {
    font-size: 13px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-list-card {
    transition: none;
  }

  .card-cover img {
    transition: none;
  }

  .article-list-card:hover {
    transform: none;
  }

  .article-list-card:hover .card-cover img {
    transform: none;
  }

  .card-title {
    transition: none;
  }
}
</style>
