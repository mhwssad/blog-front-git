<template>
  <div class="search-page">
    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索文章、标签..."
        size="large"
        clearable
        @keyup.enter="doSearch"
      >
        <template #append>
          <el-button @click="doSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="文章" name="article">
        <div v-if="frontContentStore.loading" style="text-align: center; padding: 40px 0">
          <el-icon class="is-loading" :size="24"><Loading /></el-icon>
        </div>
        <div v-else-if="frontContentStore.articles.length" class="result-list">
          <div
            v-for="item in frontContentStore.articles"
            :key="item.id"
            class="article-card"
            @click="router.push(`/articles/${item.id}`)"
          >
            <h3 class="article-title" v-html="highlight(item.title)" />
            <p class="article-summary" v-html="highlight(item.summary)" />
            <div class="article-meta">
              <span>{{ item.authorName }}</span>
              <span>{{ item.publishTime }}</span>
              <span>{{ item.viewCount }} 阅读</span>
              <span>{{ item.likeCount }} 点赞</span>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无匹配文章" />
      </el-tab-pane>

      <el-tab-pane label="标签" name="tag">
        <div v-if="frontContentStore.tags.length" class="tag-grid">
          <div v-for="t in frontContentStore.tags" :key="t.id" class="tag-item">
            <el-tag size="large" effect="plain" :color="t.color || undefined">
              <span v-html="highlight(t.name)" />
            </el-tag>
          </div>
        </div>
        <el-empty v-else description="暂无匹配标签" />
      </el-tab-pane>
    </el-tabs>

    <div v-if="frontContentStore.total > pagination.size" class="pagination-wrap">
      <el-pagination
        v-model:current-page="pagination.current"
        :page-size="pagination.size"
        :total="frontContentStore.total"
        layout="prev, pager, next"
        @current-change="doSearch"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * 搜索页面
 * @description 支持搜索文章和标签，关键字高亮显示
 * @module front/search/SearchView
 * @see ../../api/content.ts
 */
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import { useFrontContentStore } from '@/stores'
import { useAdminPagination } from '@/composables/useAdminPagination'

const route = useRoute()
const router = useRouter()
const frontContentStore = useFrontContentStore()

// 搜索关键词
const keyword = ref('')
// 当前激活的标签页（article/tag）
const activeTab = ref('article')

const { pagination, fetch: fetchArticles } = useAdminPagination({
  fetchFn: frontContentStore.fetchArticles,
  buildParams: () => ({
    keyword: keyword.value.trim() || undefined,
  }),
  defaultSize: frontContentStore.size,
  immediate: false,
})

// 高亮搜索关键词（用于在结果中标记匹配文本）
function highlight(text: string | null | undefined): string {
  if (!text) return ''
  const kw = keyword.value.trim()
  if (!kw) return text
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="search-highlight">$1</mark>')
}

async function doSearch(): Promise<void> {
  if (activeTab.value === 'article') {
    await fetchArticles()
  } else if (activeTab.value === 'tag') {
    await frontContentStore.fetchTags()
  }
}

onMounted(() => {
  keyword.value = (route.query.keyword as string) || ''
  doSearch()
})

watch(
  () => route.query.keyword,
  val => {
    keyword.value = (val as string) || ''
    pagination.current = 1
    doSearch()
  }
)

watch(activeTab, () => {
  pagination.current = 1
  doSearch()
})
</script>

<style scoped>
.search-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.search-bar {
  margin-bottom: 24px;
}

.result-list {
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

.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>

<style>
.search-highlight {
  background-color: #fef08a;
  color: inherit;
  padding: 0 2px;
  border-radius: 2px;
}
</style>
