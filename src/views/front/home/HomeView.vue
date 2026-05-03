<template>
  <div class="home-view">
    <div class="home-container">
      <HomeArticleSection
            :loading="frontContentStore.loading"
            :articles="frontContentStore.articles"
            :total="frontContentStore.total"
            :current="pagination.current"
            :size="pagination.size"
            :sort-options="sortOptions"
            :selected-sort="filters.sort || 'latest'"
            :categories="frontContentStore.categories"
            :selected-category-id="filters.categoryId"
            @sort-change="setSort"
            @page-change="handleCurrentChange"
            @category-change="setCategory"
          />
        </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive } from 'vue'
import { useFrontContentStore } from '@/stores'
import type { PublicArticleQueryRequest } from '@/types/api-types'
import HomeArticleSection from './components/HomeArticleSection.vue'
import type { SortOption } from '@/types/ui'

const frontContentStore = useFrontContentStore()

const filters = reactive<PublicArticleQueryRequest>({
  current: 1,
  size: 9,
  keyword: '',
  categoryId: undefined,
  tagId: undefined,
  sort: 'latest',
})

const pagination = reactive({
  current: 1,
  size: 9,
})

const sortOptions: SortOption[] = [
  { label: '最新发布', value: 'latest' },
  { label: '置顶优先', value: 'top' },
  { label: '热门内容', value: 'hot' },
]

function buildQuery(): PublicArticleQueryRequest {
  return {
    current: pagination.current,
    size: pagination.size,
    keyword: filters.keyword || undefined,
    categoryId: filters.categoryId,
    tagId: filters.tagId,
    sort: filters.sort,
  }
}

async function refreshArticles(): Promise<void> {
  await frontContentStore.fetchArticles(buildQuery())
}

function setCategory(categoryId?: number): void {
  filters.categoryId = categoryId
  pagination.current = 1
  void refreshArticles()
}

function setSort(sort: SortOption['value']): void {
  filters.sort = sort
  pagination.current = 1
  void refreshArticles()
}

function handleCurrentChange(current: number): void {
  pagination.current = current
  void refreshArticles()
}

onMounted(async () => {
  await frontContentStore.initHome(buildQuery())
  pagination.current = frontContentStore.current
  pagination.size = frontContentStore.size
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.home-container {
  width: min(1080px, 100%);
  margin: 0 auto;
  padding: 0 24px 48px;
}

@media (max-width: 768px) {
  .home-container {
    padding: 0 16px 32px;
  }
}
</style>
