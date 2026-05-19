/**
 * AI MCP 服务管理
 * @description 后台 MCP 服务列表管理，支持筛选、新增、编辑、删除、发现工具、健康检查
 * @module admin/ai/AiMcpManage
 * @see stores/modules/aiMcp.ts
 */
<template>
  <div class="ai-mcp-page">
    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="服务名称">
          <el-input
            v-model="query.serverName"
            placeholder="服务名称"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="传输类型">
          <el-select
            v-model="query.transportType"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="opt in AI_MCP_TRANSPORT_TYPE_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="query.enabled"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button v-permission="'ai:mcp:query'" type="primary" @click="handleQuery">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区 -->
    <DataTable
      :data="store.servers"
      :loading="store.loading"
      :total="store.serverTotal"
      :current-page="pagination.current"
      :page-size="pagination.size"
      :page-sizes="[10, 20, 50]"
      :pagination-layout="paginationLayout"
      :compact="isCompactTable"
      title="MCP 服务列表"
      @update:current-page="(val: number) => { pagination.current = val; void fetchList() }"
      @update:page-size="(val: number) => { pagination.size = val; pagination.current = 1; void fetchList() }"
    >
      <template #header-extra>
        <el-button
          v-permission="'ai:mcp:create'"
          type="primary"
          @click="handleAdd"
        >
          <el-icon><Plus /></el-icon>
          新增MCP服务
        </el-button>
      </template>

      <el-table
        :size="isCompactTable ? 'small' : 'default'"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="serverName" label="服务名称" min-width="140" />
        <el-table-column label="传输类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="transportTagType(row.transportType)">
              {{ formatAiTransportType(row.transportType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timeoutSeconds" label="超时(秒)" width="100" align="center" />
        <el-table-column label="启用" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-permission.disable="'ai:mcp:update'"
              v-model="row.enabled"
              :active-value="1"
              :inactive-value="0"
              @change="handleToggle(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="健康状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              v-if="row.lastHealthStatus"
              :type="row.lastHealthStatus === 'healthy' ? 'success' : 'danger'"
            >
              {{ row.lastHealthStatus === 'healthy' ? '健康' : '异常' }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="上次发现时间" min-width="170" align="center">
          <template #default="{ row }">
            {{ row.lastDiscoveredAt ? formatAiDate(row.lastDiscoveredAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="lastErrorSummary"
          label="最近错误"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column label="创建时间" min-width="170" align="center">
          <template #default="{ row }">
            {{ formatAiDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
              <el-button
                v-permission="'ai:mcp:update'"
                link
                type="primary"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="'ai:mcp:delete'"
                link
                type="danger"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
              <el-button
                v-permission="'ai:mcp:update'"
                link
                type="warning"
                @click="handleDiscover(row)"
              >
                发现工具
              </el-button>
              <el-button
                v-permission="'ai:mcp:query'"
                link
                type="success"
                @click="handleHealthCheck(row)"
              >
                健康检查
              </el-button>
              <el-button
                v-permission="'ai:mcp:query'"
                link
                type="info"
                @click="handleViewTools(row)"
              >
                查看工具
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </DataTable>

    <!-- 新增/编辑弹窗 -->
    <McpServerFormDialog
      v-model:visible="formDialogVisible"
      :server-id="editingServerId"
      @success="handleFormSuccess"
    />

    <!-- 工具列表抽屉 -->
    <el-drawer
      v-model="toolDrawerVisible"
      title="工具列表"
      size="600px"
      :destroy-on-close="true"
    >
      <el-table
        :data="store.toolSnapshots"
        v-loading="store.toolLoading"
        border
        stripe
      >
        <el-table-column prop="mcpToolName" label="MCP工具名" min-width="140" />
        <el-table-column prop="toolCode" label="工具编码" min-width="140" />
        <el-table-column prop="toolName" label="工具名称" min-width="120" />
        <el-table-column
          prop="description"
          label="描述"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column label="风险等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              v-if="row.riskLevel"
              :type="riskLevelTagType(row.riskLevel)"
            >
              {{ formatAiToolRiskLevel(row.riskLevel) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="启用" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled === 1 ? 'success' : 'info'">
              {{ row.enabled === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAiMcpStore } from '@/stores'
import { useContentAdmin } from '@/composables/useContentAdmin'
import DataTable from '@/components/common/DataTable.vue'
import {
  AI_MCP_TRANSPORT_TYPE_OPTIONS,
  formatAiDate,
  formatAiTransportType,
  formatAiToolRiskLevel,
} from '@/utils'
import type { AiMcpServerVO } from '@/types/api-types'
import McpServerFormDialog from './components/McpServerFormDialog.vue'

const store = useAiMcpStore()

const { paginationLayout, isCompactTable } = useContentAdmin({
  minHeight: 360,
  bottomOffset: 28,
})

// ==================== 查询 ====================

const query = reactive({
  serverName: '',
  transportType: '',
  enabled: undefined as number | undefined,
})

const pagination = reactive({
  current: 1,
  size: 10,
})

async function fetchList(): Promise<void> {
  const params: Record<string, unknown> = {
    current: pagination.current,
    size: pagination.size,
  }
  if (query.serverName) params.serverName = query.serverName
  if (query.transportType) params.transportType = query.transportType
  if (query.enabled != null) params.enabled = query.enabled

  await store.fetchServers(params as Parameters<typeof store.fetchServers>[0])
}

function handleQuery(): void {
  pagination.current = 1
  void fetchList()
}

function handleReset(): void {
  query.serverName = ''
  query.transportType = ''
  query.enabled = undefined
  pagination.current = 1
  pagination.size = 10
  void fetchList()
}

// ==================== 新增/编辑 ====================

const formDialogVisible = ref(false)
const editingServerId = ref<number | null>(null)

function handleAdd(): void {
  editingServerId.value = null
  formDialogVisible.value = true
}

function handleEdit(row: AiMcpServerVO): void {
  editingServerId.value = row.id
  formDialogVisible.value = true
}

function handleFormSuccess(): void {
  void fetchList()
}

// ==================== 启用/停用 ====================

async function handleToggle(row: AiMcpServerVO): Promise<void> {
  try {
    const success = await store.updateServerStatus(row.id, row.enabled)
    if (!success) throw new Error('failed')
    ElMessage.success('状态更新成功')
  } catch {
    row.enabled = row.enabled === 1 ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

// ==================== 删除 ====================

async function handleDelete(row: AiMcpServerVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除 MCP 服务 "${row.serverName}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const success = await store.deleteServer(row.id)
    if (!success) throw new Error('failed')
    ElMessage.success('删除成功')
    void fetchList()
  } catch {
    // 用户取消或删除失败
  }
}

// ==================== 发现工具 ====================

async function handleDiscover(row: AiMcpServerVO): Promise<void> {
  const result = await store.discoverTools(row.id)
  if (result) {
    ElMessage.success(
      `发现完成：发现 ${result.discoveredCount} 个工具，同步 ${result.syncedCount} 个`
    )
  } else {
    ElMessage.error('发现工具失败')
  }
}

// ==================== 健康检查 ====================

async function handleHealthCheck(row: AiMcpServerVO): Promise<void> {
  const result = await store.getServerHealth(row.id)
  if (result) {
    if (result.healthy) {
      ElMessage.success(`健康检查通过：${result.status}`)
    } else {
      ElMessage.warning(
        `健康检查异常：${result.status}${result.errorSummary ? ' - ' + result.errorSummary : ''}`
      )
    }
  } else {
    ElMessage.error('健康检查请求失败')
  }
}

// ==================== 查看工具 ====================

const toolDrawerVisible = ref(false)

async function handleViewTools(row: AiMcpServerVO): Promise<void> {
  await store.getServerTools(row.id)
  toolDrawerVisible.value = true
}

// ==================== 样式辅助 ====================

function transportTagType(type: string): 'success' | 'warning' | 'primary' {
  switch (type) {
    case 'http':
      return 'primary'
    case 'sse':
      return 'warning'
    case 'stdio':
      return 'success'
    default:
      return 'primary'
  }
}

function riskLevelTagType(level: string): 'success' | 'warning' | 'danger' {
  switch (level) {
    case 'low':
      return 'success'
    case 'medium':
      return 'warning'
    case 'high':
      return 'danger'
    default:
      return 'success'
  }
}

// ==================== 初始化 ====================

onMounted(() => {
  void fetchList()
})
</script>

<style scoped>
.ai-mcp-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 16px;
}

.table-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.table-actions--compact {
  flex-direction: column;
  gap: 2px;
}
</style>
