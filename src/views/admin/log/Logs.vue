<template>
  <div class="log-management-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="模块名称" class="filter-item">
          <el-input
            v-model="searchForm.module"
            class="filter-control"
            clearable
            placeholder="请输入模块名称"
          />
        </el-form-item>
        <el-form-item label="创建人" class="filter-item">
          <el-input
            v-model="searchForm.createBy"
            class="filter-control"
            clearable
            placeholder="请输入创建人"
          />
        </el-form-item>
        <template v-if="searchExpanded">
          <el-form-item label="请求方法" class="filter-item">
            <el-select
              v-model="searchForm.requestMethod"
              class="filter-control"
              clearable
              placeholder="请选择请求方法"
            >
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
              <el-option label="PUT" value="PUT" />
              <el-option label="DELETE" value="DELETE" />
            </el-select>
          </el-form-item>
          <el-form-item label="请求地址" class="filter-item">
            <el-input
              v-model="searchForm.requestUri"
              class="filter-control"
              clearable
              placeholder="请输入请求地址"
            />
          </el-form-item>
          <el-form-item label="IP" class="filter-item">
            <el-input
              v-model="searchForm.ip"
              class="filter-control"
              clearable
              placeholder="请输入IP地址"
            />
          </el-form-item>
          <el-form-item label="创建时间" class="filter-item filter-item--range">
            <el-date-picker
              v-model="timeRange"
              type="datetimerange"
              class="filter-control filter-control--range"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm:ss"
              range-separator="至"
            />
          </el-form-item>
        </template>
        <el-form-item class="search-actions">
          <el-button v-permission="'sys:log:query'" type="primary" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button v-permission="'sys:log:clean'" type="warning" plain @click="handleClean">
            按条件清理
          </el-button>
          <el-button link type="primary" @click="searchExpanded = !searchExpanded">
            {{ searchExpanded ? '收起' : '更多' }}
            <el-icon class="expand-icon" :class="{ 'is-expanded': searchExpanded }">
              <ArrowDown />
            </el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>日志列表</span>
          <span class="card-header__meta">{{ logStore.total }} 条</span>
        </div>
      </template>

      <el-table
        v-loading="logStore.loading"
        :data="logStore.logs"
        :size="isCompactTable ? 'small' : 'default'"
        table-layout="auto"
        class="log-table"
        border
        stripe
      >
        <el-table-column prop="id" label="ID" min-width="60" align="center" />
        <el-table-column
          prop="module"
          label="模块"
          min-width="100"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="description"
          label="操作描述"
          min-width="180"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="username"
          label="操作人"
          min-width="90"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column label="请求方法" min-width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getMethodTagType(row.requestMethod)" effect="light" size="small">
              {{ row.requestMethod || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="请求地址"
          min-width="180"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ row.requestUrl || row.requestUri || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="ip"
          label="IP"
          min-width="120"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="location"
          label="地理位置"
          min-width="140"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column label="执行耗时" min-width="90" align="center">
          <template #default="{ row }">
            {{ formatExecuteTime(row.executeTime) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="light" size="small">
              {{ formatLogStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160" align="center">
          <template #default="{ row }">
            {{ formatCreateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          :min-width="isCompactTable ? 140 : 180"
          :fixed="isCompactTable ? false : 'right'"
          class-name="action-column"
          align="center"
        >
          <template #default="{ row }">
            <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
              <el-button
                v-permission="'sys:log:query'"
                link
                type="primary"
                @click="handleViewDetail(row)"
              >
                详情
              </el-button>
              <el-button
                v-permission="'sys:log:delete'"
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

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="logStore.total"
          :page-sizes="[10, 20, 50, 100]"
          :layout="paginationLayout"
          :small="isCompactTable"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <LogDetailDialog v-model:visible="detailDialogVisible" :log="currentLog" />
  </div>
</template>

/** * 日志管理页面（后台） * @description
后台系统日志查询与管理，支持按模块、创建人、时间范围筛选，查看详情和清理日志 * @module
admin/log/Logs * @see api/sys/log.ts */
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import type { LogQueryRequest, SysLogAdminVO } from '@/types/api-types'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useLogStore } from '@/stores'
import { formatCreateTime, formatExecuteTime, formatLogStatus } from '@/utils'
import LogDetailDialog from './components/LogDetailDialog.vue'

const logStore = useLogStore()

const searchForm = reactive<LogQueryRequest>({
  current: 1,
  size: 10,
  module: undefined,
  createBy: undefined,
  requestMethod: undefined,
  requestUri: undefined,
  ip: undefined,
  createTimeStart: undefined,
  createTimeEnd: undefined,
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const timeRange = ref<[string, string] | []>([])
const searchExpanded = ref(false)
const detailDialogVisible = ref(false)
const currentLog = ref<SysLogAdminVO | null>(null)

const { isCompactTable, paginationLayout } = useContentAdmin()

function getMethodTagType(method?: string): 'success' | 'primary' | 'warning' | 'danger' | 'info' {
  switch (method || '') {
    case 'GET': return 'success'
    case 'POST': return 'primary'
    case 'PUT': return 'warning'
    case 'DELETE': return 'danger'
    default: return 'info'
  }
}

async function fetchLogs(): Promise<void> {
  const [createTimeStart, createTimeEnd] = timeRange.value

  try {
    await logStore.fetchLogs({
      current: pagination.current,
      size: pagination.size,
      module: searchForm.module || undefined,
      createBy: searchForm.createBy || undefined,
      requestMethod: searchForm.requestMethod || undefined,
      requestUri: searchForm.requestUri || undefined,
      ip: searchForm.ip || undefined,
      createTimeStart: createTimeStart || undefined,
      createTimeEnd: createTimeEnd || undefined,
    })
  } catch {
    ElMessage.error('获取日志列表失败')
  }
}

function handleSearch(): void {
  pagination.current = 1
  void fetchLogs()
}

function handleReset(): void {
  Object.assign(searchForm, {
    current: 1,
    size: 10,
    module: undefined,
    createBy: undefined,
    requestMethod: undefined,
    requestUri: undefined,
    ip: undefined,
    createTimeStart: undefined,
    createTimeEnd: undefined,
  })
  timeRange.value = []
  pagination.current = 1
  pagination.size = 10
  void fetchLogs()
}

function handleSizeChange(size: number): void {
  pagination.size = size
  pagination.current = 1
  void fetchLogs()
}

function handleCurrentChange(current: number): void {
  pagination.current = current
  void fetchLogs()
}

async function handleViewDetail(row: SysLogAdminVO): Promise<void> {
  const detail = await logStore.fetchLogById(row.id)
  if (!detail) {
    ElMessage.error('获取日志详情失败')
    return
  }

  currentLog.value = detail
  detailDialogVisible.value = true
}

async function handleDelete(row: SysLogAdminVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除日志 #${row.id} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await logStore.deleteLog(row.id)
    if (!success) {
      throw new Error('delete failed')
    }

    ElMessage.success('日志删除成功')
    void fetchLogs()
  } catch {
    // 用户取消或删除失败
  }
}

async function handleClean(): Promise<void> {
  const [createTimeStart, createTimeEnd] = timeRange.value

  try {
    await ElMessageBox.confirm('确定要按当前条件清理日志吗？此操作不可恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const cleaned = await logStore.cleanLogs({
      module: searchForm.module || undefined,
      requestMethod: searchForm.requestMethod || undefined,
      requestUri: searchForm.requestUri || undefined,
      ip: searchForm.ip || undefined,
      createBy: searchForm.createBy || undefined,
      createTimeStart: createTimeStart || undefined,
      createTimeEnd: createTimeEnd || undefined,
    })

    if (cleaned === null) {
      throw new Error('clean failed')
    }

    ElMessage.success(`日志清理成功，共清理 ${cleaned} 条`)
    void fetchLogs()
  } catch {
    // 用户取消或清理失败
  }
}

onMounted(() => {
  void fetchLogs()
})
</script>

<style scoped>
.log-management-page {
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

.filter-item--range {
  margin-right: 0;
}

.filter-control {
  width: 220px;
}

.filter-control--range {
  width: 360px;
}

.log-table :deep(.action-column) {
  border-left: 2px solid var(--el-border-color);
}

.search-actions {
  margin-left: 0;
  margin-right: 0;
}

.expand-icon {
  transition: transform 0.3s;
  margin-left: 2px;
}

.expand-icon.is-expanded {
  transform: rotate(180deg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}

.card-header__meta {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.log-table {
  width: 100%;
}

.log-table :deep(.el-table__cell .cell) {
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
