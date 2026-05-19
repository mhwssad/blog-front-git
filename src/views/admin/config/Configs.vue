<template>
  <div class="config-management-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="配置名称" class="filter-item">
          <el-input
            v-model="searchForm.configName"
            class="filter-control"
            clearable
            placeholder="请输入配置名称"
          />
        </el-form-item>
        <el-form-item label="配置键" class="filter-item">
          <el-input
            v-model="searchForm.configKey"
            class="filter-control"
            clearable
            placeholder="请输入配置键"
          />
        </el-form-item>
        <el-form-item label="创建时间" class="filter-item filter-item--range">
          <el-date-picker
            v-model="createTimeRange"
            type="datetimerange"
            class="filter-control filter-control--range"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            range-separator="至"
          />
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button v-permission="'sys:config:query'" type="primary" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <DataTable
      :data="configStore.configs"
      :loading="configStore.loading"
      :total="configStore.total"
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :page-sizes="[10, 20, 50, 100]"
      :pagination-layout="paginationLayout"
      title="配置列表"
      :compact="isCompactTable"
      @page-change="fetchConfigs"
      @size-change="() => { pagination.current = 1; fetchConfigs() }"
    >
      <template #header-extra>
        <el-button v-permission="'sys:config:create'" type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增配置
        </el-button>
      </template>

      <el-table-column prop="id" label="ID" min-width="80" align="center" />
      <el-table-column
        prop="configName"
        label="配置名称"
        min-width="160"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column
        prop="configKey"
        label="配置键"
        min-width="200"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column
        prop="configValue"
        label="配置值"
        min-width="220"
        align="center"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ formatConfigPreview(row.configValue) }}
        </template>
      </el-table-column>
      <el-table-column label="系统配置" min-width="100" align="center">
        <template #default="{ row }">
          {{ formatSystemFlag(row.isSystem) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        :min-width="isCompactTable ? 160 : 220"
        :fixed="isCompactTable ? false : 'right'"
        class-name="action-column"
        align="center"
      >
        <template #default="{ row }">
          <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
            <el-button
              v-permission="'sys:config:query'"
              link
              type="primary"
              @click="handleViewDetail(row)"
            >
              查看详情
            </el-button>
            <el-button
              v-permission="'sys:config:update'"
              link
              type="primary"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-permission="'sys:config:delete'"
              link
              type="danger"
              :disabled="row.isSystem === 1"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </DataTable>

    <ConfigFormDialog
      v-model:visible="formDialogVisible"
      :config-id="editingConfigId"
      @success="handleFormSuccess"
    />

    <el-dialog
      v-model="valueDialogVisible"
      title="配置详情"
      width="560px"
      class="config-detail-dialog"
      destroy-on-close
      align-center
    >
      <template v-if="viewingConfig">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="ID">{{ viewingConfig.id }}</el-descriptions-item>
          <el-descriptions-item label="系统配置">
            {{ formatSystemFlag(viewingConfig.isSystem) }}
          </el-descriptions-item>
          <el-descriptions-item label="配置名称" :span="2">
            {{ viewingConfig.configName }}
          </el-descriptions-item>
          <el-descriptions-item label="配置键" :span="2">
            {{ viewingConfig.configKey }}
          </el-descriptions-item>
          <el-descriptions-item label="配置值" :span="2">
            <pre class="config-value-preview">{{ viewingConfig.configValue || '-' }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ viewingConfig.remark || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ viewingConfig.createTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ viewingConfig.updateTime || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </template>

      <template #footer>
        <el-button @click="valueDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { ConfigQueryRequest, SysConfigAdminVO } from '@/types/api-types'
import { useContentAdmin } from '@/composables/useContentAdmin'
import DataTable from '@/components/common/DataTable.vue'
import { useConfigStore } from '@/stores'
import { formatSystemFlag } from '@/utils'
import ConfigFormDialog from './components/ConfigFormDialog.vue'

const configStore = useConfigStore()

const searchForm = reactive<ConfigQueryRequest>({
  current: 1,
  size: 10,
  configName: undefined,
  configKey: undefined,
})

const createTimeRange = ref<[string, string] | []>([])

const pagination = reactive({
  current: 1,
  size: 10,
})

const formDialogVisible = ref(false)
const valueDialogVisible = ref(false)
const editingConfigId = ref<number | null>(null)
const viewingConfig = ref<SysConfigAdminVO | null>(null)

const { isCompactTable, paginationLayout } = useContentAdmin()

function formatConfigPreview(value: string): string {
  if (!value) {
    return '-'
  }

  return value.length > 48 ? `${value.slice(0, 48)}...` : value
}

async function fetchConfigs(): Promise<void> {
  const [createTimeStart, createTimeEnd] = createTimeRange.value

  try {
    await configStore.fetchConfigs({
      ...searchForm,
      current: pagination.current,
      size: pagination.size,
      createTimeStart: createTimeStart || undefined,
      createTimeEnd: createTimeEnd || undefined,
    })
  } catch {
    ElMessage.error('获取配置列表失败')
  }
}

function handleSearch(): void {
  pagination.current = 1
  void fetchConfigs()
}

function handleReset(): void {
  Object.assign(searchForm, {
    current: 1,
    size: 10,
    configName: undefined,
    configKey: undefined,
  })
  createTimeRange.value = []
  pagination.current = 1
  pagination.size = 10
  void fetchConfigs()
}

function handleAdd(): void {
  editingConfigId.value = null
  formDialogVisible.value = true
}

function handleEdit(row: SysConfigAdminVO): void {
  editingConfigId.value = row.id
  formDialogVisible.value = true
}

function handleViewDetail(row: SysConfigAdminVO): void {
  viewingConfig.value = row
  valueDialogVisible.value = true
}

async function handleDelete(row: SysConfigAdminVO): Promise<void> {
  if (row.isSystem === 1) {
    ElMessage.warning('系统配置不允许删除')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除配置 "${row.configName}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await configStore.deleteConfig(row.id)
    if (!success) {
      throw new Error('delete failed')
    }

    ElMessage.success('配置删除成功')
    void fetchConfigs()
  } catch {
    // 用户取消或删除失败
  }
}

function handleFormSuccess(): void {
  void fetchConfigs()
}

onMounted(() => {
  void fetchConfigs()
})
</script>

<style scoped>
.config-management-page {
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

.filter-item--range {
  margin-right: 0;
}

.filter-control {
  width: 220px;
}

.filter-control--range {
  width: 360px;
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

.config-value-preview {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 60vh;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .filter-item,
  .search-actions {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
  }

  .filter-control,
  .filter-control--range {
    width: 100%;
  }

  .search-actions :deep(.el-form-item__content) {
    width: 100%;
    justify-content: center;
  }
}
</style>
