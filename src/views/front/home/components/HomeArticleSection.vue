<template>
  <section class="article-section">
    <header class="section-header">
      <router-link to="/articles" class="more-link">
        更多内容
        <el-icon><ArrowRight /></el-icon>
      </router-link>
    </header>

    <div v-if="loading" class="section-loading">
      <div class="skeleton-grid">
        <div v-for="n in 6" :key="n" class="skeleton-card">
          <div class="skeleton-cover" />
          <div class="skeleton-body">
            <div class="skeleton-line skeleton-line--title" />
            <div class="skeleton-line skeleton-line--text" />
            <div class="skeleton-line skeleton-line--short" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="articles.length" class="article-grid">
      <HomeArticleCard v-for="article in articles" :key="article.id" :article="article" />
    </div>

    <div v-else class="section-empty">
      <div class="empty-icon">
        <el-icon :size="48"><Document /></el-icon>
      </div>
      <p class="empty-text">暂无文章</p>
      <p class="empty-hint">敬请期待更多内容</p>
    </div>

    <div v-if="articles.length" class="section-pagination">
      <el-pagination
        :current-page="current"
        :page-size="size"
        :total="total"
        background
        layout="prev, pager, next"
        @current-change="(page: number) => emit('page-change', page)"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ArrowRight, Document } from '@element-plus/icons-vue'
import HomeArticleCard from './HomeArticleCard.vue'
import type { PublicArticleCardVO } from '@/types/api-types'

defineProps<{
  loading?: boolean
  articles: PublicArticleCardVO[]
  total: number
  current: number
  size: number
}>()

const emit = defineEmits<{
  'page-change': [page: number]
}>()
</script>

<style scoped>
.article-section {
  background: var(--el-bg-color, #fff);
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.more-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-color-primary);
  text-decoration: none;
  transition: opacity 0.2s;
}

.more-link:hover {
  opacity: 0.8;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* Skeleton loading */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.skeleton-card {
  border-radius: 12px;
  overflow: hidden;
  background: var(--el-bg-color, #fff);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.skeleton-cover {
  aspect-ratio: 16 / 9;
  background: linear-gradient(
    90deg,
    var(--el-fill-color-light) 25%,
    var(--el-fill-color) 50%,
    var(--el-fill-color-light) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-line {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    var(--el-fill-color-light) 25%,
    var(--el-fill-color) 50%,
    var(--el-fill-color-light) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-line--title {
  width: 80%;
  height: 16px;
}

.skeleton-line--text {
  width: 100%;
}

.skeleton-line--short {
  width: 50%;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Empty state */
.section-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 24px;
  color: var(--el-text-color-placeholder);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.4;
}

.empty-text {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.empty-hint {
  margin: 0;
  font-size: 13px;
}

.section-pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
}

@media (max-width: 1024px) {
  .article-grid,
  .skeleton-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .article-section {
    padding: 20px;
    border-radius: 0;
  }

  .article-grid,
  .skeleton-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-cover,
  .skeleton-line {
    animation: none;
  }
}
</style>
