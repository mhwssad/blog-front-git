<template>
  <div class="collection-management-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="目标类型" class="filter-item">
          <el-select
            v-model="searchForm.targetType"
            class="filter-control"
            clearable
            placeholder="请选择目标类型"
          >
            <el-option
              v-for="option in TARGET_TYPE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <template v-if="searchExpanded">
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
        </template>
        <el-form-item class="search-actions">
          <el-button v-permission="'content:collection:query'" type="primary" @click="handleSearch">
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

    <el-tabs v-model="activeTab" class="collection-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="收藏记录" name="records">
        <DataTable
          title="收藏记录"
          :data="collectionStore.collections"
          :loading="collectionStore.loading"
          :total="collectionStore.collectionTotal"
          :current-page="recordPagination.current"
          :page-size="recordPagination.size"
          :compact="true"
          row-key="id"
          @update:current-page="handleRecordPageChange"
          @update:page-size="handleRecordSizeChange"
        >
          <template #header-extra>
            <el-button v-permission="'content:collection:query'" @click="refreshActiveTab">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </template>
            <el-table-column label="目标标题" min-width="240" align="left" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.targetTitle || '—' }}
              </template>
            </el-table-column>
            <el-table-column label="目标类型" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ formatTargetType(row.targetType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="用户 ID" min-width="90" align="center" prop="userId" />
            <el-table-column label="收藏时间" min-width="170" align="center">
              <template #default="{ row }">
                {{ formatCreatedAt(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center" fixed="right">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button link type="primary" @click="openRecordDetail(row)">详情</el-button>
                  <el-button
                    v-if="row.targetUrl"
                    link
                    type="primary"
                    @click="openTargetUrl(row.targetUrl)"
                  >
                    查看
                  </el-button>
                  <el-button
                    v-permission="'content:collection:delete'"
                    link
                    type="danger"
                    @click="handleDeleteCollection(row.id)"
                  >
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
        </DataTable>
      </el-tab-pane>

        <el-tab-pane label="收藏夹" name="folders">
          <DataTable
            title="收藏夹"
            :data="collectionStore.folders"
            :loading="collectionStore.loading"
            :total="collectionStore.folderTotal"
            :current-page="folderPagination.current"
            :page-size="folderPagination.size"
            :compact="true"
            row-key="id"
            @update:current-page="handleFolderPageChange"
            @update:page-size="handleFolderSizeChange"
          >
            <el-table-column
              prop="folderName"
              label="收藏夹名称"
              min-width="200"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column label="类型" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ formatTargetType(row.folderType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="收藏数" min-width="90" align="center" prop="collectionCount" />
            <el-table-column label="公开" min-width="80" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="row.isPublic === 1 ? 'success' : 'info'">
                  {{ row.isPublic === 1 ? '公开' : '私有' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center" fixed="right">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button link type="primary" @click="openFolderDetail(row)">详情</el-button>
                  <el-button link type="primary" @click="goToFolderRecords(row)">查看收藏</el-button>
                </div>
              </template>
            </el-table-column>
          </DataTable>
        </el-tab-pane>
      </el-tabs>

    <CollectionRecordDetailDialog
      v-model:visible="recordDetailVisible"
      :detail="recordDetail"
    />

    <CollectionFolderDetailDialog
      v-model:visible="folderDetailVisible"
      :detail="folderDetail"
      @view-records="goToFolderRecordsById"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type TabPaneName } from 'element-plus'
import { Refresh, ArrowDown } from '@element-plus/icons-vue'
import DataTable from '@/components/common/DataTable.vue'
import { useCollectionStore } from '@/stores'
import { TARGET_TYPE_OPTIONS, formatCreatedAt, formatTargetType } from '@/utils'
import CollectionRecordDetailDialog from './components/CollectionRecordDetailDialog.vue'
import CollectionFolderDetailDialog from './components/CollectionFolderDetailDialog.vue'
import type { CollectionVO, CollectionFolderVO } from '@/types/api-types'

type CollectionTab = 'records' | 'folders'

const collectionStore = useCollectionStore()
const activeTab = ref<CollectionTab>('records')
const searchExpanded = ref(false)

const searchForm = reactive({
  userId: undefined as number | undefined,
  folderId: undefined as number | undefined,
  targetId: undefined as number | undefined,
  targetType: undefined as string | undefined,
})

const recordPagination = reactive({ current: 1, size: 10 })
const folderPagination = reactive({ current: 1, size: 10 })

const recordDetailVisible = ref(false)
const recordDetail = ref<CollectionVO | null>(null)
const folderDetailVisible = ref(false)
const folderDetail = ref<CollectionFolderVO | null>(null)

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
  } else {
    folderPagination.current = 1
    void fetchFolders()
  }
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
}

function refreshActiveTab(): Promise<void> {
  return activeTab.value === 'records' ? fetchCollections() : fetchFolders()
}

function openRecordDetail(row: CollectionVO): void {
  recordDetail.value = row
  recordDetailVisible.value = true
}

function openFolderDetail(row: CollectionFolderVO): void {
  folderDetail.value = row
  folderDetailVisible.value = true
}

function goToFolderRecords(row: CollectionFolderVO): void {
  goToFolderRecordsById(row.id)
}

function goToFolderRecordsById(folderId: number): void {
  searchForm.folderId = folderId
  activeTab.value = 'records'
  recordPagination.current = 1
  void fetchCollections()
}

function openTargetUrl(url: string): void {
  window.open(url, '_blank', 'noopener')
}

async function handleDeleteCollection(id: number): Promise<void> {
  try {
    await ElMessageBox.confirm('确定要删除该收藏记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await collectionStore.deleteCollection(id)
    if (!success) throw new Error('delete failed')

    ElMessage.success('删除成功')
    void fetchCollections()
  } catch {
    // user cancelled or delete failed
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

.collection-tabs {
  margin-top: 16px;
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

.table-actions {
  display: inline-flex;
  justify-content: center;
  gap: 4px 8px;
}

@media (max-width: 768px) {
  .filter-control {
    width: 160px;
  }
}
</style>
