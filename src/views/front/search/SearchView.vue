<template>
  <div class="search-page">
    <div class="search-bar">
      <el-input v-model="keyword" placeholder="搜索文章、用户、标签..." size="large" clearable @keyup.enter="doSearch">
        <template #append>
          <el-button @click="doSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="文章" name="article">
        <div v-if="articleList.length" class="result-list">
          <div v-for="item in articleList" :key="item.id" class="article-card" @click="router.push(`/articles/${item.id}`)">
            <h3 class="article-title">{{ item.title }}</h3>
            <p class="article-summary">{{ item.summary }}</p>
            <div class="article-meta">
              <span>{{ item.author }}</span>
              <span>{{ item.createTime }}</span>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无匹配文章" />
      </el-tab-pane>

      <el-tab-pane label="用户" name="user">
        <div v-if="userList.length" class="user-grid">
          <div v-for="u in userList" :key="u.id" class="user-card">
            <el-avatar :size="48" :src="u.avatar">{{ u.nickname[0] }}</el-avatar>
            <div class="user-info">
              <div class="user-nick">{{ u.nickname }}</div>
              <div class="user-bio">{{ u.bio }}</div>
            </div>
            <el-button size="small" type="primary" plain>关注</el-button>
          </div>
        </div>
        <el-empty v-else description="暂无匹配用户" />
      </el-tab-pane>

      <el-tab-pane label="标签" name="tag">
        <div v-if="tagList.length" class="tag-grid">
          <div v-for="t in tagList" :key="t.id" class="tag-item">
            <el-tag size="large" effect="plain">{{ t.name }}</el-tag>
            <span class="tag-count">{{ t.articleCount }} 篇文章</span>
          </div>
        </div>
        <el-empty v-else description="暂无匹配标签" />
      </el-tab-pane>
    </el-tabs>

    <div v-if="total > pageSize" class="pagination-wrap">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="doSearch"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface ArticleItem { id: number; title: string; summary: string; author: string; createTime: string }
interface UserItem { id: number; nickname: string; avatar: string; bio: string }
interface TagItem { id: number; name: string; articleCount: number }

const route = useRoute()
const router = useRouter()

const keyword = ref('')
const activeTab = ref('article')
const currentPage = ref(1)
const pageSize = 10
const total = ref(0)

const articleList = ref<ArticleItem[]>([])
const userList = ref<UserItem[]>([])
const tagList = ref<TagItem[]>([])

function doSearch(): void {
  // Mock
  if (keyword.value.trim()) {
    articleList.value = [
      { id: 1, title: `关于「${keyword.value}」的深入探讨`, summary: '这是一篇关于该主题的详细文章...', author: '技术博主', createTime: '2025-01-15' },
      { id: 2, title: `${keyword.value} 入门指南`, summary: '从零开始学习...', author: '新手向导', createTime: '2025-01-10' },
    ]
    userList.value = [
      { id: 1, nickname: '测试用户', avatar: '', bio: '热爱分享技术' },
    ]
    tagList.value = [
      { id: 1, name: keyword.value, articleCount: 42 },
    ]
    total.value = 2
  } else {
    articleList.value = []
    userList.value = []
    tagList.value = []
    total.value = 0
  }
}

onMounted(() => {
  keyword.value = (route.query.keyword as string) || ''
  doSearch()
})

watch(() => route.query.keyword, (val) => {
  keyword.value = (val as string) || ''
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

.user-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.user-info {
  flex: 1;
}

.user-nick {
  font-size: 15px;
  font-weight: 600;
}

.user-bio {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
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

.tag-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
