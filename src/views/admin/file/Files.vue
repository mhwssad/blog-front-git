<template>
  <div class="file-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="activeTab === 'files' ? fileSearchForm : taskSearchForm" inline class="search-form">
        <template v-if="activeTab === 'files'">
          <el-form-item label="关键词">
            <el-input
              v-model="fileSearchForm.keyword"
              class="filter-control"
              clearable
              placeholder="文件名 / 原始名"
            />
          </el-form-item>
          <el-form-item label="上传用户">
            <el-input-number v-model="fileSearchForm.uploadUserId" :min="1" class="filter-control" />
          </el-form-item>
          <el-form-item label="文件状态">
            <el-select v-model="fileSearchForm.status" clearable class="filter-control" placeholder="全部">
              <el-option
                v-for="option in FILE_STATUS_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="文件分类">
            <el-select v-model="fileSearchForm.category" clearable class="filter-control" placeholder="全部">
              <el-option
                v-for="option in fileCategoryOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="引用类型">
            <el-select v-model="fileSearchForm.referenceType" clearable class="filter-control" placeholder="全部">
              <el-option
                v-for="option in referenceTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="公开状态">
            <el-select v-model="fileSearchForm.isPublic" clearable class="filter-control" placeholder="全部">
              <el-option
                v-for="option in VISIBILITY_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="上传用户">
            <el-input-number v-model="taskSearchForm.uploadUserId" :min="1" class="filter-control" />
          </el-form-item>
          <el-form-item label="任务状态">
            <el-select v-model="taskSearchForm.taskStatus" clearable class="filter-control" placeholder="全部">
              <el-option
                v-for="option in FILE_TASK_STATUS_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="秒传">
            <el-select v-model="taskSearchForm.isQuickUpload" clearable class="filter-control" placeholder="全部">
              <el-option
                v-for="option in BOOLEAN_TEXT_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="分片上传">
            <el-select v-model="taskSearchForm.isChunked" clearable class="filter-control" placeholder="全部">
              <el-option
                v-for="option in BOOLEAN_TEXT_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </template>

        <el-form-item class="search-actions">
          <el-button v-permission="'content:file:query'" type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>文件管理</span>
          <el-button v-permission="'content:file:query'" link type="primary" @click="refreshActiveTab">
            刷新
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="文件库" name="files">
          <div ref="fileTableWrapperRef" class="table-wrapper">
            <el-table
              v-loading="fileStore.loading"
              :data="fileStore.files"
              :height="fileTableHeight"
              :size="fileCompact ? 'small' : 'default'"
              border
              stripe
              table-layout="auto"
            >
              <el-table-column prop="id" label="文件 ID" min-width="90" align="center" />
              <el-table-column prop="originalName" label="原始文件名" min-width="220" align="center" show-overflow-tooltip />
              <el-table-column prop="fileType" label="文件类型" min-width="100" align="center" />
              <el-table-column label="文件大小" min-width="110" align="center">
                <template #default="{ row }">
                  {{ formatFileSize(row.fileSize) }}
                </template>
              </el-table-column>
              <el-table-column label="上传用户" min-width="96" align="center">
                <template #default="{ row }">
                  #{{ row.uploadUserId ?? '-' }}
                </template>
              </el-table-column>
              <el-table-column label="公开" min-width="90" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.isPublic === 1 ? 'success' : 'info'">
                    {{ formatVisibility(row.isPublic) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="分类" min-width="120" align="center">
                <template #default="{ row }">
                  {{ formatOptionalText(row.category) }}
                </template>
              </el-table-column>
              <el-table-column label="状态" min-width="110" align="center">
                <template #default="{ row }">
                  <el-tag :type="getFileStatusTagType(row.status)">
                    {{ formatFileStatus(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="referenceCount" label="引用数" min-width="90" align="center" />
              <el-table-column label="创建时间" min-width="168" align="center">
                <template #default="{ row }">
                  {{ formatCreatedAt(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                :fixed="fileCompact ? false : 'right'"
                :min-width="fileCompact ? 200 : 220"
                align="center"
              >
                <template #default="{ row }">
                  <div class="table-actions">
                    <el-button link type="primary" @click="handleViewDetail(row.id)">详情</el-button>
                    <el-button
                      v-permission="'content:file:update'"
                      link
                      :type="row.status === 1 ? 'warning' : 'success'"
                      @click="handleToggleStatus(row.id, row.status)"
                    >
                      {{ row.status === 1 ? '禁用' : '启用' }}
                    </el-button>
                    <el-button
                      v-permission="'content:file:delete'"
                      link
                      type="danger"
                      @click="handleDelete(row.id)"
                    >
                      删除
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div ref="filePaginationRef" class="pagination">
            <el-pagination
              v-model:current-page="filePagination.current"
              v-model:page-size="filePagination.size"
              :total="fileStore.fileTotal"
              :page-sizes="[10, 20, 50, 100]"
              :layout="filePaginationLayout"
              :small="fileCompact"
              @current-change="handleFilePageChange"
              @size-change="handleFileSizeChange"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="上传任务" name="tasks">
          <div ref="taskTableWrapperRef" class="table-wrapper">
            <el-table
              v-loading="fileStore.loading"
              :data="fileStore.uploadTasks"
              :height="taskTableHeight"
              :size="taskCompact ? 'small' : 'default'"
              border
              stripe
              table-layout="auto"
            >
              <el-table-column prop="id" label="任务 ID" min-width="90" align="center" />
              <el-table-column prop="uploadId" label="上传 ID" min-width="200" align="center" show-overflow-tooltip />
              <el-table-column prop="originalName" label="原始文件名" min-width="200" align="center" show-overflow-tooltip />
              <el-table-column label="文件大小" min-width="110" align="center">
                <template #default="{ row }">
                  {{ formatFileSize(row.fileSize) }}
                </template>
              </el-table-column>
              <el-table-column label="上传用户" min-width="96" align="center">
                <template #default="{ row }">
                  #{{ row.uploadUserId ?? '-' }}
                </template>
              </el-table-column>
              <el-table-column label="秒传" min-width="90" align="center">
                <template #default="{ row }">
                  {{ formatBooleanText(row.isQuickUpload) }}
                </template>
              </el-table-column>
              <el-table-column label="分片" min-width="90" align="center">
                <template #default="{ row }">
                  {{ formatBooleanText(row.isChunked) }}
                </template>
              </el-table-column>
              <el-table-column label="进度" min-width="120" align="center">
                <template #default="{ row }">
                  {{ row.uploadedChunks ?? 0 }}/{{ row.totalChunks ?? 0 }}
                </template>
              </el-table-column>
              <el-table-column label="状态" min-width="110" align="center">
                <template #default="{ row }">
                  <el-tag :type="getTaskStatusTagType(row.taskStatus)">
                    {{ formatFileTaskStatus(row.taskStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="完成时间" min-width="168" align="center">
                <template #default="{ row }">
                  {{ formatCreatedAt(row.completeTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="errorMessage" label="错误信息" min-width="180" align="center" show-overflow-tooltip>
                <template #default="{ row }">
                  {{ formatOptionalText(row.errorMessage) }}
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div ref="taskPaginationRef" class="pagination">
            <el-pagination
              v-model:current-page="taskPagination.current"
              v-model:page-size="taskPagination.size"
              :total="fileStore.taskTotal"
              :page-sizes="[10, 20, 50, 100]"
              :layout="taskPaginationLayout"
              :small="taskCompact"
              @current-change="handleTaskPageChange"
              @size-change="handleTaskSizeChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <FileDetailDrawer
      v-model="detailVisible"
      :detail="fileStore.fileDetail"
      :loading="fileStore.detailLoading"
    />
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type TabPaneName } from 'element-plus'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useFileStore } from '@/stores'
import {
  BOOLEAN_TEXT_OPTIONS,
  FILE_STATUS_OPTIONS,
  FILE_TASK_STATUS_OPTIONS,
  FormatUtils,
  VISIBILITY_OPTIONS,
  formatBooleanText,
  formatCreatedAt,
  formatFileStatus,
  formatFileTaskStatus,
  formatOptionalText,
  formatVisibility,
} from '@/utils'
import FileDetailDrawer from './components/FileDetailDrawer.vue'

type FileTab = 'files' | 'tasks'

const fileStore = useFileStore()
const activeTab = ref<FileTab>('files')
const detailVisible = ref(false)

const fileCategoryOptions = [
  { label: '文章封面', value: 'article-cover' },
  { label: '聊天附件', value: 'chat-attachment' },
  { label: '评论图片', value: 'comment-image' },
]

const referenceTypeOptions = [
  { label: '文章', value: 'article' },
  { label: '聊天消息', value: 'chat-message' },
  { label: '评论', value: 'comment' },
]

const fileSearchForm = reactive({
  keyword: '',
  uploadUserId: undefined as number | undefined,
  status: undefined as number | undefined,
  category: '',
  referenceType: '',
  isPublic: undefined as number | undefined,
})

const taskSearchForm = reactive({
  uploadUserId: undefined as number | undefined,
  taskStatus: undefined as number | undefined,
  isQuickUpload: undefined as number | undefined,
  isChunked: undefined as number | undefined,
})

const filePagination = reactive({
  current: 1,
  size: 10,
})

const taskPagination = reactive({
  current: 1,
  size: 10,
})

const fileTable = useContentAdmin({ minHeight: 340, bottomOffset: 24 })
const taskTable = useContentAdmin({ minHeight: 320, bottomOffset: 24 })

const {
  tableWrapperRef: fileTableWrapperRef,
  paginationRef: filePaginationRef,
  tableHeight: fileTableHeight,
  paginationLayout: filePaginationLayout,
  isCompactTable: fileCompact,
  updateViewportState: updateFileViewport,
} = fileTable

const {
  tableWrapperRef: taskTableWrapperRef,
  paginationRef: taskPaginationRef,
  tableHeight: taskTableHeight,
  paginationLayout: taskPaginationLayout,
  isCompactTable: taskCompact,
  updateViewportState: updateTaskViewport,
} = taskTable

function buildFileQuery() {
  return {
    current: filePagination.current,
    size: filePagination.size,
    keyword: fileSearchForm.keyword.trim() || undefined,
    uploadUserId: fileSearchForm.uploadUserId,
    status: fileSearchForm.status,
    category: fileSearchForm.category || undefined,
    referenceType: fileSearchForm.referenceType || undefined,
    isPublic: fileSearchForm.isPublic,
  }
}

function buildTaskQuery() {
  return {
    current: taskPagination.current,
    size: taskPagination.size,
    uploadUserId: taskSearchForm.uploadUserId,
    taskStatus: taskSearchForm.taskStatus,
    isQuickUpload: taskSearchForm.isQuickUpload,
    isChunked: taskSearchForm.isChunked,
  }
}

async function fetchFiles(): Promise<void> {
  await fileStore.fetchFiles(buildFileQuery())
}

async function fetchTasks(): Promise<void> {
  await fileStore.fetchUploadTasks(buildTaskQuery())
}

function refreshActiveTab(): Promise<void> {
  if (activeTab.value === 'files') {
    return fetchFiles()
  }

  return fetchTasks()
}

function handleSearch(): void {
  if (activeTab.value === 'files') {
    filePagination.current = 1
    void fetchFiles()
    return
  }

  taskPagination.current = 1
  void fetchTasks()
}

function handleReset(): void {
  if (activeTab.value === 'files') {
    fileSearchForm.keyword = ''
    fileSearchForm.uploadUserId = undefined
    fileSearchForm.status = undefined
    fileSearchForm.category = ''
    fileSearchForm.referenceType = ''
    fileSearchForm.isPublic = undefined
    filePagination.current = 1
    void fetchFiles()
    return
  }

  taskSearchForm.uploadUserId = undefined
  taskSearchForm.taskStatus = undefined
  taskSearchForm.isQuickUpload = undefined
  taskSearchForm.isChunked = undefined
  taskPagination.current = 1
  void fetchTasks()
}

function handleFilePageChange(current: number): void {
  filePagination.current = current
  void fetchFiles()
}

function handleFileSizeChange(size: number): void {
  filePagination.size = size
  filePagination.current = 1
  void fetchFiles()
}

function handleTaskPageChange(current: number): void {
  taskPagination.current = current
  void fetchTasks()
}

function handleTaskSizeChange(size: number): void {
  taskPagination.size = size
  taskPagination.current = 1
  void fetchTasks()
}

function handleTabChange(name: TabPaneName): void {
  activeTab.value = name === 'tasks' ? 'tasks' : 'files'
  void nextTick(() => {
    if (activeTab.value === 'files') {
      updateFileViewport()
      return
    }

    updateTaskViewport()
  })
}

async function handleViewDetail(id: number): Promise<void> {
  detailVisible.value = true
  await fileStore.fetchFileDetail(id)
}

async function handleToggleStatus(id: number, currentStatus: number): Promise<void> {
  const nextStatus = currentStatus === 1 ? 2 : 1
  const success = await fileStore.updateFileStatus(id, { status: nextStatus })

  if (!success) {
    ElMessage.error('文件状态更新失败')
    return
  }

  ElMessage.success(`文件已${nextStatus === 1 ? '启用' : '禁用'}`)
  void fetchFiles()

  if (fileStore.fileDetail?.id === id) {
    void fileStore.fetchFileDetail(id)
  }
}

async function handleDelete(id: number): Promise<void> {
  try {
    await ElMessageBox.confirm('确定要删除该文件记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await fileStore.deleteFile(id)
    if (!success) {
      ElMessage.error('删除失败')
      return
    }

    ElMessage.success('删除成功')
    if (detailVisible.value && fileStore.fileDetail?.id === id) {
      detailVisible.value = false
      fileStore.clearFileDetail()
    }
    void fetchFiles()
  } catch {
    // 用户取消
  }
}

function getFileStatusTagType(status: number): 'info' | 'success' | 'warning' | 'danger' {
  if (status === 1) {
    return 'success'
  }

  if (status === 2) {
    return 'warning'
  }

  if (status === 3) {
    return 'danger'
  }

  return 'info'
}

function getTaskStatusTagType(status: number): 'info' | 'warning' | 'success' | 'danger' {
  if (status === 1) {
    return 'warning'
  }

  if (status === 2) {
    return 'success'
  }

  if (status === 3) {
    return 'danger'
  }

  return 'info'
}

function formatFileSize(size: number): string {
  return FormatUtils.formatFileSize(size)
}

onMounted(() => {
  void fetchFiles()
  void fetchTasks()
})
</script>

<style scoped>
.file-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 0;
}

.search-card :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

.filter-control {
  width: 220px;
}

.search-actions {
  margin-right: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 500;
}

.table-wrapper {
  min-height: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.table-actions {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .filter-control {
    width: 100%;
  }

  .search-card :deep(.el-form-item) {
    width: 100%;
    margin-right: 0;
  }

  .search-actions :deep(.el-form-item__content) {
    width: 100%;
    justify-content: center;
  }
}
</style>
