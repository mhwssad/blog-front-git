<template>
  <el-card shadow="never" class="sidebar-card">
    <template #header>
      <div class="sidebar-title-row">
        <el-tag type="primary" effect="plain" round>热门榜</el-tag>
        <el-icon class="title-icon"><TrendCharts /></el-icon>
      </div>
    </template>

    <div class="hot-list">
      <article v-for="(article, index) in articles" :key="article.id" class="hot-item">
        <div class="hot-rank">{{ index + 1 }}</div>
        <div class="hot-copy">
          <h3>{{ article.title }}</h3>
          <p>{{ article.viewCount }} 浏览 · {{ article.likeCount }} 点赞</p>
        </div>
      </article>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { TrendCharts } from '@element-plus/icons-vue'
import type { PublicArticleCardVO } from '@/api/types'

defineProps<{
  articles: PublicArticleCardVO[]
}>()
</script>

<style scoped>
.sidebar-card {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
}

.sidebar-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-icon {
  color: #94a3b8;
}

.hot-item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.hot-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.hot-rank {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, #dbeafe, #fde68a);
  font-weight: 800;
}

.hot-copy h3 {
  font-size: 15px;
  line-height: 1.55;
  font-weight: 700;
  color: #0f172a;
}

.hot-copy p {
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
}
</style>
