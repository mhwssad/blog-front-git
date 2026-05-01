<template>
  <div class="report-list-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="对象类型">
          <el-select
            v-model="query.reportTargetType"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option label="文章" value="article" />
            <el-option label="评论" value="comment" />
            <el-option label="消息" value="chat_message" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px">
            <el-option label="待处理" :value="0" />
            <el-option label="处理中" :value="1" />
            <el-option label="已处理" :value="2" />
            <el-option label="已驳回" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="举报时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>举报列表</span>
        </div>
      </template>
      <div ref="tableWrapperRef">
        <el-table
          :data="tableData"
          v-loading="loading"
          :height="tableHeight"
          :size="isCompactTable ? 'small' : 'default'"
          border
          stripe
        >
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="reportTargetType" label="对象类型" min-width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small">{{ targetTypeLabel(row.reportTargetType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reportTargetId" label="对象ID" min-width="100" align="center" />
          <el-table-column prop="reporterUsername" label="举报人" min-width="120" align="center" />
          <el-table-column prop="reasonCode" label="原因" min-width="200" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.reasonCode }}
              <span v-if="row.reasonDetail" style="color: var(--el-text-color-secondary)">
                ({{ row.reasonDetail }})
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" min-width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reportedAt" label="举报时间" min-width="180" align="center">
            <template #default="{ row }">
              {{ formatAiDate(row.reportedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="140" align="center">
            <template #default="{ row }">
              <template v-if="row.status === 0">
                <el-button link type="primary" @click="handleTake(row)">接手</el-button>
                <el-button link type="primary" @click="openProcessDialog(row)">处理</el-button>
                <el-button link type="danger" @click="handleReject(row)">驳回</el-button>
              </template>
              <template v-else-if="row.status === 1">
                <el-button link type="primary" @click="openProcessDialog(row)">处理</el-button>
                <el-button link type="danger" @click="handleReject(row)">驳回</el-button>
              </template>
              <template v-else>
                <el-button link type="primary" @click="handleView(row)">查看</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div ref="paginationRef" class="pagination-area">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          :layout="paginationLayout"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="processDialogVisible" :title="isViewMode ? '举报详情' : '处理举报'" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="举报人">
          {{ currentRow.reporterUsername }}
        </el-descriptions-item>
        <el-descriptions-item label="举报时间">
          {{ formatAiDate(currentRow.reportedAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="对象类型">
          {{ targetTypeLabel(currentRow.reportTargetType) }}
        </el-descriptions-item>
        <el-descriptions-item label="对象ID">
          {{ currentRow.reportTargetId }}
        </el-descriptions-item>
        <el-descriptions-item label="举报原因" :span="2">
          {{ currentRow.reasonCode }}
          <span v-if="currentRow.reasonDetail"> - {{ currentRow.reasonDetail }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRow.handlerUsername" label="处理人">
          {{ currentRow.handlerUsername }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRow.handledAt" label="处理时间">
          {{ formatAiDate(currentRow.handledAt) }}
        </el-descriptions-item>
      </el-descriptions>

      <div v-if="handleLogs.length" style="margin-top: 16px">
        <div style="font-weight: 500; margin-bottom: 8px">处理日志</div>
        <el-timeline>
          <el-timeline-item
            v-for="log in handleLogs"
            :key="log.id"
            :timestamp="formatAiDate(log.createdAt)"
            placement="top"
          >
            <div>
              <span>{{ log.operatorUsername }}</span>
              <span style="color: var(--el-text-color-secondary); margin: 0 8px">
                {{ log.actionType }}
              </span>
              <el-tag v-if="log.actionResult" size="small" type="info">{{ log.actionResult }}</el-tag>
            </div>
            <div v-if="log.actionRemark" style="color: var(--el-text-color-secondary); font-size: 13px">
              {{ log.actionRemark }}
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <div v-if="!isViewMode" style="margin-top: 16px">
        <el-form label-width="100px">
          <el-form-item label="处理结果">
            <el-radio-group v-model="processForm.resultType">
              <el-radio value="delete_content">删除内容</el-radio>
              <el-radio value="revoke_message">撤销消息</el-radio>
              <el-radio value="mute_user">禁言用户</el-radio>
              <el-radio value="ban_user">封禁账号</el-radio>
              <el-radio value="record_only">仅记录</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="processForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入处理备注"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="processDialogVisible = false">关闭</el-button>
        <el-button
          v-if="!isViewMode"
          type="primary"
          :loading="submitLoading"
          @click="confirmProcess"
        >
          确认处理
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reportSysApi } from '@/api/sys/report'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { formatAiDate } from '@/utils'
import type {
  ReportAdminVO,
  ReportHandleLogVO,
} from '@/types/api-types'

const query = reactive({
  reportTargetType: '' as string,
  status: undefined as number | undefined,
})

const dateRange = ref<[string, string] | null>(null)

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const tableData = ref<ReportAdminVO[]>([])
const loading = ref(false)
const submitLoading = ref(false)
const processDialogVisible = ref(false)
const isViewMode = ref(false)
const currentRow = ref<ReportAdminVO>({} as ReportAdminVO)
const handleLogs = ref<ReportHandleLogVO[]>([])

const processForm = reactive({
  resultType: 'delete_content' as string,
  remark: '',
})

const { tableWrapperRef, paginationRef, tableHeight, paginationLayout, isCompactTable } =
  useContentAdmin({
    minHeight: 360,
    bottomOffset: 28,
  })

function targetTypeLabel(type: string) {
  const map: Record<string, string> = {
    article: '文章',
    comment: '评论',
    chat_message: '消息',
  }
  return map[type] || type
}

function statusTagType(status: number): 'info' | 'warning' | 'success' | 'danger' | 'primary' {
  const map: Record<number, 'info' | 'warning' | 'success' | 'danger' | 'primary'> = {
    0: 'warning',
    1: 'primary',
    2: 'success',
    3: 'info',
  }
  return map[status] ?? 'info'
}

function statusLabel(status: number) {
  const map: Record<number, string> = {
    0: '待处理',
    1: '处理中',
    2: '已处理',
    3: '已驳回',
  }
  return map[status] ?? String(status)
}

async function fetchList() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      current: pagination.current,
      size: pagination.size,
    }
    if (query.reportTargetType) {
      params.reportTargetType = query.reportTargetType
    }
    if (query.status !== undefined && query.status !== null) {
      params.status = query.status
    }
    if (dateRange.value) {
      params.reportedStart = dateRange.value[0]
      params.reportedEnd = dateRange.value[1]
    }

    const res = await reportSysApi.getReports(params as Parameters<typeof reportSysApi.getReports>[0])
    const page = res.data.data
    tableData.value = page?.records ?? []
    pagination.total = page?.total ?? 0
  } catch {
    ElMessage.error('获取举报列表失败')
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  pagination.current = 1
  void fetchList()
}

function handleReset() {
  query.reportTargetType = ''
  query.status = undefined
  dateRange.value = null
  pagination.current = 1
  pagination.size = 10
  void fetchList()
}

function handleSizeChange() {
  pagination.current = 1
  void fetchList()
}

function handleCurrentChange() {
  void fetchList()
}

async function handleTake(row: ReportAdminVO) {
  try {
    await reportSysApi.takeReport(row.id)
    ElMessage.success('已接手该举报')
    void fetchList()
  } catch {
    ElMessage.error('接手失败')
  }
}

async function openProcessDialog(row: ReportAdminVO) {
  try {
    const detail = await reportSysApi.getReportById(row.id)
    currentRow.value = detail.data.data
  } catch {
    currentRow.value = { ...row }
  }
  isViewMode.value = false
  processForm.resultType = 'delete_content'
  processForm.remark = ''
  handleLogs.value = []
  try {
    handleLogs.value = (await reportSysApi.getReportLogs(row.id)).data.data ?? []
  } catch {
    // ignore logs fetch error
  }
  processDialogVisible.value = true
}

async function handleView(row: ReportAdminVO) {
  try {
    const detail = await reportSysApi.getReportById(row.id)
    currentRow.value = detail.data.data
  } catch {
    currentRow.value = { ...row }
  }
  isViewMode.value = true
  handleLogs.value = []
  try {
    handleLogs.value = (await reportSysApi.getReportLogs(row.id)).data.data ?? []
  } catch {
    // ignore logs fetch error
  }
  processDialogVisible.value = true
}

async function confirmProcess() {
  submitLoading.value = true
  try {
    await reportSysApi.handleReport(currentRow.value.id, {
      resultType: processForm.resultType,
      remark: processForm.remark || undefined,
    })
    ElMessage.success('处理完成')
    processDialogVisible.value = false
    void fetchList()
  } catch {
    ElMessage.error('处理失败')
  } finally {
    submitLoading.value = false
  }
}

async function handleReject(row: ReportAdminVO) {
  try {
    const { value } = await ElMessageBox.prompt('请输入驳回备注（可选）', '驳回举报', {
      confirmButtonText: '确定驳回',
      cancelButtonText: '取消',
      inputPlaceholder: '驳回原因...',
    })
    await reportSysApi.rejectReport(row.id, {
      remark: value || undefined,
    })
    ElMessage.success('已驳回该举报')
    void fetchList()
  } catch {
    // user cancelled or API error
  }
}

onMounted(() => {
  void fetchList()
})
</script>

<style scoped>
.report-list-page {
  padding: 20px;
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

.content-preview {
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  padding: 16px;
  max-height: 200px;
  overflow-y: auto;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
}
</style>
