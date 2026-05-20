<template>
  <div class="forum-replies-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键词" class="filter-item">
          <el-input
            v-model="searchForm.keyword"
            class="filter-control"
            clearable
            placeholder="请输入回复内容"
          />
        </el-form-item>
        <el-form-item label="帖子ID" class="filter-item">
          <el-input-number
            v-model="searchForm.postId"
            :min="1"
            controls-position="right"
            class="filter-control"
          />
        </el-form-item>
        <el-form-item label="用户ID" class="filter-item">
          <el-input-number
            v-model="searchForm.userId"
            :min="1"
            controls-position="right"
            class="filter-control"
          />
        </el-form-item>
        <el-form-item label="状态" class="filter-item">
          <el-select
            v-model="searchForm.status"
            class="filter-control"
            clearable
            placeholder="全部"
          >
            <el-option label="正常" :value="1" />
            <el-option label="隐藏" :value="2" />
            <el-option label="删除" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button v-permission="'content:forum:query'" type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <DataTable
      class="reply-table"
      title="论坛回复列表"
      :data="forumStore.replies"
      :loading="forumStore.replyLoading"
      :total="forumStore.replyTotal"
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :page-sizes="[10, 20, 50, 100]"
      :pagination-layout="paginationLayout"
      :compact="isCompactTable"
      @page-change="handleCurrentChange"
      @size-change="handleSizeChange"
    >
      <template #header-extra>
        <span class="header-count">{{ forumStore.replyTotal }} 条</span>
        <el-button link type="primary" @click="handleRefresh">
          <el-icon><RefreshRight /></el-icon>
          刷新
        </el-button>
      </template>

      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column label="帖子" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="cell-stack">
            <span>{{ row.postTitle }}</span>
            <span class="cell-subtext">#{{ row.postId }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="回复人" min-width="150" align="center" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="cell-stack">
            <span>{{ row.userName }}</span>
            <span class="cell-subtext">ID: {{ row.userId }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="content"
        label="内容"
        min-width="280"
        show-overflow-tooltip
      />
      <el-table-column label="状态" min-width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getReplyStatusTagType(row.status)" effect="light" size="small">
            {{ row.statusName || getReplyStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="floorNo" label="楼层" min-width="80" align="center" />
      <el-table-column prop="likeCount" label="点赞" min-width="80" align="center" />
      <el-table-column prop="replyCount" label="子回复" min-width="90" align="center" />
      <el-table-column label="创建时间" min-width="170" align="center">
        <template #default="{ row }">
          {{ formatCreatedAt(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" min-width="170" align="center">
        <template #default="{ row }">
          {{ formatUpdatedAt(row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        :min-width="isCompactTable ? 180 : 220"
        :fixed="isCompactTable ? false : 'right'"
        class-name="action-column"
        align="center"
      >
        <template #default="{ row }">
          <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
            <el-button v-permission="'content:forum:query'" link type="primary" @click="handleView(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 2"
              v-permission="'content:forum:update'"
              link
              type="success"
              @click="handleRestore(row)"
            >
              恢复
            </el-button>
            <el-button
              v-else-if="row.status === 1"
              v-permission="'content:forum:update'"
              link
              type="warning"
              @click="handleHide(row)"
            >
              隐藏
            </el-button>
            <el-button
              v-permission="'content:forum:delete'"
              link
              type="danger"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </DataTable>

    <el-dialog v-model="detailVisible" title="回复详情" width="640px" destroy-on-close align-center>
      <el-descriptions v-if="currentReply" :column="1" border>
        <el-descriptions-item label="ID">{{ currentReply.id }}</el-descriptions-item>
        <el-descriptions-item label="帖子">
          {{ currentReply.postTitle }} / #{{ currentReply.postId }}
        </el-descriptions-item>
        <el-descriptions-item label="回复人">
          {{ currentReply.userName }} / #{{ currentReply.userId }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getReplyStatusTagType(currentReply.status)" effect="light">
            {{ currentReply.statusName || getReplyStatusText(currentReply.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="楼层">{{ currentReply.floorNo }}</el-descriptions-item>
        <el-descriptions-item label="点赞">{{ currentReply.likeCount }}</el-descriptions-item>
        <el-descriptions-item label="子回复">{{ currentReply.replyCount }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatCreatedAt(currentReply.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatUpdatedAt(currentReply.updatedAt) }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="detail-section">
        <div class="detail-section__title">回复内容</div>
        <div class="detail-content">{{ currentReply?.content || '-' }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RefreshRight, Search } from '@element-plus/icons-vue'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useAdminPagination } from '@/composables/useAdminPagination'
import { useForumAdminStore } from '@/stores'
import type { ForumReplyAdminQueryRequest, ForumReplyAdminVO } from '@/types/api-types'
import { formatCreatedAt, formatUpdatedAt } from '@/utils'

const forumStore = useForumAdminStore()
const { isCompactTable, paginationLayout } = useContentAdmin()

const searchForm = reactive<ForumReplyAdminQueryRequest>({
  keyword: undefined,
  postId: undefined,
  userId: undefined,
  status: undefined,
})

const {
  pagination,
  fetch: fetchReplies,
  handleSearch,
  handleSizeChange,
  handleCurrentChange,
} = useAdminPagination({
  fetchFn: forumStore.fetchReplies,
  buildParams: () => ({
    keyword: searchForm.keyword?.trim() || undefined,
    postId: searchForm.postId,
    userId: searchForm.userId,
    status: searchForm.status,
  }),
  persistSizeKey: 'forum-replies-page-size',
})

const detailVisible = ref(false)
const currentReply = ref<ForumReplyAdminVO | null>(null)

function getReplyStatusText(value?: number): string {
  switch (value) {
    case 1:
      return '正常'
    case 2:
      return '隐藏'
    case 3:
      return '删除'
    default:
      return '-'
  }
}

function getReplyStatusTagType(value?: number): 'success' | 'warning' | 'danger' | 'info' {
  switch (value) {
    case 1:
      return 'success'
    case 2:
      return 'warning'
    case 3:
      return 'danger'
    default:
      return 'info'
  }
}

function handleRefresh(): Promise<void> {
  return fetchReplies()
}

function handleReset(): void {
  Object.assign(searchForm, {
    keyword: undefined,
    postId: undefined,
    userId: undefined,
    status: undefined,
  })
  void fetchReplies()
}

function handleView(row: ForumReplyAdminVO): void {
  currentReply.value = row
  detailVisible.value = true
}

async function updateReplyAndRefresh(
  action: () => Promise<boolean>,
  successText: string,
  failureText: string,
): Promise<boolean> {
  const success = await action()
  if (!success) {
    ElMessage.error(failureText)
    return false
  }

  ElMessage.success(successText)
  await fetchReplies()
  return true
}

async function handleHide(row: ForumReplyAdminVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要隐藏回复 #${row.id} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await updateReplyAndRefresh(() => forumStore.hideReply(row.id), '回复已隐藏', '回复隐藏失败')
  } catch {
    // cancelled or failed
  }
}

async function handleRestore(row: ForumReplyAdminVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要恢复回复 #${row.id} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await updateReplyAndRefresh(() => forumStore.restoreReply(row.id), '回复已恢复', '回复恢复失败')
  } catch {
    // cancelled or failed
  }
}

async function handleDelete(row: ForumReplyAdminVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除回复 #${row.id} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await updateReplyAndRefresh(() => forumStore.deleteReply(row.id), '回复删除成功', '回复删除失败')
  } catch {
    // cancelled or failed
  }
}
</script>

<style scoped>
.forum-replies-page {
  padding: 0;
  max-width: 1680px;
  margin: 0 auto;
}

.search-card {
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px 0;
}

.search-card :deep(.el-form-item) {
  margin-bottom: 0;
}

.filter-item {
  margin-right: 16px;
}

.filter-control {
  width: 220px;
}

.search-actions {
  margin-left: 0;
  margin-right: 0;
}

.reply-table {
  width: 100%;
}

.reply-table :deep(.el-table__cell .cell) {
  text-align: center;
}

.reply-table :deep(.action-column) {
  border-left: 2px solid var(--el-border-color);
}

.table-actions {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px 8px;
}

.table-actions--compact {
  flex-direction: column;
  align-items: center;
}

.table-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

.cell-stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cell-subtext {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.2;
}

.detail-section {
  margin-top: 20px;
}

.detail-section__title {
  margin-bottom: 10px;
  font-weight: 500;
}

.detail-content {
  white-space: pre-wrap;
  line-height: 1.8;
  color: var(--el-text-color-primary);
  padding: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
}

@media (max-width: 768px) {
  .filter-item,
  .search-actions {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
  }

  .filter-control {
    width: 100%;
  }

  .search-actions :deep(.el-form-item__content) {
    width: 100%;
    justify-content: center;
  }
}
</style>
