<template>
  <div class="ai-knowledge-page">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- Tab 1: 知识源配置 -->
      <el-tab-pane label="知识源配置" name="source-config">
        <div v-loading="store.sourceConfigLoading" class="source-config-grid">
          <el-card
            v-for="config in store.sourceConfigs"
            :key="config.id"
            shadow="hover"
            class="source-card"
          >
            <template #header>
              <div class="source-card__header">
                <span class="source-card__title">{{ formatAiSourceType(config.sourceType) }}</span>
                <el-switch
                  v-permission.disable="'ai:knowledge:update'"
                  :model-value="config.enabled === 1"
                  active-text="启用"
                  inactive-text="停用"
                  @change="handleToggleEnabled(config)"
                />
              </div>
            </template>
            <div class="source-card__body">
              <div class="source-card__row">
                <span class="source-card__label">同步间隔</span>
                <span>{{ config.syncInterval }} 秒</span>
              </div>
              <div class="source-card__row">
                <span class="source-card__label">上次同步</span>
                <span>{{ config.lastSyncedAt ? formatAiDate(config.lastSyncedAt) : '未同步' }}</span>
              </div>
              <div v-if="config.remark" class="source-card__row">
                <span class="source-card__label">备注</span>
                <span>{{ config.remark }}</span>
              </div>
            </div>
            <div class="source-card__actions">
              <el-button
                v-permission="'ai:knowledge:update'"
                type="primary"
                link
                @click="handleEditConfig(config)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="'ai:knowledge:sync'"
                type="warning"
                link
                @click="handleTriggerSync(config)"
              >
                触发同步
              </el-button>
            </div>
          </el-card>
          <el-empty v-if="!store.sourceConfigLoading && store.sourceConfigs.length === 0" description="暂无知识源配置" />
        </div>
      </el-tab-pane>

      <!-- Tab 2: 知识条目 -->
      <el-tab-pane label="知识条目" name="entries">
        <el-card shadow="never" class="search-card">
          <el-form :model="entryQuery" inline>
            <el-form-item label="来源类型">
              <el-select v-model="entryQuery.sourceType" placeholder="全部" clearable style="width: 140px">
                <el-option
                  v-for="opt in AI_KNOWLEDGE_SOURCE_TYPE_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="entryQuery.status" placeholder="全部" clearable style="width: 120px">
                <el-option
                  v-for="opt in AI_KNOWLEDGE_ENTRY_STATUS_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="关键词">
              <el-input v-model="entryQuery.keyword" placeholder="标题/摘要" clearable style="width: 180px" />
            </el-form-item>
            <el-form-item>
              <el-button v-permission="'ai:knowledge:query'" type="primary" @click="handleEntrySearch">查询</el-button>
              <el-button @click="handleEntryReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" class="table-card">
          <el-table
            :data="store.entries"
            v-loading="store.loading"
            :size="isCompactTable ? 'small' : 'default'"
            border
            stripe
          >
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="sourceType" label="来源类型" width="120" align="center">
              <template #default="{ row }">
                {{ formatAiSourceType(row.sourceType) }}
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
            <el-table-column prop="summary" label="摘要" min-width="220" show-overflow-tooltip />
            <el-table-column label="状态" width="150" align="center">
              <template #default="{ row }">
                <el-tag :type="entryStatusTagType(row.status)" size="small" style="margin-right: 8px">
                  {{ formatAiEntryStatus(row.status) }}
                </el-tag>
                <el-switch
                  v-permission.disable="'ai:knowledge:update'"
                  :model-value="row.status === 1"
                  size="small"
                  @change="handleEntryStatusToggle(row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="chunkCount" label="分块数" width="90" align="center" />
            <el-table-column label="同步时间" width="170" align="center">
              <template #default="{ row }">
                {{ row.syncedAt ? formatAiDate(row.syncedAt) : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="170" align="center">
              <template #default="{ row }">
                {{ formatAiDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-area">
            <el-pagination
              v-model:current-page="entryPagination.current"
              v-model:page-size="entryPagination.size"
              :total="store.entryTotal"
              :page-sizes="[10, 20, 50]"
              :layout="paginationLayout"
              @size-change="handleEntrySizeChange"
              @current-change="handleEntryCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <!-- Tab 3: 同步任务 -->
      <el-tab-pane label="同步任务" name="sync-tasks">
        <el-card shadow="never" class="search-card">
          <el-form :model="taskQuery" inline>
            <el-form-item label="来源类型">
              <el-select v-model="taskQuery.sourceType" placeholder="全部" clearable style="width: 140px">
                <el-option
                  v-for="opt in AI_KNOWLEDGE_SOURCE_TYPE_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="taskQuery.status" placeholder="全部" clearable style="width: 120px">
                <el-option
                  v-for="opt in AI_SYNC_TASK_STATUS_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button v-permission="'ai:knowledge:query'" type="primary" @click="handleTaskSearch">查询</el-button>
              <el-button @click="handleTaskReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" class="table-card">
          <el-table
            :data="store.syncTasks"
            v-loading="store.syncTaskLoading"
            :size="isCompactTable ? 'small' : 'default'"
            border
            stripe
          >
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="taskType" label="任务类型" width="110" align="center" />
            <el-table-column prop="sourceType" label="来源类型" width="120" align="center">
              <template #default="{ row }">
                {{ formatAiSourceType(row.sourceType) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="syncStatusTagType(row.status)" size="small">
                  {{ formatAiSyncTaskStatus(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="totalCount" label="总数" width="80" align="center" />
            <el-table-column prop="successCount" label="成功" width="80" align="center" />
            <el-table-column prop="failCount" label="失败" width="80" align="center" />
            <el-table-column prop="errorMessage" label="错误信息" min-width="180" show-overflow-tooltip />
            <el-table-column label="开始时间" width="170" align="center">
              <template #default="{ row }">
                {{ row.startedAt ? formatAiDate(row.startedAt) : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="完成时间" width="170" align="center">
              <template #default="{ row }">
                {{ row.completedAt ? formatAiDate(row.completedAt) : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-permission="'ai:knowledge:sync'"
                  link
                  type="primary"
                  @click="handleRetryTask(row)"
                >
                  重试
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-area">
            <el-pagination
              v-model:current-page="taskPagination.current"
              v-model:page-size="taskPagination.size"
              :total="store.syncTaskTotal"
              :page-sizes="[10, 20, 50]"
              :layout="paginationLayout"
              @size-change="handleTaskSizeChange"
              @current-change="handleTaskCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <KnowledgeSourceConfigFormDialog
      v-model:visible="configFormVisible"
      :config-id="editingConfigId"
      @success="handleConfigFormSuccess"
    />

    <KnowledgeSyncDialog
      v-model:visible="syncDialogVisible"
      :source-type="syncSourceType"
      @success="handleSyncSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAiKnowledgeStore } from '@/stores'
import { useContentAdmin } from '@/composables/useContentAdmin'
import {
  AI_KNOWLEDGE_SOURCE_TYPE_OPTIONS,
  AI_KNOWLEDGE_ENTRY_STATUS_OPTIONS,
  AI_SYNC_TASK_STATUS_OPTIONS,
  formatAiDate,
  formatAiSourceType,
  formatAiEntryStatus,
  formatAiSyncTaskStatus,
} from '@/utils'
import type { AiKnowledgeSourceConfigVO, AiKnowledgeEntryVO, AiKnowledgeSyncTaskVO } from '@/types/api-types'
import KnowledgeSourceConfigFormDialog from './components/KnowledgeSourceConfigFormDialog.vue'
import KnowledgeSyncDialog from './components/KnowledgeSyncDialog.vue'

const store = useAiKnowledgeStore()

const { isCompactTable, paginationLayout } = useContentAdmin({ minHeight: 360, bottomOffset: 16 })

const activeTab = ref('source-config')

// ==================== 知识源配置 ====================

const configFormVisible = ref(false)
const editingConfigId = ref<number | null>(null)

function handleEditConfig(config: AiKnowledgeSourceConfigVO): void {
  editingConfigId.value = config.id
  configFormVisible.value = true
}

async function handleToggleEnabled(config: AiKnowledgeSourceConfigVO): Promise<void> {
  const newEnabled = config.enabled === 1 ? 0 : 1
  const success = await store.toggleSourceConfig(config.id, newEnabled)
  if (success) {
    config.enabled = newEnabled
    ElMessage.success('状态更新成功')
    void store.fetchSourceConfigs()
  } else {
    ElMessage.error('状态更新失败')
  }
}

const syncDialogVisible = ref(false)
const syncSourceType = ref('')

function handleTriggerSync(config: AiKnowledgeSourceConfigVO): void {
  syncSourceType.value = config.sourceType
  syncDialogVisible.value = true
}

function handleConfigFormSuccess(): void {
  void store.fetchSourceConfigs()
}

function handleSyncSuccess(): void {
  ElMessage.success('同步任务已触发')
}

// ==================== 知识条目 ====================

const entryQuery = reactive({
  sourceType: undefined as string | undefined,
  status: undefined as number | undefined,
  keyword: undefined as string | undefined,
})

const entryPagination = reactive({ current: 1, size: 10 })

function fetchEntries(): void {
  void store.fetchEntries({
    current: entryPagination.current,
    size: entryPagination.size,
    sourceType: entryQuery.sourceType,
    status: entryQuery.status,
    keyword: entryQuery.keyword,
  })
}

function handleEntrySearch(): void {
  entryPagination.current = 1
  fetchEntries()
}

function handleEntryReset(): void {
  entryQuery.sourceType = undefined
  entryQuery.status = undefined
  entryQuery.keyword = undefined
  entryPagination.current = 1
  entryPagination.size = 10
  fetchEntries()
}

function handleEntrySizeChange(): void {
  entryPagination.current = 1
  fetchEntries()
}

function handleEntryCurrentChange(): void {
  fetchEntries()
}

async function handleEntryStatusToggle(row: AiKnowledgeEntryVO): Promise<void> {
  const newStatus = row.status === 1 ? 0 : 1
  const success = await store.updateEntryStatus(row.id, newStatus)
  if (success) {
    row.status = newStatus
    ElMessage.success('状态更新成功')
  } else {
    ElMessage.error('状态更新失败')
  }
}

function entryStatusTagType(status: number): 'success' | 'warning' | 'danger' | 'info' {
  if (status === 1) return 'success'
  if (status === 2) return 'danger'
  return 'warning'
}

// ==================== 同步任务 ====================

const taskQuery = reactive({
  sourceType: undefined as string | undefined,
  status: undefined as number | undefined,
})

const taskPagination = reactive({ current: 1, size: 10 })

function fetchSyncTasks(): void {
  void store.fetchSyncTasks({
    current: taskPagination.current,
    size: taskPagination.size,
    sourceType: taskQuery.sourceType,
    status: taskQuery.status,
  })
}

function handleTaskSearch(): void {
  taskPagination.current = 1
  fetchSyncTasks()
}

function handleTaskReset(): void {
  taskQuery.sourceType = undefined
  taskQuery.status = undefined
  taskPagination.current = 1
  taskPagination.size = 10
  fetchSyncTasks()
}

function handleTaskSizeChange(): void {
  taskPagination.current = 1
  fetchSyncTasks()
}

function handleTaskCurrentChange(): void {
  fetchSyncTasks()
}

async function handleRetryTask(row: AiKnowledgeSyncTaskVO): Promise<void> {
  try {
    await ElMessageBox.confirm('确定要重试该同步任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const success = await store.retrySyncTask(row.id)
    if (success) {
      ElMessage.success('重试任务已提交')
      fetchSyncTasks()
    } else {
      ElMessage.error('重试失败')
    }
  } catch {
    // 用户取消
  }
}

function syncStatusTagType(status: number): 'success' | 'warning' | 'danger' | 'info' {
  if (status === 2) return 'success'
  if (status === 3) return 'danger'
  if (status === 1) return 'warning'
  return 'info'
}

// ==================== 初始化 ====================

onMounted(() => {
  void store.fetchSourceConfigs()
  fetchEntries()
  fetchSyncTasks()
})
</script>

<style scoped>
.ai-knowledge-page {
  padding: 0;
  max-width: 1560px;
  margin: 0 auto;
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 16px;
}

.pagination-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.source-config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  padding: 16px 0;
}

.source-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.source-card__title {
  font-weight: 600;
  font-size: 15px;
}

.source-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.source-card__row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #606266;
}

.source-card__label {
  color: #909399;
}

.source-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}
</style>
