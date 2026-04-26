<template>
  <div class="collection-management-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="用户 ID" class="filter-item">
          <el-input-number
            v-model="searchForm.userId"
            :min="1"
            class="filter-control"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="收藏夹 ID" class="filter-item">
          <el-input-number
            v-model="searchForm.folderId"
            :min="1"
            class="filter-control"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="目标 ID" class="filter-item">
          <el-input-number
            v-model="searchForm.targetId"
            :min="1"
            class="filter-control"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="目标类型" class="filter-item">
          <el-select v-model="searchForm.targetType" class="filter-control" clearable placeholder="请选择目标类型">
            <el-option
              v-for="option in TARGET_TYPE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button v-permission="'content:collection:query'" type="primary" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>收藏管理</span>
          <el-button v-permission="'content:collection:query'" link type="primary" @click="refreshActiveTab">
            刷新
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="collection-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="收藏记录" name="records">
          <div ref="recordTableWrapperRef" class="table-wrapper">
            <el-table
              v-loading="collectionStore.loading"
              :data="collectionStore.collections"
              :height="recordTableHeight"
              :size="recordCompact ? 'small' : 'default'"
              table-layout="auto"
              class="collection-table"
              border
              stripe
            >
              <el-table-column prop="id" label="记录 ID" min-width="100" align="center" />
              <el-table-column prop="userId" label="用户 ID" min-width="100" align="center" />
              <el-table-column prop="folderId" label="收藏夹 ID" min-width="110" align="center" />
              <el-table-column label="目标类型" min-width="120" align="center">
                <template #default="{ row }">
                  {{ formatTargetType(row.targetType) }}
                </template>
              </el-table-column>
              <el-table-column prop="targetTitle" label="目标标题" min-width="220" align="center" show-overflow-tooltip>
                <template #default="{ row }">
                  {{ formatOptionalText(row.targetTitle) }}
                </template>
              </el-table-column>
              <el-table-column prop="targetUrl" label="目标地址" min-width="220" align="center" show-overflow-tooltip>
                <template #default="{ row }">
                  {{ formatOptionalText(row.targetUrl) }}
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" min-width="180" align="center" show-overflow-tooltip>
                <template #default="{ row }">
                  {{ formatOptionalText(row.remark) }}
                </template>
              </el-table-column>
              <el-table-column label="创建时间" min-width="180" align="center">
                <template #default="{ row }">
                  {{ formatCreatedAt(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                :min-width="recordCompact ? 120 : 140"
                :fixed="recordCompact ? false : 'right'"
                align="center"
              >
                <template #default="{ row }">
                  <el-button
                    v-permission="'content:collection:delete'"
                    link
                    type="danger"
                    @click="handleDeleteCollection(row.id)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div ref="recordPaginationRef" class="pagination">
            <el-pagination
              v-model:current-page="recordPagination.current"
              v-model:page-size="recordPagination.size"
              :total="collectionStore.collectionTotal"
              :page-sizes="[10, 20, 50, 100]"
              :layout="recordPaginationLayout"
              :small="recordCompact"
              @size-change="handleRecordSizeChange"
              @current-change="handleRecordPageChange"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="收藏夹" name="folders">
          <div ref="folderTableWrapperRef" class="table-wrapper">
            <el-table
              v-loading="collectionStore.loading"
              :data="collectionStore.folders"
              :height="folderTableHeight"
              :size="folderCompact ? 'small' : 'default'"
              table-layout="auto"
              class="collection-table"
              border
              stripe
            >
              <el-table-column prop="id" label="收藏夹 ID" min-width="110" align="center" />
              <el-table-column prop="userId" label="用户 ID" min-width="100" align="center" />
              <el-table-column prop="folderName" label="收藏夹名称" min-width="220" align="center" show-overflow-tooltip />
              <el-table-column prop="folderType" label="类型" min-width="120" align="center">
                <template #default="{ row }">
                  {{ formatTargetType(row.folderType) }}
                </template>
              </el-table-column>
              <el-table-column label="是否公开" min-width="110" align="center">
                <template #default="{ row }">
                  {{ formatVisibility(row.isPublic) }}
                </template>
              </el-table-column>
              <el-table-column label="是否默认" min-width="110" align="center">
                <template #default="{ row }">
                  {{ formatDefaultFlag(row.isDefault) }}
                </template>
              </el-table-column>
              <el-table-column prop="collectionCount" label="收藏数" min-width="100" align="center" />
              <el-table-column label="创建时间" min-width="180" align="center">
                <template #default="{ row }">
                  {{ formatCreatedAt(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column label="更新时间" min-width="180" align="center">
                <template #default="{ row }">
                  {{ formatUpdatedAt(row.updatedAt) }}
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div ref="folderPaginationRef" class="pagination">
            <el-pagination
              v-model:current-page="folderPagination.current"
              v-model:page-size="folderPagination.size"
              :total="collectionStore.folderTotal"
              :page-sizes="[10, 20, 50, 100]"
              :layout="folderPaginationLayout"
              :small="folderCompact"
              @size-change="handleFolderSizeChange"
              @current-change="handleFolderPageChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type TabPaneName } from 'element-plus'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useCollectionStore } from '@/stores'
import {
  TARGET_TYPE_OPTIONS,
  formatCreatedAt,
  formatDefaultFlag,
  formatOptionalText,
  formatTargetType,
  formatUpdatedAt,
  formatVisibility,
} from '@/utils'

type CollectionTab = 'records' | 'folders'

const collectionStore = useCollectionStore()
const activeTab = ref<CollectionTab>('records')

const searchForm = reactive({
  userId: undefined as number | undefined,
  folderId: undefined as number | undefined,
  targetId: undefined as number | undefined,
  targetType: undefined as string | undefined,
})

const recordPagination = reactive({
  current: 1,
  size: 10,
})

const folderPagination = reactive({
  current: 1,
  size: 10,
})

const recordTable = useContentAdmin({ minHeight: 340, bottomOffset: 24 })
const folderTable = useContentAdmin({ minHeight: 320, bottomOffset: 24 })

const {
  tableWrapperRef: recordTableWrapperRef,
  paginationRef: recordPaginationRef,
  tableHeight: recordTableHeight,
  isCompactTable: recordCompact,
  paginationLayout: recordPaginationLayout,
  updateViewportState: updateRecordViewport,
} = recordTable

const {
  tableWrapperRef: folderTableWrapperRef,
  paginationRef: folderPaginationRef,
  tableHeight: folderTableHeight,
  isCompactTable: folderCompact,
  paginationLayout: folderPaginationLayout,
  updateViewportState: updateFolderViewport,
} = folderTable

function buildParams() {
  return {
    userId: searchForm.userId,
    folderId: searchForm.folderId,
    targetId: searchForm.targetId,
    targetType: searchForm.targetType || undefined,
  }
}

async function fetchCollections(): Promise<void> {
  await collectionStore.fetchCollections({
    ...buildParams(),
    current: recordPagination.current,
    size: recordPagination.size,
  })
}

async function fetchFolders(): Promise<void> {
  await collectionStore.fetchFolders({
    ...buildParams(),
    current: folderPagination.current,
    size: folderPagination.size,
  })
}

function handleSearch(): void {
  if (activeTab.value === 'records') {
    recordPagination.current = 1
    void fetchCollections()
    return
  }

  folderPagination.current = 1
  void fetchFolders()
}

function handleReset(): void {
  searchForm.userId = undefined
  searchForm.folderId = undefined
  searchForm.targetId = undefined
  searchForm.targetType = undefined
  recordPagination.current = 1
  folderPagination.current = 1
  void refreshActiveTab()
}

function handleRecordSizeChange(size: number): void {
  recordPagination.size = size
  void fetchCollections()
}

function handleRecordPageChange(current: number): void {
  recordPagination.current = current
  void fetchCollections()
}

function handleFolderSizeChange(size: number): void {
  folderPagination.size = size
  void fetchFolders()
}

function handleFolderPageChange(current: number): void {
  folderPagination.current = current
  void fetchFolders()
}

function handleTabChange(name: TabPaneName): void {
  activeTab.value = name === 'folders' ? 'folders' : 'records'
  void nextTick(() => {
    if (activeTab.value === 'records') {
      updateRecordViewport()
      return
    }
    updateFolderViewport()
  })
}

function refreshActiveTab(): Promise<void> {
  if (activeTab.value === 'records') {
    return fetchCollections()
  }

  return fetchFolders()
}

async function handleDeleteCollection(id: number): Promise<void> {
  try {
    await ElMessageBox.confirm('确定要删除该收藏记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await collectionStore.deleteCollection(id)
    if (!success) {
      throw new Error('delete failed')
    }

    ElMessage.success('删除成功')
    void fetchCollections()
  } catch {
    // 用户取消或删除失败
  }
}

onMounted(() => {
  void fetchCollections()
  void fetchFolders()
})
</script>

<style scoped>
.collection-management-page {
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

.collection-tabs :deep(.el-tabs__content) {
  overflow: visible;
}

.table-wrapper {
  min-height: 0;
}

.collection-table {
  width: 100%;
}

.collection-table :deep(.el-table__cell .cell) {
  text-align: center;
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
