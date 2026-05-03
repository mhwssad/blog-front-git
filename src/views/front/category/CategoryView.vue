<template>
  <div class="category-page">
    <div class="category-container">
      <div class="category-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>分类</el-breadcrumb-item>
          <el-breadcrumb-item v-if="categoryName">{{ categoryName }}</el-breadcrumb-item>
        </el-breadcrumb>
        <h1 class="page-title">{{ categoryName ?? '分类文章' }}</h1>
      </div>

      <el-row :gutter="24">
        <el-col :xs="24" :lg="17">
          <div class="article-section">
            <div class="section-header">
              <span class="section-title">{{ categoryName ?? '全部文章' }}</span>
              <el-select v-model="currentSort" size="small" style="width: 120px">
                <el-option label="最新发布" value="latest" />
                <el-option label="置顶优先" value="top" />
                <el-option label="热门内容" value="hot" />
              </el-select>
            </div>

            <!-- 子分类 Tab 切换 -->
            <div v-if="childCategories.length" class="sub-category-tabs">
              <button
                class="sub-tab"
                :class="{ active: selectedChildId === null }"
                @click="selectChild(null)"
              >
                全部
              </button>
              <button
                v-for="child in childCategories"
                :key="child.id"
                class="sub-tab"
                :class="{ active: selectedChildId === child.id }"
                @click="selectChild(child.id)"
              >
                {{ child.name }}
              </button>
            </div>

            <div v-if="store.loading" class="section-loading">
              <el-skeleton :rows="4" animated />
            </div>

            <template v-else-if="store.articles.length">
              <div class="article-grid">
                <HomeArticleCard v-for="article in store.articles" :key="article.id" :article="article" />
              </div>

              <div class="section-pagination">
                <el-pagination
                  v-model:current-page="currentPage"
                  :page-size="pageSize"
                  :total="store.total"
                  layout="prev, pager, next"
                  @current-change="loadArticles"
                />
              </div>
            </template>

            <el-empty v-else description="该分类下暂无文章" />
          </div>
        </el-col>

        <el-col :xs="24" :lg="7">
          <HomeSidebar
            :hot-articles="store.hotArticles"
            :tags="store.tags"
            :comments="store.comments"
            :format-date="formatDate"
          />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFrontContentStore } from '@/stores'
import HomeArticleCard from '../home/components/HomeArticleCard.vue'
import HomeSidebar from '../home/components/HomeSidebar.vue'

interface CategoryNode {
  id: number
  name: string
  children?: CategoryNode[]
}

const route = useRoute()
const store = useFrontContentStore()

const currentSort = ref<'latest' | 'top' | 'hot'>('latest')
const currentPage = ref(1)
const pageSize = 9
const selectedChildId = ref<number | null>(null)

const categoryId = computed(() => Number(route.params.id))
const categoryName = computed(() => {
  if (!categoryId.value) return undefined
  return findCategoryName(store.categories, categoryId.value)
})

const childCategories = computed<CategoryNode[]>(() => {
  if (!categoryId.value) return []
  return findCategoryChildren(store.categories, categoryId.value)
})

function findCategoryName(categories: CategoryNode[], id: number): string | undefined {
  for (const cat of categories) {
    if (cat.id === id) return cat.name
    if (cat.children?.length) {
      const found = findCategoryName(cat.children, id)
      if (found) return found
    }
  }
  return undefined
}

function findCategoryChildren(categories: CategoryNode[], id: number): CategoryNode[] {
  for (const cat of categories) {
    if (cat.id === id) return cat.children ?? []
    if (cat.children?.length) {
      const found = findCategoryChildren(cat.children, id)
      if (found.length) return found
    }
  }
  return []
}

function selectChild(childId: number | null): void {
  selectedChildId.value = childId
  currentPage.value = 1
  loadArticles()
}

async function loadArticles(): Promise<void> {
  const filterCategoryId = selectedChildId.value || categoryId.value
  await store.fetchArticles({
    current: currentPage.value,
    size: pageSize,
    categoryId: filterCategoryId || undefined,
    sort: currentSort.value,
  })
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

watch(currentSort, () => {
  currentPage.value = 1
  loadArticles()
})

watch(() => route.params.id, () => {
  currentPage.value = 1
  selectedChildId.value = null
  loadArticles()
})

onMounted(async () => {
  if (!store.categories.length) {
    await store.fetchCategoryTree()
  }
  await Promise.all([
    loadArticles(),
    store.fetchHotArticles(),
    store.fetchComments({ current: 1, size: 6, targetType: 'article' }),
  ])
})
</script>

<style scoped>
.category-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.category-container {
  width: min(1080px, 100%);
  margin: 0 auto;
  padding: 32px 24px 48px;
}

.category-header {
  margin-bottom: 24px;
}

.page-title {
  margin: 12px 0 0;
  font-size: 24px;
  font-weight: 700;
}

.article-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
}

/* 子分类 Tab */
.sub-category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.sub-tab {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid var(--el-border-color);
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--el-text-color-regular);
}

.sub-tab:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.sub-tab.active {
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: #fff;
}

/* 文章网格布局 */
.article-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.section-loading {
  padding: 16px 0;
}

.section-pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

@media (max-width: 768px) {
  .category-container {
    padding: 16px 16px 32px;
  }

  .article-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1023px) {
  .article-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
