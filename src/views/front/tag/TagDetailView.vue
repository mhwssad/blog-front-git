<template>
  <div class="tag-detail-page">
    <div class="tag-header">
      <h1 class="tag-name"># {{ tagInfo.name }}</h1>
      <el-tag type="info" size="large">{{ tagInfo.articleCount }} 篇文章</el-tag>
    </div>

    <div v-if="articleList.length" class="article-list">
      <div v-for="item in articleList" :key="item.id" class="article-card" @click="router.push(`/articles/${item.id}`)">
        <h3 class="article-title">{{ item.title }}</h3>
        <p class="article-summary">{{ item.summary }}</p>
        <div class="article-meta">
          <span>{{ item.author }}</span>
          <span>{{ item.createTime }}</span>
        </div>
      </div>
    </div>
    <el-empty v-else description="该标签下暂无文章" />

    <div v-if="total > pageSize" class="pagination-wrap">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchArticles"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tagInfo = ref({ name: 'Vue.js', articleCount: 0 })
const articleList = ref<{ id: number; title: string; summary: string; author: string; createTime: string }[]>([])
const currentPage = ref(1)
const pageSize = 10
const total = ref(0)

function fetchArticles(): void {
  // Mock
  tagInfo.value = { name: 'Vue.js', articleCount: 15 }
  articleList.value = [
    { id: 1, title: 'Vue 3 组合式 API 最佳实践', summary: '深入理解 Composition API 的使用场景...', author: '技术博主', createTime: '2025-01-15' },
    { id: 2, title: 'Vue Router 5 新特性解析', summary: '探索 Vue Router 5 带来的变化...', author: '前端达人', createTime: '2025-01-12' },
  ]
  total.value = 15
}

onMounted(fetchArticles)
</script>

<style scoped>
.tag-detail-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.tag-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.tag-name {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-card {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.article-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.article-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.article-summary {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.article-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
