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
            <h3 class="article-title">{{ item.title }}</h3>
            <p class="article-summary">{{ item.summary }}</p>
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
              {{ t.name }}
            </el-tag>
          </div>
        </div>
        <el-empty v-else description="暂无匹配标签" />
      </el-tab-pane>
    </el-tabs>

    <div v-if="frontContentStore.total > frontContentStore.size" class="pagination-wrap">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="frontContentStore.size"
        :total="frontContentStore.total"
        layout="prev, pager, next"
        @current-change="doSearch"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import { useFrontContentStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const frontContentStore = useFrontContentStore()

const keyword = ref('')
const activeTab = ref('article')
const currentPage = ref(1)

async function doSearch(): Promise<void> {
  const kw = keyword.value.trim()

  if (activeTab.value === 'article') {
    await frontContentStore.fetchArticles({
      keyword: kw || undefined,
      current: currentPage.value,
      size: frontContentStore.size,
    })
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
  (val) => {
    keyword.value = (val as string) || ''
    currentPage.value = 1
    doSearch()
  },
)

watch(activeTab, () => {
  currentPage.value = 1
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
