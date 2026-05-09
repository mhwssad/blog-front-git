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
/**
 * 首页视图
 * @description 展示文章列表、分类筛选、排序选项等内容
 * @module front/home
 * @see ../api/front/article.ts
 */
import { onMounted, reactive } from 'vue'
import { useFrontContentStore } from '@/stores'
import type { PublicArticleQueryRequest } from '@/types/api-types'
import HomeArticleSection from './components/HomeArticleSection.vue'
import type { SortOption } from '@/types/ui'

const frontContentStore = useFrontContentStore()

const filters = reactive<PublicArticleQueryRequest>({
  // 筛选条件：分页、关键词、分类、标签、排序
  current: 1,
  size: 9,
  keyword: '',
  categoryId: undefined,
  tagId: undefined,
  sort: 'latest',
})

// 分页状态（独立于filters，便于管理）
const pagination = reactive({
  current: 1,
  size: 9,
})

// 排序选项配置
const sortOptions: SortOption[] = [
  { label: '最新发布', value: 'latest' },
  { label: '置顶优先', value: 'top' },
  { label: '热门内容', value: 'hot' },
]

/**
 * 构建查询参数
 * @returns PublicArticleQueryRequest - 分页、筛选参数对象
 */
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

/**
 * 刷新文章列表
 */
async function refreshArticles(): Promise<void> {
  await frontContentStore.fetchArticles(buildQuery())
}

/**
 * 设置分类筛选
 * @param categoryId - 选中的分类ID，undefined 表示全部
 */
function setCategory(categoryId?: number): void {
  filters.categoryId = categoryId
  pagination.current = 1 // 切换分类时重置到第一页
  void refreshArticles()
}

/**
 * 设置排序方式
 * @param sort - 排序值（latest/top/hot）
 */
function setSort(sort: SortOption['value']): void {
  filters.sort = sort
  pagination.current = 1 // 切换排序时重置到第一页
  void refreshArticles()
}

/**
 * 处理页码变化
 * @param current - 新的页码
 */
function handleCurrentChange(current: number): void {
  pagination.current = current
  void refreshArticles()
}

// 初始化：加载首页内容并同步分页状态
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
