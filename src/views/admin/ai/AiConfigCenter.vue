<template>
  <div class="ai-config-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="渠道名称" class="filter-item">
          <el-input
            v-model="searchForm.channelName"
            class="filter-control"
            clearable
            placeholder="请输入渠道名称"
          />
        </el-form-item>
        <el-form-item label="状态" class="filter-item">
          <el-select
            v-model="searchForm.status"
            class="filter-control"
            clearable
            placeholder="全部"
          >
            <el-option
              v-for="opt in AI_CHANNEL_STATUS_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button v-permission="'ai:channel-config:query'" type="primary" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <DataTable
      :data="channelStore.channels"
      :loading="channelStore.loading"
      :total="channelStore.total"
      :current-page="pagination.current"
      :page-size="pagination.size"
      :page-sizes="[10, 20, 50]"
      :pagination-layout="paginationLayout"
      :compact="isCompactTable"
      title="渠道配置列表"
      @update:current-page="(val: number) => { pagination.current = val; void fetchChannels() }"
      @update:page-size="(val: number) => { pagination.size = val; pagination.current = 1; void fetchChannels() }"
    >
      <template #header-extra>
        <el-button v-permission="'ai:channel-config:create'" type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增渠道
        </el-button>
      </template>

      <el-table
        :size="isCompactTable ? 'small' : 'default'"
      >
        <el-table-column prop="id" label="ID" min-width="70" align="center" />
        <el-table-column
          prop="channelCode"
          label="渠道编码"
          min-width="140"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="channelName"
          label="渠道名称"
          min-width="160"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column label="输入上限" min-width="100" align="center">
          <template #default="{ row }">
            {{ row.maxInputTokens || '不限制' }}
          </template>
        </el-table-column>
        <el-table-column label="RAG上限" min-width="100" align="center">
          <template #default="{ row }">
            {{ row.maxRagTokens || '不限制' }}
          </template>
        </el-table-column>
        <el-table-column label="输出上限" min-width="100" align="center">
          <template #default="{ row }">
            {{ row.maxOutputTokens || '不限制' }}
          </template>
        </el-table-column>
        <el-table-column label="用户日限额" min-width="110" align="center">
          <template #default="{ row }">
            {{ row.userDailyQuota || '不限制' }}
          </template>
        </el-table-column>
        <el-table-column label="默认" min-width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isDefault === 1" type="success" size="small">默认</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-permission.disable="'ai:channel-config:update'"
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="170" align="center">
          <template #default="{ row }">
            {{ formatAiDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          :min-width="isCompactTable ? 130 : 180"
          :fixed="isCompactTable ? false : 'right'"
          align="center"
        >
          <template #default="{ row }">
            <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
              <el-button
                v-permission="'ai:channel-config:update'"
                link
                type="primary"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="'ai:channel-config:delete'"
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
    </DataTable>

    <ChannelFormDialog
      v-model:visible="formDialogVisible"
      :channel-id="editingChannelId"
      @success="handleFormSuccess"
    />
  </div>
</template>

/** * AI 渠道配置中心 * @description 后台 AI
渠道配置的增删改查管理，支持渠道基本信息、API配置、额度配置、状态切换 * @module
admin/ai/AiConfigCenter * @see api/sys/ai.ts */
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useAiChannelStore } from '@/stores'
import DataTable from '@/components/common/DataTable.vue'
import { AI_CHANNEL_STATUS_OPTIONS, formatAiDate } from '@/utils'
import type { AiChannelConfigVO } from '@/types/api-types'
import ChannelFormDialog from './components/ChannelFormDialog.vue'

// AI 渠道 Store
const channelStore = useAiChannelStore()

// 搜索表单
const searchForm = reactive({
  channelName: undefined as string | undefined,
  status: undefined as number | undefined,
})

// 分页参数
const pagination = reactive({ current: 1, size: 10 })

// 表单对话框 visibility 和编辑的 channelId
const formDialogVisible = ref(false)
const editingChannelId = ref<number | null>(null)

const { isCompactTable, paginationLayout } = useContentAdmin({ minHeight: 360, bottomOffset: 16 })

/**
 * 获取渠道列表
 */
async function fetchChannels(): Promise<void> {
  try {
    await channelStore.fetchChannels({
      ...searchForm,
      current: pagination.current,
      size: pagination.size,
    })
  } catch {
    ElMessage.error('获取渠道列表失败')
  }
}

// 搜索按钮
function handleSearch(): void {
  pagination.current = 1
  void fetchChannels()
}

// 重置搜索条件
function handleReset(): void {
  searchForm.channelName = undefined
  searchForm.status = undefined
  pagination.current = 1
  pagination.size = 10
  void fetchChannels()
}

// 打开发送新增对话框
function handleAdd(): void {
  editingChannelId.value = null
  formDialogVisible.value = true
}

// 打开编辑对话框
function handleEdit(row: AiChannelConfigVO): void {
  editingChannelId.value = row.id
  formDialogVisible.value = true
}

// 切换渠道状态
async function handleStatusChange(row: AiChannelConfigVO): Promise<void> {
  try {
    const success = await channelStore.updateChannelStatus(row.id, { status: row.status })
    if (!success) throw new Error('failed')
    ElMessage.success('状态更新成功')
  } catch {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

// 删除渠道
async function handleDelete(row: AiChannelConfigVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除渠道 "${row.channelName}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const success = await channelStore.deleteChannel(row.id)
    if (!success) throw new Error('failed')
    ElMessage.success('渠道删除成功')
    void fetchChannels()
  } catch {
    // 用户取消或删除失败
  }
}

// 表单提交成功后刷新列表
function handleFormSuccess(): void {
  void fetchChannels()
}

onMounted(() => {
  void fetchChannels()
})
</script>

<style scoped>
.ai-config-page {
  padding: 0;
  max-width: 1560px;
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
  width: 200px;
}

.search-actions {
  margin-left: 0;
  margin-right: 0;
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
