<template>
  <div class="tag-detail-page">
    <div class="tag-header">
      <h1 class="tag-name"># {{ currentTag?.name || '...' }}</h1>
      <el-tag type="info" size="large">{{ frontStore.total }} 篇文章</el-tag>
    </div>

    <div v-if="frontStore.articles.length" class="article-list">
      <div
        v-for="item in frontStore.articles"
        :key="item.id"
        class="article-card"
        @click="router.push(`/articles/${item.id}`)"
      >
        <h3 class="article-title">{{ item.title }}</h3>
        <p class="article-summary">{{ item.summary }}</p>
        <div class="article-meta">
          <span>{{ item.authorName }}</span>
          <span>{{ item.publishTime }}</span>
          <span>{{ item.viewCount }} 阅读</span>
          <span>{{ item.likeCount }} 赞</span>
        </div>
      </div>
    </div>
    <el-empty v-else-if="!frontStore.loading" description="该标签下暂无文章" />

    <div v-if="frontStore.total > pagination.size" class="pagination-wrap">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="frontStore.total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * 标签详情页面
 * @description 展示某个标签下的文章列表，支持分页浏览
 * @module front/tag/TagDetailView
 * @see ../../api/content.ts
 */
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFrontContentStore } from '@/stores'
import type { PublicTagVO } from '@/types/api-types'

const route = useRoute()
const router = useRouter()
const frontStore = useFrontContentStore()

// 当前查看的标签信息
const currentTag = ref<PublicTagVO | null>(null)
// 分页参数
const pagination = reactive({ current: 1, size: 10 })

async function loadData(): Promise<void> {
  const tagId = Number(route.params.id)
  if (!tagId) return

  await frontStore.fetchArticles({
    tagId,
    current: pagination.current,
    size: pagination.size,
  })

  if (!currentTag.value) {
    const tag = frontStore.tags.find(t => t.id === tagId)
    if (tag) currentTag.value = tag
  }
}

function handlePageChange(page: number): void {
  pagination.current = page
  void loadData()
}

watch(
  () => route.params.id,
  () => {
    currentTag.value = null
    pagination.current = 1
    void loadData()
  }
)

onMounted(async () => {
  if (!frontStore.tags.length) {
    await frontStore.fetchTags()
  }
  await loadData()
})
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
