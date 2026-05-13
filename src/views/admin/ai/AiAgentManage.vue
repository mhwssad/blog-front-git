/**
 * AI Agent 管理
 * @description 后台 Agent 定义与任务管理，支持定义增删改查、任务列表筛选
 * @module admin/ai/AiAgentManage
 * @see stores/modules/aiAgent.ts
 */
<template>
  <div class="ai-agent-page">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- ==================== Agent 定义 ==================== -->
      <el-tab-pane label="Agent 定义" name="definition">
        <el-card class="search-card" shadow="never">
          <el-form :model="defQuery" inline>
            <el-form-item label="关键词">
              <el-input
                v-model="defQuery.keyword"
                placeholder="名称关键词"
                clearable
                style="width: 180px"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="defQuery.enabled"
                placeholder="全部"
                clearable
                style="width: 120px"
              >
                <el-option label="启用" :value="1" />
                <el-option label="停用" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button v-permission="'ai:agent:query'" type="primary" @click="handleDefQuery">
                查询
              </el-button>
              <el-button @click="handleDefReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="table-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>Agent 定义列表</span>
              <el-button
                v-permission="'ai:agent:create'"
                type="primary"
                @click="handleAdd"
              >
                <el-icon><Plus /></el-icon>
                新增 Agent
              </el-button>
            </div>
          </template>
          <el-table
            :data="agentStore.definitions"
            v-loading="agentStore.loading"
            :size="isCompactTable ? 'small' : 'default'"
            border
            stripe
          >
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="name" label="名称" min-width="140" />
            <el-table-column
              prop="description"
              label="描述"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column
              prop="channelConfigId"
              label="渠道ID"
              width="100"
              align="center"
            />
            <el-table-column label="启用" width="100" align="center">
              <template #default="{ row }">
                <el-switch
                  v-permission.disable="'ai:agent:update'"
                  v-model="row.enabled"
                  :active-value="1"
                  :inactive-value="0"
                  @change="handleToggle(row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="maxTurns" label="最大轮次" width="100" align="center" />
            <el-table-column label="创建时间" min-width="170" align="center">
              <template #default="{ row }">
                {{ formatAiDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center" fixed="right">
              <template #default="{ row }">
                <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
                  <el-button
                    v-permission="'ai:agent:update'"
                    link
                    type="primary"
                    @click="handleEdit(row)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    v-permission="'ai:agent:delete'"
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
          <div class="pagination-area">
            <el-pagination
              v-model:current-page="defPagination.current"
              v-model:page-size="defPagination.size"
              :total="agentStore.definitionTotal"
              :page-sizes="[10, 20, 50]"
              :layout="paginationLayout"
              @size-change="handleDefSizeChange"
              @current-change="handleDefCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <!-- ==================== Agent 任务 ==================== -->
      <el-tab-pane label="Agent 任务" name="task">
        <el-card class="search-card" shadow="never">
          <el-form :model="taskQuery" inline>
            <el-form-item label="Agent ID">
              <el-input
                v-model="taskQuery.agentId"
                placeholder="Agent ID"
                clearable
                style="width: 120px"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="taskQuery.status"
                placeholder="全部"
                clearable
                style="width: 120px"
              >
                <el-option
                  v-for="opt in AI_AGENT_TASK_STATUS_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleTaskQuery">查询</el-button>
              <el-button @click="handleTaskReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="table-card" shadow="never">
          <template #header>
            <span>Agent 任务列表</span>
          </template>
          <el-table
            :data="agentStore.tasks"
            v-loading="agentStore.taskLoading"
            :size="isCompactTable ? 'small' : 'default'"
            border
            stripe
          >
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="agentName" label="Agent" min-width="140" />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="taskStatusTagType(row.status)">
                  {{ formatAiAgentTaskStatus(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="inputContent"
              label="输入内容"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column
              prop="outputContent"
              label="输出内容"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column prop="tokenCount" label="Token" width="100" align="center" />
            <el-table-column label="开始时间" min-width="170" align="center">
              <template #default="{ row }">
                {{ formatAiDate(row.startedAt) }}
              </template>
            </el-table-column>
            <el-table-column label="完成时间" min-width="170" align="center">
              <template #default="{ row }">
                {{ formatAiDate(row.completedAt) }}
              </template>
            </el-table-column>
            <el-table-column label="创建时间" min-width="170" align="center">
              <template #default="{ row }">
                {{ formatAiDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-area">
            <el-pagination
              v-model:current-page="taskPagination.current"
              v-model:page-size="taskPagination.size"
              :total="agentStore.taskTotal"
              :page-sizes="[10, 20, 50]"
              :layout="paginationLayout"
              @size-change="handleTaskSizeChange"
              @current-change="handleTaskCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <AgentFormDialog
      v-model:visible="formDialogVisible"
      :agent-id="editingAgentId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAiAgentStore, useAiChannelStore } from '@/stores'
import { useContentAdmin } from '@/composables/useContentAdmin'
import {
  AI_AGENT_TASK_STATUS_OPTIONS,
  formatAiDate,
  formatAiAgentTaskStatus,
} from '@/utils'
import type { AiAgentDefinitionVO } from '@/types/api-types'
import AgentFormDialog from './components/AgentFormDialog.vue'

const agentStore = useAiAgentStore()
const channelStore = useAiChannelStore()

const activeTab = ref('definition')

const { paginationLayout, isCompactTable } = useContentAdmin({
  minHeight: 360,
  bottomOffset: 28,
})

// ==================== Agent 定义 ====================

const defQuery = reactive({
  keyword: '',
  enabled: undefined as number | undefined,
})

const defPagination = reactive({
  current: 1,
  size: 10,
})

const formDialogVisible = ref(false)
const editingAgentId = ref<number | null>(null)

async function fetchDefinitions(): Promise<void> {
  const params: Record<string, unknown> = {
    current: defPagination.current,
    size: defPagination.size,
  }
  if (defQuery.keyword) params.keyword = defQuery.keyword
  if (defQuery.enabled != null) params.enabled = defQuery.enabled

  await agentStore.fetchDefinitions(
    params as Parameters<typeof agentStore.fetchDefinitions>[0]
  )
}

function handleDefQuery(): void {
  defPagination.current = 1
  void fetchDefinitions()
}

function handleDefReset(): void {
  defQuery.keyword = ''
  defQuery.enabled = undefined
  defPagination.current = 1
  defPagination.size = 10
  void fetchDefinitions()
}

function handleDefSizeChange(): void {
  defPagination.current = 1
  void fetchDefinitions()
}

function handleDefCurrentChange(): void {
  void fetchDefinitions()
}

function handleAdd(): void {
  editingAgentId.value = null
  formDialogVisible.value = true
}

function handleEdit(row: AiAgentDefinitionVO): void {
  editingAgentId.value = row.id
  formDialogVisible.value = true
}

async function handleToggle(row: AiAgentDefinitionVO): Promise<void> {
  try {
    const success = await agentStore.toggleDefinition(row.id, row.enabled)
    if (!success) throw new Error('failed')
    ElMessage.success('状态更新成功')
  } catch {
    row.enabled = row.enabled === 1 ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

async function handleDelete(row: AiAgentDefinitionVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除 Agent "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const success = await agentStore.deleteDefinition(row.id)
    if (!success) throw new Error('failed')
    ElMessage.success('Agent 删除成功')
    void fetchDefinitions()
  } catch {
    // 用户取消或删除失败
  }
}

function handleFormSuccess(): void {
  void fetchDefinitions()
}

// ==================== Agent 任务 ====================

const taskQuery = reactive({
  agentId: '' as string,
  status: undefined as number | undefined,
})

const taskPagination = reactive({
  current: 1,
  size: 10,
})

async function fetchTasks(): Promise<void> {
  const params: Record<string, unknown> = {
    current: taskPagination.current,
    size: taskPagination.size,
  }
  if (taskQuery.agentId) params.agentId = Number(taskQuery.agentId)
  if (taskQuery.status != null) params.status = taskQuery.status

  await agentStore.fetchTasks(
    params as Parameters<typeof agentStore.fetchTasks>[0]
  )
}

function handleTaskQuery(): void {
  taskPagination.current = 1
  void fetchTasks()
}

function handleTaskReset(): void {
  taskQuery.agentId = ''
  taskQuery.status = undefined
  taskPagination.current = 1
  taskPagination.size = 10
  void fetchTasks()
}

function handleTaskSizeChange(): void {
  taskPagination.current = 1
  void fetchTasks()
}

function handleTaskCurrentChange(): void {
  void fetchTasks()
}

function taskStatusTagType(status: number): 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 2:
      return 'success'
    case 1:
      return 'warning'
    case 3:
      return 'danger'
    default:
      return 'info'
  }
}

// ==================== 初始化 ====================

onMounted(async () => {
  await channelStore.fetchChannels({ size: 100 })
  void fetchDefinitions()
})
</script>

<style scoped>
.ai-agent-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.table-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.table-actions--compact {
  flex-direction: column;
  gap: 2px;
}
</style>
