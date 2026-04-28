<template>
  <div class="series-detail-page">
    <div class="page-header">
      <div class="header-left">
        <router-link to="/series" class="back-link">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </router-link>
        <h1 class="page-title">{{ seriesDetail?.name ?? '系列详情' }}</h1>
      </div>
      <el-button type="primary" plain>编辑</el-button>
    </div>

    <div v-if="seriesDetail" class="series-info-card">
      <div class="info-cover">
        <el-icon :size="48" color="#ccc"><Picture /></el-icon>
      </div>
      <div class="info-body">
        <div class="info-desc">{{ seriesDetail.description || '暂无描述' }}</div>
        <div class="info-meta">
          <span>作者：{{ seriesDetail.author }}</span>
          <span>文章数：{{ seriesDetail.articleCount }}</span>
          <span>总阅读：{{ seriesDetail.totalRead }}</span>
        </div>
      </div>
    </div>

    <div class="articles-section">
      <div class="section-title">文章列表</div>
      <div v-if="articles.length" class="article-list">
        <div v-for="(article, index) in articles" :key="article.id" class="article-row">
          <span class="article-index">{{ index + 1 }}</span>
          <span class="article-title">{{ article.title }}</span>
          <span class="article-date">{{ article.date }}</span>
          <el-button type="primary" link size="small">查看</el-button>
        </div>
      </div>
      <el-empty v-else description="暂无文章" :image-size="64" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Picture } from '@element-plus/icons-vue'

interface SeriesDetail {
  id: number
  name: string
  description: string
  author: string
  articleCount: number
  totalRead: number
}

interface SeriesArticle {
  id: number
  title: string
  date: string
}

const route = useRoute()
const seriesId = Number(route.params.id)

const seriesDetail = ref<SeriesDetail | null>(null)
const articles = ref<SeriesArticle[]>([])

function loadDetail(): void {
  seriesDetail.value = {
    id: seriesId,
    name: '',
    description: '',
    author: '',
    articleCount: 0,
    totalRead: 0,
  }
  articles.value = []
}

onMounted(loadDetail)
</script>

<style scoped>
.series-detail-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--el-color-primary);
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.series-info-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  margin-bottom: 24px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.info-cover {
  width: 160px;
  height: 120px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}

.info-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-desc {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.info-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.articles-section {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.section-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
}

.article-list {
  display: flex;
  flex-direction: column;
}

.article-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

.article-row:last-child {
  border-bottom: none;
}

.article-index {
  width: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.article-title {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-date {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
</style>
