<template>
  <div class="comment-management-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="目标类型" class="filter-item">
          <el-select
            v-model="searchForm.targetType"
            class="filter-control"
            clearable
            placeholder="请选择类型"
          >
            <el-option
              v-for="option in targetTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" class="filter-item">
          <el-select
            v-model="searchForm.status"
            class="filter-control"
            clearable
            placeholder="请选择状态"
          >
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <template v-if="searchExpanded">
          <el-form-item label="目标 ID" class="filter-item">
            <el-input-number
              v-model="searchForm.targetId"
              :min="1"
              class="filter-control"
              controls-position="right"
              placeholder="请输入目标 ID"
            />
          </el-form-item>
          <el-form-item label="用户 ID" class="filter-item">
            <el-input-number
              v-model="searchForm.userId"
              :min="1"
              class="filter-control"
              controls-position="right"
              placeholder="请输入用户 ID"
            />
          </el-form-item>
          <el-form-item label="根评论 ID" class="filter-item">
            <el-input-number
              v-model="searchForm.rootId"
              :min="1"
              class="filter-control"
              controls-position="right"
              placeholder="请输入根评论 ID"
            />
          </el-form-item>
          <el-form-item label="父评论 ID" class="filter-item">
            <el-input-number
              v-model="searchForm.parentId"
              :min="1"
              class="filter-control"
              controls-position="right"
              placeholder="请输入父评论 ID"
            />
          </el-form-item>
        </template>
        <el-form-item class="search-actions">
          <el-button v-permission="'content:comment:query'" type="primary" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button link type="primary" @click="searchExpanded = !searchExpanded">
            {{ searchExpanded ? '收起' : '更多' }}
            <el-icon class="expand-icon" :class="{ 'is-expanded': searchExpanded }">
              <ArrowDown />
            </el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <DataTable
      title="评论列表"
      :data="commentStore.comments"
      :loading="commentStore.loading"
      :total="commentStore.total"
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :page-sizes="[10, 20, 50, 100]"
      :pagination-layout="paginationLayout"
      row-key="id"
      @page-change="handleCurrentChange"
      @size-change="handleSizeChange"
    >
      <template #header-extra>
        <span class="header-count">{{ commentStore.total }} 条评论</span>
        <el-button v-permission="'content:comment:query'" @click="fetchComments">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </template>
        <el-table-column label="用户" min-width="160" align="center">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar v-if="row.userAvatar" :src="row.userAvatar" size="small" />
              <div class="user-cell__content">
                <span class="user-cell__name">{{ row.userNickname || '匿名用户' }}</span>
                <span class="user-cell__id">ID {{ row.userId }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="content"
          label="评论内容"
          min-width="280"
          align="left"
          show-overflow-tooltip
        />
        <el-table-column label="目标" min-width="130" align="center">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ formatTargetType(row.targetType) }}</el-tag>
            <span style="margin-left: 4px; color: var(--el-text-color-secondary)">ID {{ row.targetId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="150" align="center">
          <template #default="{ row }">
            <el-switch
              v-permission.disable="'content:comment:update'"
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              :active-text="formatCommentStatus(1)"
              :inactive-text="formatCommentStatus(0)"
              inline-prompt
              @change="value => handleStatusChange(row, Number(value))"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button
                v-permission="'content:comment:query'"
                link
                type="primary"
                @click="openDetailDialog(row)"
              >
                详情
              </el-button>
              <el-button
                v-permission="'content:comment:delete'"
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

    <CommentDetailDialog
      v-model:visible="detailDialogVisible"
      :comment="commentStore.currentComment"
      :parent-comment="parentComment"
    />
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, ArrowDown } from '@element-plus/icons-vue'
import { useCommentStore } from '@/stores'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useAdminPagination } from '@/composables/useAdminPagination'
import type { CommentVO } from '@/types/api-types'
import {
  COMMENT_STATUS_OPTIONS,
  TARGET_TYPE_OPTIONS,
  formatCommentStatus,
  formatTargetType,
} from '@/utils'
import CommentDetailDialog from './components/CommentDetailDialog.vue'
import type { CommentSearchForm } from '@/types/ui'

const commentStore = useCommentStore()

const searchForm = reactive<CommentSearchForm>({
  targetId: undefined,
  targetType: undefined,
  userId: undefined,
  rootId: undefined,
  parentId: undefined,
  status: undefined,
})

const searchExpanded = ref(false)

const { pagination, fetch: fetchComments, handleSearch, handleSizeChange, handleCurrentChange } = useAdminPagination({
  fetchFn: commentStore.fetchComments,
  buildParams: () => {
    const params: Record<string, unknown> = {}
    const targetId = normalizeNumber(searchForm.targetId)
    if (targetId !== undefined) params.targetId = targetId
    const userId = normalizeNumber(searchForm.userId)
    if (userId !== undefined) params.userId = userId
    const rootId = normalizeNumber(searchForm.rootId)
    if (rootId !== undefined) params.rootId = rootId
    const parentId = normalizeNumber(searchForm.parentId)
    if (parentId !== undefined) params.parentId = parentId
    if (searchForm.targetType) params.targetType = searchForm.targetType
    if (searchForm.status !== undefined && searchForm.status !== null) params.status = searchForm.status
    return params
  },
  persistSizeKey: 'comment-page-size',
})

const detailDialogVisible = ref(false)
const parentComment = ref<CommentVO | null>(null)
const { paginationLayout } = useContentAdmin()

const targetTypeOptions = TARGET_TYPE_OPTIONS
const statusOptions = COMMENT_STATUS_OPTIONS

function resetNumberField(
  field: keyof Pick<CommentSearchForm, 'targetId' | 'userId' | 'rootId' | 'parentId'>
): void {
  searchForm[field] = undefined
}

watch(
  () => searchForm.targetId,
  value => {
    if (value === null) resetNumberField('targetId')
  }
)

watch(
  () => searchForm.userId,
  value => {
    if (value === null) resetNumberField('userId')
  }
)

watch(
  () => searchForm.rootId,
  value => {
    if (value === null) resetNumberField('rootId')
  }
)

watch(
  () => searchForm.parentId,
  value => {
    if (value === null) resetNumberField('parentId')
  }
)

function normalizeNumber(value?: number | null): number | undefined {
  if (value === undefined || value === null) return undefined
  return Number.isNaN(value) ? undefined : value
}

function handleReset(): void {
  searchForm.targetId = undefined
  searchForm.targetType = undefined
  searchForm.userId = undefined
  searchForm.rootId = undefined
  searchForm.parentId = undefined
  searchForm.status = undefined
  pagination.current = 1
  pagination.size = 10
  void fetchComments()
}

async function openDetailDialog(row: CommentVO): Promise<void> {
  const detail = await commentStore.fetchCommentById(row.id)
  if (!detail) {
    ElMessage.error('加载评论详情失败')
    return
  }

  parentComment.value = null
  if (detail.parentId) {
    parentComment.value = await commentStore.fetchCommentById(detail.parentId)
  }

  detailDialogVisible.value = true
}

async function handleStatusChange(row: CommentVO, value: number): Promise<void> {
  const previousStatus = value === 1 ? 0 : 1
  const success = await commentStore.updateCommentStatus(row.id, { status: value })
  if (success) {
    ElMessage.success('状态更新成功')
  } else {
    row.status = previousStatus
    ElMessage.error('状态更新失败')
  }
}

async function handleDelete(row: CommentVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除评论 #${row.id} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await commentStore.deleteComment(row.id)
    if (success) {
      ElMessage.success('删除成功')
      void fetchComments()
    } else {
      ElMessage.error('删除失败')
    }
  } catch {
    // user cancelled
  }
}

watch(detailDialogVisible, visible => {
  if (!visible) {
    commentStore.currentComment = null
    parentComment.value = null
  }
})

</script>

<style scoped>
.comment-management-page {
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
  gap: 12px 16px;
}

.filter-item {
  margin-bottom: 0;
}

.filter-control {
  width: 180px;
}

.expand-icon {
  transition: transform 0.2s;
}

.expand-icon.is-expanded {
  transform: rotate(180deg);
}

.search-actions {
  margin-left: auto;
}

.header-count {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.comment-table {
  width: 100%;
}

.user-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.user-cell__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.user-cell__name {
  color: var(--el-text-color-primary);
}

.user-cell__id {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.table-actions {
  display: inline-flex;
  justify-content: center;
  gap: 4px 8px;
}

.table-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

@media (max-width: 768px) {
  .filter-control {
    width: 160px;
  }
}
</style>
