/**
 * AI 工具管理
 * @description 后台工具定义、调用日志、工具授权管理
 * @module admin/ai/AiToolManage
 * @see stores/modules/aiTool.ts
 */
<template>
  <div class="ai-tool-page">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- ==================== 工具定义 ==================== -->
      <el-tab-pane label="工具定义" name="tool">
        <el-card class="search-card" shadow="never">
          <el-form :model="toolQuery" inline>
            <el-form-item label="工具编码">
              <el-input
                v-model="toolQuery.toolCode"
                placeholder="工具编码"
                clearable
                style="width: 160px"
              />
            </el-form-item>
            <el-form-item label="工具名称">
              <el-input
                v-model="toolQuery.toolName"
                placeholder="工具名称"
                clearable
                style="width: 160px"
              />
            </el-form-item>
            <el-form-item label="来源类型">
              <el-select
                v-model="toolQuery.sourceType"
                placeholder="全部"
                clearable
                style="width: 130px"
              >
                <el-option
                  v-for="opt in AI_TOOL_SOURCE_TYPE_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="toolQuery.enabled"
                placeholder="全部"
                clearable
                style="width: 100px"
              >
                <el-option label="启用" :value="1" />
                <el-option label="停用" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button v-permission="'ai:tool:query'" type="primary" @click="handleToolQuery">
                查询
              </el-button>
              <el-button @click="handleToolReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <DataTable
          :data="toolStore.tools"
          :loading="toolStore.loading"
          :total="toolStore.toolTotal"
          v-model:current-page="toolPagination.current"
          v-model:page-size="toolPagination.size"
          :page-sizes="[10, 20, 50]"
          :pagination-layout="paginationLayout"
          :compact="isCompactTable"
          title="工具定义列表"
          @size-change="handleToolSizeChange"
          @page-change="handleToolCurrentChange"
        >
          <template #header-extra>
            <el-button v-permission="'ai:tool:create'" type="primary" @click="handleAddTool">
              <el-icon><Plus /></el-icon>
              新增工具
            </el-button>
          </template>

          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="toolCode" label="工具编码" min-width="140" />
          <el-table-column prop="toolName" label="工具名称" min-width="140" />
          <el-table-column label="来源类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag>{{ formatToolSourceType(row.sourceType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="description"
            label="描述"
            min-width="180"
            show-overflow-tooltip
          />
          <el-table-column label="风险等级" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="riskLevelTagType(row.riskLevel)">
                {{ formatAiToolRiskLevel(row.riskLevel) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="启用" width="100" align="center">
            <template #default="{ row }">
              <el-switch
                v-permission.disable="'ai:tool:update'"
                v-model="row.enabled"
                :active-value="1"
                :inactive-value="0"
                @change="handleToolToggle(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" min-width="170" align="center">
            <template #default="{ row }">
              {{ formatAiDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
                <el-button
                  v-permission="'ai:tool:update'"
                  link
                  type="primary"
                  @click="handleEditTool(row)"
                >
                  编辑
                </el-button>
                <el-button
                  v-permission="'ai:tool:delete'"
                  link
                  type="danger"
                  @click="handleDeleteTool(row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </DataTable>
      </el-tab-pane>

      <!-- ==================== 调用日志 ==================== -->
      <el-tab-pane label="调用日志" name="call-log">
        <el-card class="search-card" shadow="never">
          <el-form :model="logQuery" inline>
            <el-form-item label="工具 ID">
              <el-input-number
                v-model="logQuery.toolId"
                :min="1"
                placeholder="工具 ID"
                controls-position="right"
                style="width: 140px"
              />
            </el-form-item>
            <el-form-item label="用户 ID">
              <el-input-number
                v-model="logQuery.userId"
                :min="1"
                placeholder="用户 ID"
                controls-position="right"
                style="width: 140px"
              />
            </el-form-item>
            <el-form-item label="执行状态">
              <el-select
                v-model="logQuery.successStatus"
                placeholder="全部"
                clearable
                style="width: 120px"
              >
                <el-option
                  v-for="opt in AI_SUCCESS_STATUS_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleLogQuery">查询</el-button>
              <el-button @click="handleLogReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <DataTable
          :data="toolStore.callLogs"
          :loading="toolStore.callLogLoading"
          :total="toolStore.callLogTotal"
          v-model:current-page="logPagination.current"
          v-model:page-size="logPagination.size"
          :page-sizes="[10, 20, 50]"
          :pagination-layout="paginationLayout"
          :compact="isCompactTable"
          title="调用日志列表"
          @size-change="handleLogSizeChange"
          @page-change="handleLogCurrentChange"
        >
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="toolCode" label="工具编码" min-width="130" />
          <el-table-column prop="toolName" label="工具名称" min-width="130" />
          <el-table-column prop="requestSceneType" label="场景类型" width="120" align="center" />
          <el-table-column
            prop="requestSummary"
            label="请求摘要"
            min-width="180"
            show-overflow-tooltip
          />
          <el-table-column
            prop="responseSummary"
            label="响应摘要"
            min-width="180"
            show-overflow-tooltip
          />
          <el-table-column label="执行状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.successStatus === 1 ? 'success' : 'danger'">
                {{ formatAiSuccessStatus(row.successStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="elapsedMs" label="耗时(ms)" width="100" align="center" />
          <el-table-column
            prop="errorMessage"
            label="错误信息"
            min-width="180"
            show-overflow-tooltip
          />
          <el-table-column label="创建时间" min-width="170" align="center">
            <template #default="{ row }">
              {{ formatAiDate(row.createdAt) }}
            </template>
          </el-table-column>
        </DataTable>
      </el-tab-pane>

      <!-- ==================== 工具授权 ==================== -->
      <el-tab-pane label="工具授权" name="authorization">
        <el-card class="search-card" shadow="never">
          <el-form :model="authQuery" inline>
            <el-form-item label="工具 ID">
              <el-input-number
                v-model="authQuery.toolId"
                :min="1"
                placeholder="工具 ID"
                controls-position="right"
                style="width: 140px"
              />
            </el-form-item>
            <el-form-item label="授权类型">
              <el-select
                v-model="authQuery.authorizationType"
                placeholder="全部"
                clearable
                style="width: 130px"
              >
                <el-option
                  v-for="opt in AI_AUTHORIZATION_TYPE_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="authQuery.enabled"
                placeholder="全部"
                clearable
                style="width: 100px"
              >
                <el-option label="启用" :value="1" />
                <el-option label="停用" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button v-permission="'ai:tool:query'" type="primary" @click="handleAuthQuery">
                查询
              </el-button>
              <el-button @click="handleAuthReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <DataTable
          :data="toolStore.authorizations"
          :loading="toolStore.authLoading"
          :total="toolStore.authTotal"
          v-model:current-page="authPagination.current"
          v-model:page-size="authPagination.size"
          :page-sizes="[10, 20, 50]"
          :pagination-layout="paginationLayout"
          :compact="isCompactTable"
          title="工具授权列表"
          @size-change="handleAuthSizeChange"
          @page-change="handleAuthCurrentChange"
        >
          <template #header-extra>
            <el-button
              v-permission="'ai:tool:create'"
              type="primary"
              @click="handleAddAuth"
            >
              <el-icon><Plus /></el-icon>
              新增授权
            </el-button>
          </template>

          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="toolId" label="工具 ID" width="100" align="center" />
          <el-table-column label="授权类型" width="110" align="center">
            <template #default="{ row }">
              <el-tag>{{ formatAiAuthType(row.authorizationType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="authorizationKey" label="授权标识" min-width="160" />
          <el-table-column
            prop="dataScope"
            label="数据范围"
            min-width="160"
            show-overflow-tooltip
          />
          <el-table-column label="启用" width="100" align="center">
            <template #default="{ row }">
              <el-switch
                v-permission.disable="'ai:tool:update'"
                v-model="row.enabled"
                :active-value="1"
                :inactive-value="0"
                @change="handleAuthToggle(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" min-width="170" align="center">
            <template #default="{ row }">
              {{ formatAiDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
                <el-button
                  v-permission="'ai:tool:update'"
                  link
                  type="primary"
                  @click="handleEditAuth(row)"
                >
                  编辑
                </el-button>
                <el-button
                  v-permission="'ai:tool:delete'"
                  link
                  type="danger"
                  @click="handleDeleteAuth(row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </DataTable>
      </el-tab-pane>
    </el-tabs>

    <ToolFormDialog
      v-model:visible="toolFormVisible"
      :tool-id="editingToolId"
      @success="handleToolFormSuccess"
    />

    <ToolAuthorizationFormDialog
      v-model:visible="authFormVisible"
      :auth="editingAuth"
      @success="handleAuthFormSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAiToolStore } from '@/stores'
import { useContentAdmin } from '@/composables/useContentAdmin'
import DataTable from '@/components/common/DataTable.vue'
import {
  AI_TOOL_SOURCE_TYPE_OPTIONS,
  AI_TOOL_RISK_LEVEL_OPTIONS,
  AI_SUCCESS_STATUS_OPTIONS,
  AI_AUTHORIZATION_TYPE_OPTIONS,
  formatAiDate,
  formatAiToolRiskLevel,
  formatAiSuccessStatus,
  formatAiAuthType,
} from '@/utils'
import type { AiToolVO, AiToolAuthorizationVO } from '@/types/api-types'
import ToolFormDialog from './components/ToolFormDialog.vue'
import ToolAuthorizationFormDialog from './components/ToolAuthorizationFormDialog.vue'

const toolStore = useAiToolStore()

const activeTab = ref('tool')

const { paginationLayout, isCompactTable } = useContentAdmin({
  minHeight: 360,
  bottomOffset: 28,
})

// ==================== 来源类型格式化 ====================

function formatToolSourceType(value: string | null | undefined): string {
  const opt = AI_TOOL_SOURCE_TYPE_OPTIONS.find((o) => o.value === value)
  return opt?.label ?? value ?? '-'
}

// ==================== 风险等级标签 ====================

function riskLevelTagType(level: string): 'success' | 'warning' | 'danger' | 'info' {
  switch (level) {
    case 'low':
      return 'success'
    case 'medium':
      return 'warning'
    case 'high':
      return 'danger'
    default:
      return 'info'
  }
}

// ==================== 工具定义 ====================

const toolQuery = reactive({
  toolCode: '',
  toolName: '',
  sourceType: '' as string,
  enabled: undefined as number | undefined,
})

const toolPagination = reactive({
  current: 1,
  size: 10,
})

const toolFormVisible = ref(false)
const editingToolId = ref<number | null>(null)

async function fetchTools(): Promise<void> {
  const params: Record<string, unknown> = {
    current: toolPagination.current,
    size: toolPagination.size,
  }
  if (toolQuery.toolCode) params.toolCode = toolQuery.toolCode
  if (toolQuery.toolName) params.toolName = toolQuery.toolName
  if (toolQuery.sourceType) params.sourceType = toolQuery.sourceType
  if (toolQuery.enabled != null) params.enabled = toolQuery.enabled

  await toolStore.fetchTools(params as Parameters<typeof toolStore.fetchTools>[0])
}

function handleToolQuery(): void {
  toolPagination.current = 1
  void fetchTools()
}

function handleToolReset(): void {
  toolQuery.toolCode = ''
  toolQuery.toolName = ''
  toolQuery.sourceType = ''
  toolQuery.enabled = undefined
  toolPagination.current = 1
  toolPagination.size = 10
  void fetchTools()
}

function handleToolSizeChange(): void {
  toolPagination.current = 1
  void fetchTools()
}

function handleToolCurrentChange(): void {
  void fetchTools()
}

function handleAddTool(): void {
  editingToolId.value = null
  toolFormVisible.value = true
}

function handleEditTool(row: AiToolVO): void {
  editingToolId.value = row.id
  toolFormVisible.value = true
}

async function handleToolToggle(row: AiToolVO): Promise<void> {
  try {
    const success = await toolStore.updateToolStatus(row.id, row.enabled)
    if (!success) throw new Error('failed')
    ElMessage.success('状态更新成功')
  } catch {
    row.enabled = row.enabled === 1 ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

async function handleDeleteTool(row: AiToolVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除工具 "${row.toolName}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const success = await toolStore.deleteTool(row.id)
    if (!success) throw new Error('failed')
    ElMessage.success('工具删除成功')
    void fetchTools()
  } catch {
    // 用户取消或删除失败
  }
}

function handleToolFormSuccess(): void {
  void fetchTools()
}

// ==================== 调用日志 ====================

const logQuery = reactive({
  toolId: undefined as number | undefined,
  userId: undefined as number | undefined,
  successStatus: undefined as number | undefined,
})

const logPagination = reactive({
  current: 1,
  size: 10,
})

async function fetchCallLogs(): Promise<void> {
  const params: Record<string, unknown> = {
    current: logPagination.current,
    size: logPagination.size,
  }
  if (logQuery.toolId != null) params.toolId = logQuery.toolId
  if (logQuery.userId != null) params.userId = logQuery.userId
  if (logQuery.successStatus != null) params.successStatus = logQuery.successStatus

  await toolStore.fetchCallLogs(params as Parameters<typeof toolStore.fetchCallLogs>[0])
}

function handleLogQuery(): void {
  logPagination.current = 1
  void fetchCallLogs()
}

function handleLogReset(): void {
  logQuery.toolId = undefined
  logQuery.userId = undefined
  logQuery.successStatus = undefined
  logPagination.current = 1
  logPagination.size = 10
  void fetchCallLogs()
}

function handleLogSizeChange(): void {
  logPagination.current = 1
  void fetchCallLogs()
}

function handleLogCurrentChange(): void {
  void fetchCallLogs()
}

// ==================== 工具授权 ====================

const authQuery = reactive({
  toolId: undefined as number | undefined,
  authorizationType: '' as string,
  enabled: undefined as number | undefined,
})

const authPagination = reactive({
  current: 1,
  size: 10,
})

const authFormVisible = ref(false)
const editingAuth = ref<AiToolAuthorizationVO | null>(null)

async function fetchAuthorizations(): Promise<void> {
  const params: Record<string, unknown> = {
    current: authPagination.current,
    size: authPagination.size,
  }
  if (authQuery.toolId != null) params.toolId = authQuery.toolId
  if (authQuery.authorizationType) params.authorizationType = authQuery.authorizationType
  if (authQuery.enabled != null) params.enabled = authQuery.enabled

  await toolStore.fetchAuthorizations(
    params as Parameters<typeof toolStore.fetchAuthorizations>[0]
  )
}

function handleAuthQuery(): void {
  authPagination.current = 1
  void fetchAuthorizations()
}

function handleAuthReset(): void {
  authQuery.toolId = undefined
  authQuery.authorizationType = ''
  authQuery.enabled = undefined
  authPagination.current = 1
  authPagination.size = 10
  void fetchAuthorizations()
}

function handleAuthSizeChange(): void {
  authPagination.current = 1
  void fetchAuthorizations()
}

function handleAuthCurrentChange(): void {
  void fetchAuthorizations()
}

function handleAddAuth(): void {
  editingAuth.value = null
  authFormVisible.value = true
}

function handleEditAuth(row: AiToolAuthorizationVO): void {
  editingAuth.value = row
  authFormVisible.value = true
}

async function handleAuthToggle(row: AiToolAuthorizationVO): Promise<void> {
  try {
    const success = await toolStore.updateAuthorization(row.id, {
      toolId: row.toolId,
      authorizationType: row.authorizationType,
      authorizationKey: row.authorizationKey,
      dataScope: row.dataScope,
      enabled: row.enabled,
    })
    if (!success) throw new Error('failed')
    ElMessage.success('状态更新成功')
  } catch {
    row.enabled = row.enabled === 1 ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

async function handleDeleteAuth(row: AiToolAuthorizationVO): Promise<void> {
  try {
    await ElMessageBox.confirm('确定要删除该授权记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const success = await toolStore.deleteAuthorization(row.id)
    if (!success) throw new Error('failed')
    ElMessage.success('授权删除成功')
    void fetchAuthorizations()
  } catch {
    // 用户取消或删除失败
  }
}

function handleAuthFormSuccess(): void {
  void fetchAuthorizations()
}

// ==================== 初始化 ====================

onMounted(() => {
  void fetchTools()
  void fetchCallLogs()
  void fetchAuthorizations()
})
</script>

<style scoped>
.ai-tool-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 16px;
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
