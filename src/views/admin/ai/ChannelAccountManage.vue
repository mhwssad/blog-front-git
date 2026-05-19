<template>
  <div class="channel-account-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="所属渠道" class="filter-item">
          <el-select
            v-model="selectedChannelId"
            class="filter-control"
            clearable
            placeholder="请选择渠道"
            @change="handleChannelChange"
          >
            <el-option
              v-for="ch in channelStore.channels"
              :key="ch.id"
              :label="ch.channelName"
              :value="ch.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账号名称" class="filter-item">
          <el-input
            v-model="searchForm.accountName"
            class="filter-control"
            clearable
            placeholder="请输入账号名称"
          />
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button
            v-permission="'ai:channel-account:query'"
            type="primary"
            :disabled="!selectedChannelId"
            @click="handleSearch"
          >
            查询
          </el-button>
          <el-button :disabled="!selectedChannelId" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <template v-if="!selectedChannelId">
      <DataTable :data="[]" title="渠道账号池">
        <template #header-extra>
          <el-button
            v-permission="'ai:channel-account:create'"
            type="primary"
            disabled
          >
            <el-icon><Plus /></el-icon>
            新增账号
          </el-button>
        </template>
        <el-table-column label="ID" />
      </DataTable>
    </template>

    <DataTable
      v-else
      :data="channelStore.accounts"
      :loading="channelStore.accountLoading"
      :total="channelStore.accountTotal"
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :page-sizes="[10, 20, 50]"
      :pagination-layout="paginationLayout"
      title="渠道账号池"
      :compact="isCompactTable"
      @page-change="fetchAccounts"
      @size-change="() => { pagination.current = 1; fetchAccounts() }"
    >
      <template #header-extra>
        <el-button
          v-permission="'ai:channel-account:create'"
          type="primary"
          @click="handleAdd"
        >
          <el-icon><Plus /></el-icon>
          新增账号
        </el-button>
      </template>

      <el-table-column prop="id" label="ID" min-width="70" align="center" />
      <el-table-column
        prop="accountName"
        label="账号名称"
        min-width="150"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column
        prop="provider"
        label="服务商"
        min-width="100"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column
        prop="modelName"
        label="模型"
        min-width="130"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column label="权重" min-width="80" align="center">
        <template #default="{ row }">
          {{ row.weight }}
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="100" align="center">
        <template #default="{ row }">
          <el-switch
            v-permission.disable="'ai:channel-account:update'"
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="日限额" min-width="100" align="center">
        <template #default="{ row }">
          {{ row.dailyQuota || '不限' }}
        </template>
      </el-table-column>
      <el-table-column label="连续错误" min-width="100" align="center">
        <template #default="{ row }">
          <el-tag
            v-if="row.consecutiveErrors > 0"
            type="danger"
            size="small"
          >
            {{ row.consecutiveErrors }}
          </el-tag>
          <span v-else>{{ row.consecutiveErrors }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后使用" min-width="170" align="center">
        <template #default="{ row }">
          {{ row.lastUsedAt ? formatAiDate(row.lastUsedAt) : '-' }}
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
              v-permission="'ai:channel-account:update'"
              link
              type="primary"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-permission="'ai:channel-account:delete'"
              link
              type="danger"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </DataTable>

    <AccountFormDialog
      v-model:visible="formDialogVisible"
      :channel-id="selectedChannelId"
      :account-id="editingAccountId"
      @success="handleFormSuccess"
    />
  </div>
</template>

/** * 渠道账号池管理 * @description 后台 AI 渠道账号的增删改查管理，支持按渠道筛选、状态切换
* @module admin/ai/ChannelAccountManage * @see api/sys/ai.ts */
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useContentAdmin } from '@/composables/useContentAdmin'
import DataTable from '@/components/common/DataTable.vue'
import { useAiChannelStore } from '@/stores'
import { formatAiDate } from '@/utils'
import type { AiChannelAccountVO } from '@/types/api-types'
import AccountFormDialog from './components/AccountFormDialog.vue'

const channelStore = useAiChannelStore()

// 选中的渠道
const selectedChannelId = ref<number | null>(null)

// 搜索表单
const searchForm = reactive({
  accountName: undefined as string | undefined,
})

// 分页参数
const pagination = reactive({ current: 1, size: 10 })

// 表单对话框
const formDialogVisible = ref(false)
const editingAccountId = ref<number | null>(null)

const { isCompactTable, paginationLayout } = useContentAdmin({ minHeight: 360, bottomOffset: 16 })

/**
 * 获取账号列表
 */
async function fetchAccounts(): Promise<void> {
  if (!selectedChannelId.value) return
  try {
    await channelStore.fetchChannelAccounts(selectedChannelId.value, {
      current: pagination.current,
      size: pagination.size,
    })
  } catch {
    ElMessage.error('获取账号列表失败')
  }
}

// 渠道切换
function handleChannelChange(channelId: number | null): void {
  selectedChannelId.value = channelId
  pagination.current = 1
  if (channelId) {
    void fetchAccounts()
  }
}

// 搜索按钮
function handleSearch(): void {
  pagination.current = 1
  void fetchAccounts()
}

// 重置搜索条件
function handleReset(): void {
  searchForm.accountName = undefined
  pagination.current = 1
  pagination.size = 10
  void fetchAccounts()
}

// 新增
function handleAdd(): void {
  editingAccountId.value = null
  formDialogVisible.value = true
}

// 编辑
function handleEdit(row: AiChannelAccountVO): void {
  editingAccountId.value = row.id
  formDialogVisible.value = true
}

// 切换账号状态
async function handleStatusChange(row: AiChannelAccountVO): Promise<void> {
  if (!selectedChannelId.value) return
  try {
    const success = await channelStore.updateChannelAccountStatus(
      selectedChannelId.value,
      row.id,
      { status: row.status }
    )
    if (!success) throw new Error('failed')
    ElMessage.success('状态更新成功')
  } catch {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

// 删除账号
async function handleDelete(row: AiChannelAccountVO): Promise<void> {
  if (!selectedChannelId.value) return
  try {
    await ElMessageBox.confirm(`确定要删除账号 "${row.accountName}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const success = await channelStore.deleteChannelAccount(selectedChannelId.value, row.id)
    if (!success) throw new Error('failed')
    ElMessage.success('账号删除成功')
    void fetchAccounts()
  } catch {
    // 用户取消或删除失败
  }
}

// 表单提交成功后刷新列表
function handleFormSuccess(): void {
  void fetchAccounts()
}

onMounted(() => {
  void channelStore.fetchChannels()
})
</script>

<style scoped>
.channel-account-page {
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
