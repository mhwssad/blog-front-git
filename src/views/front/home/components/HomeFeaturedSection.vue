<template>
  <el-card shadow="never" class="section-card">
    <template #header>
      <div class="section-heading">
        <div>
          <el-tag type="primary" effect="plain" round>精选推荐</el-tag>
          <h2>热度和置顶内容并排展示</h2>
        </div>
      </div>
    </template>

    <el-row :gutter="18">
      <el-col v-for="article in articles.slice(0, 3)" :key="article.id" :xs="24" :md="8">
        <el-card shadow="hover" class="feature-card">
          <div class="feature-topline">
            <el-tag type="primary" effect="light" round>Top</el-tag>
            <span>{{ article.publishTime || '未设置发布时间' }}</span>
          </div>
          <h3>{{ article.title }}</h3>
          <p>{{ article.summary || '该文章当前未提供摘要。' }}</p>
          <div class="feature-footer">
            <span>{{ article.authorName }}</span>
            <span>{{ article.viewCount }} 浏览</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>

<script lang="ts" setup>
import type { PublicArticleCardVO } from '@/api/types'

defineProps<{
  articles: PublicArticleCardVO[]
}>()
</script>

<style scoped>
.section-card {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.82);
}

.section-heading h2 {
  margin-top: 10px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #0f172a;
}

.feature-card {
  height: 100%;
  border-radius: 24px;
}

.feature-topline,
.feature-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.feature-topline span:last-child,
.feature-footer {
  color: #64748b;
  font-size: 13px;
}

.feature-card h3 {
  margin-top: 18px;
  font-size: 21px;
  line-height: 1.35;
  font-weight: 700;
  color: #0f172a;
}

.feature-card p {
  margin-top: 12px;
  color: #475569;
  line-height: 1.75;
}

.feature-footer {
  margin-top: 18px;
}
</style>
