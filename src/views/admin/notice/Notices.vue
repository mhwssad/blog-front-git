<template>
  <div class="notice-management-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="通知标题" class="filter-item">
          <el-input v-model="searchForm.title" class="filter-control" clearable placeholder="请输入通知标题" />
        </el-form-item>
        <el-form-item label="通知类型" class="filter-item">
          <el-select v-model="searchForm.type" class="filter-control" clearable placeholder="请选择通知类型">
            <el-option
              v-for="option in NOTICE_TYPE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="通知状态" class="filter-item">
          <el-select v-model="searchForm.publishStatus" class="filter-control" clearable placeholder="请选择通知状态">
            <el-option
              v-for="option in NOTICE_STATUS_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button v-permission="'sys:notice:query'" type="primary" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>通知列表</span>
          <el-button v-permission="'sys:notice:create'" type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增通知
          </el-button>
        </div>
      </template>

      <div ref="tableWrapperRef" class="table-wrapper">
        <el-table
          v-loading="noticeStore.loading"
          :data="noticeStore.notices"
          :height="tableHeight"
          :size="isCompactTable ? 'small' : 'default'"
          table-layout="auto"
          class="notice-table"
          border
          stripe
        >
          <el-table-column prop="id" label="ID" min-width="80" align="center" />
          <el-table-column prop="title" label="通知标题" min-width="220" align="center" show-overflow-tooltip />
          <el-table-column label="通知类型" min-width="120" align="center">
            <template #default="{ row }">
              {{ formatNoticeType(row.type) }}
            </template>
          </el-table-column>
          <el-table-column label="通知状态" min-width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getNoticeStatusTagType(row.status)" effect="light">
                {{ formatNoticeStatus(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="通知内容" min-width="260" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatNoticePreview(row.content) }}
            </template>
          </el-table-column>
          <el-table-column label="发布时间" min-width="180" align="center">
            <template #default="{ row }">
              {{ formatSystemDate(row.publishTime) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" min-width="180" align="center">
            <template #default="{ row }">
              {{ formatCreateTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            :min-width="isCompactTable ? 180 : 280"
            :fixed="isCompactTable ? false : 'right'"
            align="center"
          >
            <template #default="{ row }">
              <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
                <el-button v-permission="'sys:notice:query'" link type="primary" @click="handleViewDetail(row)">
                  详情
                </el-button>
                <el-button
                  v-if="canEditNotice(row.status)"
                  v-permission="'sys:notice:update'"
                  link
                  type="primary"
                  @click="handleEdit(row)"
                >
                  编辑
                </el-button>
                <el-button
                  v-if="canPublishNotice(row.status)"
                  v-permission="'sys:notice:publish'"
                  link
                  type="success"
                  @click="handlePublish(row)"
                >
                  发布
                </el-button>
                <el-button
                  v-if="canRevokeNotice(row.status)"
                  v-permission="'sys:notice:revoke'"
                  link
                  type="warning"
                  @click="handleRevoke(row)"
                >
                  撤回
                </el-button>
                <el-button v-permission="'sys:notice:delete'" link type="danger" @click="handleDelete(row)">
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
          :total="noticeStore.total"
          :page-sizes="[10, 20, 50, 100]"
          :layout="paginationLayout"
          :small="isCompactTable"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <NoticeFormDialog v-model:visible="formDialogVisible" :notice-id="editingNoticeId" @success="handleFormSuccess" />

    <NoticeDetailDialog v-model:visible="detailDialogVisible" :notice="currentNotice" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { NoticeQueryRequest, SysNoticeAdminVO } from '@/types/api-types'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useNoticeStore } from '@/stores'
import {
  NOTICE_STATUS_OPTIONS,
  NOTICE_TYPE_OPTIONS,
  formatCreateTime,
  formatNoticeStatus,
  formatNoticeType,
  formatSystemDate,
} from '@/utils'
import NoticeDetailDialog from './components/NoticeDetailDialog.vue'
import NoticeFormDialog from './components/NoticeFormDialog.vue'

const noticeStore = useNoticeStore()

const searchForm = reactive<NoticeQueryRequest>({
  current: 1,
  size: 10,
  title: undefined,
  type: undefined,
  publishStatus: undefined,
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const formDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const editingNoticeId = ref<number | null>(null)
const currentNotice = ref<SysNoticeAdminVO | null>(null)

const { tableWrapperRef, paginationRef, tableHeight, isCompactTable, paginationLayout } =
  useContentAdmin({
    minHeight: 360,
    bottomOffset: 16,
  })

function getNoticeStatusTagType(status: number): 'info' | 'success' | 'warning' {
  const normalizedStatus = normalizeNoticeStatus(status)

  if (normalizedStatus === 1) {
    return 'success'
  }
  if (normalizedStatus === 2) {
    return 'warning'
  }
  return 'info'
}

function normalizeNoticeStatus(status: number | string | null | undefined): number | null {
  if (status === null || status === undefined || status === '') {
    return null
  }

  const normalized = Number(status)
  return Number.isNaN(normalized) ? null : normalized
}

function canEditNotice(status: number | string | null | undefined): boolean {
  return normalizeNoticeStatus(status) !== 1
}

function canPublishNotice(status: number | string | null | undefined): boolean {
  return normalizeNoticeStatus(status) !== 1
}

function canRevokeNotice(status: number | string | null | undefined): boolean {
  return normalizeNoticeStatus(status) === 1
}

function formatNoticePreview(value: string): string {
  if (!value) {
    return '-'
  }

  return value.length > 48 ? `${value.slice(0, 48)}...` : value
}

async function fetchNotices(): Promise<void> {
  try {
    await noticeStore.fetchNotices({
      ...searchForm,
      current: pagination.current,
      size: pagination.size,
    })
  } catch {
    ElMessage.error('获取通知列表失败')
  }
}

function handleSearch(): void {
  pagination.current = 1
  void fetchNotices()
}

function handleReset(): void {
  Object.assign(searchForm, {
    current: 1,
    size: 10,
    title: undefined,
    type: undefined,
    status: undefined,
  })
  pagination.current = 1
  pagination.size = 10
  void fetchNotices()
}

function handleSizeChange(size: number): void {
  pagination.size = size
  pagination.current = 1
  void fetchNotices()
}

function handleCurrentChange(current: number): void {
  pagination.current = current
  void fetchNotices()
}

function handleAdd(): void {
  editingNoticeId.value = null
  formDialogVisible.value = true
}

function handleEdit(row: SysNoticeAdminVO): void {
  editingNoticeId.value = row.id
  formDialogVisible.value = true
}

async function handleViewDetail(row: SysNoticeAdminVO): Promise<void> {
  const detail = await noticeStore.fetchNoticeById(row.id)
  if (!detail) {
    ElMessage.error('获取通知详情失败')
    return
  }

  currentNotice.value = detail
  detailDialogVisible.value = true
}

async function handlePublish(row: SysNoticeAdminVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要发布通知 "${row.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await noticeStore.publishNotice(row.id)
    if (!success) {
      throw new Error('publish failed')
    }

    ElMessage.success('通知发布成功')
    void fetchNotices()
  } catch {
    // 用户取消或发布失败
  }
}

async function handleRevoke(row: SysNoticeAdminVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要撤回通知 "${row.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await noticeStore.revokeNotice(row.id)
    if (!success) {
      throw new Error('revoke failed')
    }

    ElMessage.success('通知撤回成功')
    void fetchNotices()
  } catch {
    // 用户取消或撤回失败
  }
}

async function handleDelete(row: SysNoticeAdminVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除通知 "${row.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await noticeStore.deleteNotice(row.id)
    if (!success) {
      throw new Error('delete failed')
    }

    ElMessage.success('通知删除成功')
    void fetchNotices()
  } catch {
    // 用户取消或删除失败
  }
}

function handleFormSuccess(): void {
  void fetchNotices()
}

onMounted(() => {
  void fetchNotices()
})
</script>

<style scoped>
.notice-management-page {
  padding: 0;
  max-width: 1600px;
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

.table-card {
  min-height: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}

.table-wrapper {
  min-height: 0;
}

.notice-table {
  width: 100%;
}

.notice-table :deep(.el-table__cell .cell) {
  text-align: center;
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

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
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
