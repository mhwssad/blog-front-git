<template>
  <div class="home-view">
    <HomeHeroSection
      v-model:keyword="keyword"
      :loading="frontContentStore.loading"
      :is-logged-in="authStore.isLoggedIn"
      :article-total="frontContentStore.total"
      :category-total="flattenedCategories.length"
      :tag-total="frontContentStore.tags.length"
      :comment-total="frontContentStore.comments.length"
      :featured-article="featuredArticle"
      @search="handleSearch"
      @browse="scrollToArticles"
      @entry="goEntry"
    />

    <main class="content-shell">
      <HomeFeaturedSection :articles="frontContentStore.featuredArticles" />

      <el-row :gutter="24" class="content-grid">
        <el-col :xs="24" :xl="17">
          <section ref="articlesSectionRef">
            <HomeArticleSection
              :loading="frontContentStore.loading"
              :articles="frontContentStore.articles"
              :total="frontContentStore.total"
              :current="pagination.current"
              :size="pagination.size"
              :sort-options="sortOptions"
              :selected-sort="filters.sort || 'latest'"
              :selected-category-id="filters.categoryId"
              :selected-tag-id="filters.tagId"
              :categories="flattenedCategories"
              :tags="frontContentStore.tags"
              @sort-change="setSort"
              @select-category="setCategory"
              @select-tag="setTag"
              @size-change="handleSizeChange"
              @page-change="handleCurrentChange"
            />
          </section>
        </el-col>

        <el-col :xs="24" :xl="7">
          <HomeSidebar
            :hot-articles="frontContentStore.hotArticles"
            :categories="frontContentStore.categories"
            :tags="frontContentStore.tags"
            :comments="frontContentStore.comments"
            :format-date="formatDate"
            @select-category="setCategory"
            @select-tag="setTag"
          />
        </el-col>
      </el-row>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useFrontContentStore } from '@/stores'
import type { PublicArticleQueryRequest, PublicCategoryTreeVO } from '@/api/types'
import HomeArticleSection from './components/HomeArticleSection.vue'
import HomeFeaturedSection from './components/HomeFeaturedSection.vue'
import HomeHeroSection from './components/HomeHeroSection.vue'
import HomeSidebar from './components/HomeSidebar.vue'
import type { CategoryOption, SortOption } from './types'

const router = useRouter()
const authStore = useAuthStore()
const frontContentStore = useFrontContentStore()
const articlesSectionRef = ref<HTMLElement | null>(null)
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

const featuredArticle = computed(() => frontContentStore.featuredArticles[0] ?? null)

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
  filters.keyword = keyword.value
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

function setCategory(categoryId?: number): void {
  filters.categoryId = categoryId
  pagination.current = 1
  void refreshArticles()
}

function setTag(tagId?: number): void {
  filters.tagId = tagId
  pagination.current = 1
  void refreshArticles()
}

function handleSizeChange(size: number): void {
  pagination.size = size
  pagination.current = 1
  void refreshArticles()
}

function handleCurrentChange(current: number): void {
  pagination.current = current
  void refreshArticles()
}

function goEntry(): void {
  router.push(authStore.isLoggedIn ? '/admin' : '/login')
}

function scrollToArticles(): void {
  articlesSectionRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

function formatDate(value?: string | null): string {
  if (!value) {
    return '刚刚'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

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
  background:
    radial-gradient(circle at top, rgba(191, 219, 254, 0.42), transparent 24%),
    linear-gradient(180deg, #f7fbff 0%, #f8fafc 42%, #fffaf4 100%);
}

.content-shell {
  width: min(1280px, 100%);
  margin: 0 auto;
  padding: 16px 32px 48px;
}

.content-grid {
  margin-top: 24px;
}

@media (max-width: 900px) {
  .content-shell {
    padding-right: 20px;
    padding-left: 20px;
  }
}
</style>
