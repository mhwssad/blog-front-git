<template>
  <div class="audit-log-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="操作人ID" class="filter-item">
          <el-input-number
            v-model="searchForm.operatorUserId"
            :min="1"
            controls-position="right"
            class="filter-control"
          />
        </el-form-item>
        <el-form-item label="目标用户ID" class="filter-item">
          <el-input-number
            v-model="searchForm.targetUserId"
            :min="1"
            controls-position="right"
            class="filter-control"
          />
        </el-form-item>
        <el-form-item label="操作类型" class="filter-item">
          <el-input
            v-model="searchForm.operationType"
            clearable
            class="filter-control"
            placeholder="请输入操作类型"
          />
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button v-permission="'sys:audit:query'" type="primary" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <DataTable
      :data="auditLogStore.logs"
      :loading="auditLogStore.loading"
      :total="auditLogStore.total"
      :current-page="pagination.current"
      :page-size="pagination.size"
      :page-sizes="[10, 20, 50, 100]"
      :pagination-layout="paginationLayout"
      :compact="isCompactTable"
      title="审计日志列表"
      class="audit-table"
      @update:current-page="pagination.current = $event"
      @update:page-size="pagination.size = $event"
      @size-change="handleSizeChange"
      @page-change="handleCurrentChange"
    >
      <template #header-extra>
        <span class="card-header__meta">{{ auditLogStore.total }} 条</span>
      </template>

      <el-table-column prop="id" label="ID" min-width="70" align="center" />
      <el-table-column label="操作人" min-width="160" align="center" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="cell-stack">
            <span>{{ row.operatorUsername }}</span>
            <span class="cell-subtext">ID: {{ row.operatorUserId }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="目标用户" min-width="160" align="center" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="cell-stack">
            <span>{{ row.targetUsername || '-' }}</span>
            <span class="cell-subtext">ID: {{ row.targetUserId ?? '-' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="目标对象" min-width="140" align="center" show-overflow-tooltip>
        <template #default="{ row }">
          {{ formatTargetObject(row) }}
        </template>
      </el-table-column>
      <el-table-column label="操作类型" min-width="140" align="center" show-overflow-tooltip>
        <template #default="{ row }">
          <el-tag :type="getOperationTagType(row.operationTypeDesc || row.operationType)">
            {{ row.operationTypeDesc || row.operationType || '-' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="请求 IP" min-width="130" align="center" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.requestIp || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="MFA" min-width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="getMfaTagType(row.mfaPassed)" effect="light" size="small">
            {{ formatMfaPassed(row.mfaPassed) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="remark"
        label="备注"
        min-width="220"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column label="创建时间" min-width="160" align="center">
        <template #default="{ row }">
          {{ formatCreateTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        :min-width="isCompactTable ? 120 : 140"
        :fixed="isCompactTable ? false : 'right'"
        class-name="action-column"
        align="center"
      >
        <template #default="{ row }">
          <el-button
            v-permission="'sys:audit:query'"
            link
            type="primary"
            @click="handleViewDetail(row)"
          >
            详情
          </el-button>
        </template>
      </el-table-column>
    </DataTable>

    <AuditLogDetailDialog v-model:visible="detailVisible" :log="currentLog" />
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuditLogStore } from '@/stores'
import type { AuditLogVO } from '@/types/api-types'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useAdminPagination } from '@/composables/useAdminPagination'
import { formatCreateTime } from '@/utils'
import AuditLogDetailDialog from './components/AuditLogDetailDialog.vue'

const auditLogStore = useAuditLogStore()
const { isCompactTable, paginationLayout } = useContentAdmin()

const searchForm = reactive({
  operatorUserId: undefined as number | undefined,
  targetUserId: undefined as number | undefined,
  operationType: undefined as string | undefined,
})

const { pagination, fetch, handleSearch, handleSizeChange, handleCurrentChange } = useAdminPagination({
  fetchFn: auditLogStore.fetchLogs,
  buildParams: () => ({
    operatorUserId: searchForm.operatorUserId || undefined,
    targetUserId: searchForm.targetUserId || undefined,
    operationType: searchForm.operationType?.trim() || undefined,
  }),
  persistSizeKey: 'audit-log-page-size',
})

const detailVisible = ref(false)
const currentLog = ref<AuditLogVO | null>(null)

function getOperationTagType(value?: string): 'success' | 'primary' | 'warning' | 'danger' | 'info' {
  const text = value || ''
  if (text.includes('删除') || text.includes('拒绝') || text.includes('封禁') || text.includes('禁用')) {
    return 'danger'
  }
  if (text.includes('创建') || text.includes('通过') || text.includes('新增') || text.includes('启用')) {
    return 'success'
  }
  if (text.includes('更新') || text.includes('修改') || text.includes('审核')) {
    return 'warning'
  }
  return 'info'
}

function getMfaTagType(value?: number): 'success' | 'danger' | 'info' {
  if (value === 1) return 'success'
  if (value === 0) return 'danger'
  return 'info'
}

function formatMfaPassed(value?: number): string {
  if (value === 1) return '已通过'
  if (value === 0) return '未通过'
  return '-'
}

function formatTargetObject(row: AuditLogVO): string {
  if (row.targetTypeName && row.targetId !== undefined && row.targetId !== null) {
    return `${row.targetTypeName} #${row.targetId}`
  }
  if (row.targetTypeName) {
    return row.targetTypeName
  }
  if (row.targetId !== undefined && row.targetId !== null) {
    return `#${row.targetId}`
  }
  return '-'
}

function handleReset(): void {
  searchForm.operatorUserId = undefined
  searchForm.targetUserId = undefined
  searchForm.operationType = undefined
  pagination.current = 1
  pagination.size = 10
  void fetch()
}

async function handleViewDetail(row: AuditLogVO): Promise<void> {
  const detail = await auditLogStore.fetchLogById(row.id)
  if (!detail) {
    ElMessage.error('获取审计日志详情失败')
    return
  }

  currentLog.value = detail
  detailVisible.value = true
}

</script>

<style scoped>
.audit-log-page {
  padding: 0;
  max-width: 1680px;
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

.audit-table {
  width: 100%;
}

.audit-table :deep(.el-table__cell .cell) {
  text-align: center;
}

.audit-table :deep(.action-column) {
  border-left: 2px solid var(--el-border-color);
}

.cell-stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cell-subtext {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.2;
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
