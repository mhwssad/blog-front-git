<template>
  <div class="comment-management-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="目标类型" class="filter-item">
          <el-select v-model="searchForm.targetType" class="filter-control" clearable placeholder="请选择类型">
            <el-option
              v-for="option in targetTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
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
        <el-form-item label="状态" class="filter-item">
          <el-select v-model="searchForm.status" class="filter-control" clearable placeholder="请选择状态">
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button v-permission="'content:comment:query'" type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>评论列表</span>
          <div class="card-header__actions">
            <span class="card-header__count">{{ commentStore.total }} 条评论</span>
            <el-button v-permission="'content:comment:query'" @click="fetchComments">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <div ref="tableWrapperRef" class="table-wrapper">
        <el-table
          v-loading="commentStore.loading"
          :data="commentStore.comments"
          :height="tableHeight"
          :size="isCompactTable ? 'small' : 'default'"
          :row-key="row => row.id"
          border
          stripe
          table-layout="auto"
          class="comment-table"
        >
          <el-table-column v-if="isCompactTable" label="评论信息" min-width="360" align="center">
            <template #default="{ row }">
              <div class="comment-summary">
                <div class="comment-summary__header">
                  <span class="comment-summary__id">#{{ row.id }}</span>
                  <el-tag size="small" effect="plain">{{ formatTargetType(row.targetType) }}</el-tag>
                </div>
                <div class="comment-summary__meta">
                  <span>{{ row.userNickname || '匿名用户' }}</span>
                  <span>用户 ID {{ row.userId }}</span>
                  <span>{{ formatCommentStatus(row.status) }}</span>
                </div>
                <div class="comment-summary__content">{{ row.content }}</div>
                <div class="comment-summary__meta">
                  <span>目标 ID {{ row.targetId }}</span>
                  <span>{{ formatRelationInfo(row) }}</span>
                </div>
                <div class="comment-summary__meta">
                  <span>点赞 {{ row.likeCount }}</span>
                  <span>回复 {{ row.replyCount }}</span>
                  <span>{{ formatCreatedAt(row.createdAt) }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="!isCompactTable" prop="id" label="评论 ID" min-width="110" align="center" />
          <el-table-column v-if="!isCompactTable" label="用户信息" min-width="180" align="center">
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
          <el-table-column v-if="!isCompactTable" label="目标信息" min-width="160" align="center">
            <template #default="{ row }">
              <div class="target-cell">
                <el-tag size="small" effect="plain">{{ formatTargetType(row.targetType) }}</el-tag>
                <span>目标 ID {{ row.targetId }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="!isCompactTable"
            prop="content"
            label="评论内容"
            min-width="320"
            align="left"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <div class="content-cell">
                <p class="content-cell__text">{{ row.content }}</p>
                <div class="content-cell__meta">
                  <span>{{ formatRelationInfo(row) }}</span>
                  <span v-if="row.images?.length">图片 {{ row.images.length }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="!isCompactTable" label="互动" min-width="120" align="center">
            <template #default="{ row }">
              <div class="metric-cell">
                <span>点赞 {{ row.likeCount }}</span>
                <span>回复 {{ row.replyCount }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="!isCompactTable" label="状态" min-width="160" align="center">
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
          <el-table-column v-if="!isCompactTable" label="创建时间" min-width="180" align="center">
            <template #default="{ row }">
              {{ formatCreatedAt(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" :min-width="isCompactTable ? 140 : 180" align="center">
            <template #default="{ row }">
              <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
                <el-button
                  v-permission="'content:comment:query'"
                  link
                  type="primary"
                  @click="openDetailDialog(row)"
                >
                  查看详情
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
        </el-table>
      </div>

      <div ref="paginationRef" class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          :layout="paginationLayout"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <CommentDetailDialog
      v-model:visible="detailDialogVisible"
      :comment="commentStore.currentComment"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search } from '@element-plus/icons-vue'
import { useCommentStore } from '@/stores'
import { useContentAdmin } from '@/composables/useContentAdmin'
import type { CommentQueryRequest, CommentVO } from '@/types/api-types'
import {
  COMMENT_STATUS_OPTIONS,
  TARGET_TYPE_OPTIONS,
  formatCommentStatus,
  formatCreatedAt,
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

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const detailDialogVisible = ref(false)
const { tableWrapperRef, paginationRef, tableHeight, paginationLayout, isCompactTable, updateTableHeight } =
  useContentAdmin({
    minHeight: 360,
    bottomOffset: 28,
  })

const targetTypeOptions = TARGET_TYPE_OPTIONS
const statusOptions = COMMENT_STATUS_OPTIONS

function formatRelationInfo(row: CommentVO): string {
  const rootText = row.rootId ? `根 ${row.rootId}` : '根 -'
  const parentText = row.parentId ? `父 ${row.parentId}` : '父 -'
  return `${rootText} / ${parentText}`
}

function resetNumberField(field: keyof Pick<CommentSearchForm, 'targetId' | 'userId' | 'rootId' | 'parentId'>): void {
  searchForm[field] = undefined
}

watch(
  () => searchForm.targetId,
  value => {
    if (value === null) {
      resetNumberField('targetId')
    }
  }
)

watch(
  () => searchForm.userId,
  value => {
    if (value === null) {
      resetNumberField('userId')
    }
  }
)

watch(
  () => searchForm.rootId,
  value => {
    if (value === null) {
      resetNumberField('rootId')
    }
  }
)

watch(
  () => searchForm.parentId,
  value => {
    if (value === null) {
      resetNumberField('parentId')
    }
  }
)

function normalizeNumber(value?: number | null): number | undefined {
  if (value === undefined || value === null) {
    return undefined
  }

  return Number.isNaN(value) ? undefined : value
}

function buildQueryParams(): CommentQueryRequest {
  const params: CommentQueryRequest = {
    current: pagination.current,
    size: pagination.size,
  }

  const targetId = normalizeNumber(searchForm.targetId)
  if (targetId !== undefined) {
    params.targetId = targetId
  }

  const userId = normalizeNumber(searchForm.userId)
  if (userId !== undefined) {
    params.userId = userId
  }

  const rootId = normalizeNumber(searchForm.rootId)
  if (rootId !== undefined) {
    params.rootId = rootId
  }

  const parentId = normalizeNumber(searchForm.parentId)
  if (parentId !== undefined) {
    params.parentId = parentId
  }

  if (searchForm.targetType) {
    params.targetType = searchForm.targetType
  }

  if (searchForm.status !== undefined && searchForm.status !== null) {
    params.status = searchForm.status
  }

  return params
}

async function fetchComments(): Promise<void> {
  try {
    const params = buildQueryParams()
    await commentStore.fetchComments(params)
    pagination.total = commentStore.total
    pagination.current = commentStore.current
    pagination.size = commentStore.size
  } catch {
    ElMessage.error('获取评论列表失败')
  } finally {
    void updateTableHeight()
  }
}

function handleSearch(): void {
  pagination.current = 1
  void fetchComments()
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

function handleSizeChange(size: number): void {
  if (pagination.size === size) {
    return
  }

  pagination.size = size
  pagination.current = 1
  void fetchComments()
}

function handleCurrentChange(current: number): void {
  pagination.current = current
  void fetchComments()
}

async function openDetailDialog(row: CommentVO): Promise<void> {
  const detail = await commentStore.fetchCommentById(row.id)
  if (!detail) {
    ElMessage.error('加载评论详情失败')
    return
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
    await ElMessageBox.confirm(
      `确定要删除评论 #${row.id} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const success = await commentStore.deleteComment(row.id)
    if (success) {
      ElMessage.success('删除成功')
      void fetchComments()
    } else {
      ElMessage.error('删除失败')
    }
  } catch {
    // 用户取消或弹窗抛出
  }
}

watch(detailDialogVisible, visible => {
  if (!visible) {
    commentStore.currentComment = null
  }
})

onMounted(() => {
  void fetchComments()
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
  width: 100%;
}

.filter-item {
  margin-right: 16px;
  margin-bottom: 12px;
}

.filter-control {
  width: 180px;
}

.filter-control :deep(.el-input-number) {
  width: 100%;
}

.search-actions {
  margin-left: auto;
  gap: 12px;
}

.table-card {
  min-height: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 500;
}

.card-header__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
}

.card-header__count {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.table-wrapper {
  min-height: 0;
}

.comment-table {
  width: 100%;
  table-layout: auto;
}

.comment-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.comment-summary__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.comment-summary__id {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.comment-summary__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.comment-summary__content {
  color: var(--el-text-color-primary);
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}

.user-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
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

.target-cell,
.metric-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.content-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.content-cell__text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  color: var(--el-text-color-primary);
}

.content-cell__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.table-actions {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px 10px;
}

.table-actions--compact {
  flex-direction: column;
}

.table-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

@media (max-width: 1200px) {
  .filter-control {
    width: 160px;
  }
}

@media (max-width: 768px) {
  .search-form {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item {
    margin-right: 0;
    width: 100%;
  }

  .filter-item :deep(.el-form-item__content) {
    flex: 1;
  }

  .filter-control {
    width: 100%;
  }

  .search-actions {
    margin-left: 0;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .card-header__actions {
    justify-content: space-between;
  }

  .pagination {
    justify-content: center;
  }
}
</style>
