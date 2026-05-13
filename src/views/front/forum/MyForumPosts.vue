<template>
  <div class="my-forum-posts-page">
    <div class="my-posts-container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/user' }">个人中心</el-breadcrumb-item>
        <el-breadcrumb-item>我的帖子</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="page-header">
        <h1 class="page-title">我的帖子</h1>
        <router-link to="/forum/create">
          <el-button type="primary">发帖</el-button>
        </router-link>
      </div>

      <div class="filter-row">
        <el-input
          v-model="keyword"
          placeholder="搜索帖子"
          clearable
          style="width: 240px"
          @clear="handleFilterChange"
          @keyup.enter="handleFilterChange"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="statusFilter"
          placeholder="状态筛选"
          clearable
          style="width: 140px"
          @change="handleFilterChange"
        >
          <el-option
            v-for="opt in statusOptions"
            :key="opt.label"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>

      <div v-if="store.loading" class="posts-loading">
        <el-skeleton :rows="4" animated />
      </div>

      <template v-else-if="store.posts.length">
        <div class="posts-list">
          <ForumPostCard
            v-for="post in store.posts"
            :key="post.id"
            :post="post"
            show-section
            show-status
            show-actions
            @edit="handleEdit(post.id)"
            @delete="handleDelete(post)"
          />
        </div>

        <div class="posts-pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="store.postTotal"
            background
            layout="prev, pager, next"
            @current-change="loadPosts"
          />
        </div>
      </template>

      <el-empty v-else description="还没有发过帖子" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useUserForumStore } from '@/stores'
import ForumPostCard from './components/ForumPostCard.vue'
import type { ForumPostVO } from '@/types/api-types'

const router = useRouter()
const store = useUserForumStore()

const keyword = ref('')
const statusFilter = ref<number | ''>('')
const currentPage = ref(1)
const pageSize = 10

const statusOptions = [
  { label: '全部', value: '' },
  { label: '草稿', value: 0 },
  { label: '已发布', value: 1 },
] as { label: string; value: number | '' }[]

function loadPosts(): void {
  store.getMyPosts({
    current: currentPage.value,
    size: pageSize,
    keyword: keyword.value || undefined,
    status: statusFilter.value === '' ? undefined : statusFilter.value,
  })
}

function handleFilterChange(): void {
  currentPage.value = 1
  loadPosts()
}

function handleEdit(postId: number): void {
  router.push(`/forum/posts/${postId}/edit`)
}

async function handleDelete(post: ForumPostVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除帖子「${post.title}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const ok = await store.deletePost(post.id)
    if (ok) {
      ElMessage.success('删除成功')
      loadPosts()
    }
  } catch {
    // cancelled
  }
}

onMounted(() => {
  store.fetchSections()
  loadPosts()
})
</script>

<style scoped>
.my-forum-posts-page {
  min-height: 100vh;
  background: var(--el-fill-color-lighter, #f5f5f5);
}

.my-posts-container {
  width: min(900px, 100%);
  margin: 0 auto;
  padding: 32px 24px 48px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.filter-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.posts-loading {
  background: var(--el-bg-color, #fff);
  border-radius: 12px;
  padding: 28px;
}

.posts-pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
}

@media (max-width: 768px) {
  .my-posts-container {
    padding: 16px 16px 32px;
  }

  .filter-row {
    flex-direction: column;
  }

  .filter-row .el-input,
  .filter-row .el-select {
    width: 100% !important;
  }
}
</style>
