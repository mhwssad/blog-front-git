<template>
  <div class="home-view">
    <div class="home-container">
      <HomeBanner
        :keyword="keyword"
        :loading="frontContentStore.loading"
        :categories="flattenedCategories"
        :selected-category-id="filters.categoryId"
        @update:keyword="keyword = $event"
        @search="handleSearch"
      />

      <el-row :gutter="24">
        <el-col :xs="24" :lg="17">
          <HomeArticleSection
            :loading="frontContentStore.loading"
            :articles="frontContentStore.articles"
            :total="frontContentStore.total"
            :current="pagination.current"
            :size="pagination.size"
            :sort-options="sortOptions"
            :selected-sort="filters.sort || 'latest'"
            @sort-change="setSort"
            @page-change="handleCurrentChange"
          />
        </el-col>

        <el-col :xs="24" :lg="7">
          <HomeSidebar
            :hot-articles="frontContentStore.hotArticles"
            :tags="frontContentStore.tags"
            :comments="frontContentStore.comments"
            :format-date="formatDate"
            @select-tag="setTag"
          />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useFrontContentStore } from '@/stores'
import type { PublicArticleQueryRequest, PublicCategoryTreeVO } from '@/types/api-types'
import HomeArticleSection from './components/HomeArticleSection.vue'
import HomeBanner from './components/HomeBanner.vue'
import HomeSidebar from './components/HomeSidebar.vue'
import type { CategoryOption, SortOption } from './types'

const frontContentStore = useFrontContentStore()

const keyword = ref('')

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

const flattenedCategories = computed(() => {
  const result: CategoryOption[] = []

  function walk(nodes: PublicCategoryTreeVO[], depth = 0): void {
    for (const node of nodes) {
      result.push({
        id: node.id,
        label: `${depth > 0 ? `${'· '.repeat(depth)}` : ''}${node.name}`,
      })
      if (node.children?.length) {
        walk(node.children, depth + 1)
      }
    }
  }

  walk(frontContentStore.categories)
  return result
})

function buildQuery(): PublicArticleQueryRequest {
  return {
    current: pagination.current,
    size: pagination.size,
    keyword: keyword.value.trim() || undefined,
    categoryId: filters.categoryId,
    tagId: filters.tagId,
    sort: filters.sort,
  }
}

async function refreshArticles(): Promise<void> {
  await frontContentStore.fetchArticles(buildQuery())
}

function handleSearch(): void {
  pagination.current = 1
  void refreshArticles()
}

function setSort(sort: SortOption['value']): void {
  filters.sort = sort
  pagination.current = 1
  void refreshArticles()
}

function setTag(tagId?: number): void {
  filters.tagId = tagId
  pagination.current = 1
  void refreshArticles()
}

function handleCurrentChange(current: number): void {
  pagination.current = current
  void refreshArticles()
}

function formatDate(value?: string | null): string {
  if (!value) return '刚刚'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
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
