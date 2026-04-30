<template>
  <div class="config-management-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="配置名称" class="filter-item">
          <el-input v-model="searchForm.configName" class="filter-control" clearable placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="配置键" class="filter-item">
          <el-input v-model="searchForm.configKey" class="filter-control" clearable placeholder="请输入配置键" />
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button v-permission="'sys:config:query'" type="primary" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>配置列表</span>
          <el-button v-permission="'sys:config:create'" type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增配置
          </el-button>
        </div>
      </template>

      <div ref="tableWrapperRef" class="table-wrapper">
        <el-table
          v-loading="configStore.loading"
          :data="configStore.configs"
          :height="tableHeight"
          :size="isCompactTable ? 'small' : 'default'"
          table-layout="auto"
          class="config-table"
          border
          stripe
        >
          <el-table-column prop="id" label="ID" min-width="80" align="center" />
          <el-table-column prop="configName" label="配置名称" min-width="160" align="center" show-overflow-tooltip />
          <el-table-column prop="configKey" label="配置键" min-width="200" align="center" show-overflow-tooltip />
          <el-table-column prop="configValue" label="配置值" min-width="220" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatConfigPreview(row.configValue) }}
            </template>
          </el-table-column>
          <el-table-column label="系统配置" min-width="100" align="center">
            <template #default="{ row }">
              {{ formatSystemFlag(row.isSystem) }}
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="180" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatOptionalText(row.remark) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" min-width="180" align="center">
            <template #default="{ row }">
              {{ formatCreateTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            :min-width="isCompactTable ? 160 : 220"
            :fixed="isCompactTable ? false : 'right'"
            align="center"
          >
            <template #default="{ row }">
              <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
                <el-button v-permission="'sys:config:query'" link type="primary" @click="handleViewValue(row)">
                  查看值
                </el-button>
                <el-button v-permission="'sys:config:update'" link type="primary" @click="handleEdit(row)">
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
        </el-table>
      </div>

      <div ref="paginationRef" class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="configStore.total"
          :page-sizes="[10, 20, 50, 100]"
          :layout="paginationLayout"
          :small="isCompactTable"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <ConfigFormDialog v-model:visible="formDialogVisible" :config-id="editingConfigId" @success="handleFormSuccess" />

    <el-dialog
      v-model="valueDialogVisible"
      title="配置值"
      width="600px"
      class="config-value-dialog"
      :close-on-click-modal="false"
      align-center
      center
    >
      <pre class="config-value-preview">{{ previewConfigValue }}</pre>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { ConfigQueryRequest, SysConfigAdminVO } from '@/types/api-types'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useConfigStore } from '@/stores'
import { formatCreateTime, formatOptionalText, formatSystemFlag } from '@/utils'
import ConfigFormDialog from './components/ConfigFormDialog.vue'

const configStore = useConfigStore()

const searchForm = reactive<ConfigQueryRequest>({
  current: 1,
  size: 10,
  configName: undefined,
  configKey: undefined,
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const formDialogVisible = ref(false)
const valueDialogVisible = ref(false)
const editingConfigId = ref<number | null>(null)
const previewConfigValue = ref('')

const { tableWrapperRef, paginationRef, tableHeight, isCompactTable, paginationLayout } =
  useContentAdmin({
    minHeight: 360,
    bottomOffset: 16,
  })

function formatConfigPreview(value: string): string {
  if (!value) {
    return '-'
  }

  return value.length > 48 ? `${value.slice(0, 48)}...` : value
}

async function fetchConfigs(): Promise<void> {
  try {
    await configStore.fetchConfigs({
      ...searchForm,
      current: pagination.current,
      size: pagination.size,
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
  pagination.current = 1
  pagination.size = 10
  void fetchConfigs()
}

function handleSizeChange(size: number): void {
  pagination.size = size
  pagination.current = 1
  void fetchConfigs()
}

function handleCurrentChange(current: number): void {
  pagination.current = current
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

function handleViewValue(row: SysConfigAdminVO): void {
  previewConfigValue.value = row.configValue || '-'
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

.table-wrapper {
  min-height: 0;
}

.config-table {
  width: 100%;
}

.config-table :deep(.el-table__cell .cell) {
  text-align: center;
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

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
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

  .filter-control {
    width: 100%;
  }

  .search-actions :deep(.el-form-item__content) {
    width: 100%;
    justify-content: center;
  }
}
</style>
