<template>
  <div class="report-list-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline class="search-form">
        <el-form-item label="对象类型" class="filter-item">
          <el-select
            v-model="query.reportTargetType"
            placeholder="全部"
            clearable
            class="filter-control"
          >
            <el-option label="文章" value="article" />
            <el-option label="评论" value="comment" />
            <el-option label="消息" value="chat_message" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" class="filter-item">
          <el-select v-model="query.status" placeholder="全部" clearable class="filter-control">
            <el-option label="待处理" :value="0" />
            <el-option label="处理中" :value="1" />
            <el-option label="已处理" :value="2" />
            <el-option label="已驳回" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="举报时间" class="filter-item filter-item--range">
          <el-date-picker
            v-model="dateRange"
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
          <el-button v-permission="'sys:report:query'" type="primary" @click="handleQuery">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>举报列表</span>
          <span class="card-header__meta">{{ pagination.total }} 条</span>
        </div>
      </template>

      <el-table
        :data="tableData"
        v-loading="loading"
        :size="isCompactTable ? 'small' : 'default'"
        table-layout="auto"
        border
        stripe
      >
        <el-table-column prop="id" label="ID" min-width="80" align="center" />
        <el-table-column label="对象类型" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ targetTypeLabel(row.reportTargetType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reportTargetId" label="对象ID" min-width="80" align="center" />
        <el-table-column prop="reporterUsername" label="举报人" min-width="100" align="center" />
        <el-table-column
          label="原因"
          min-width="200"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ row.reasonCode }}
            <span v-if="row.reasonDetail" style="color: var(--el-text-color-secondary)">
              ({{ row.reasonDetail }})
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="举报时间" min-width="160" align="center">
          <template #default="{ row }">{{ row.reportedAt || '-' }}</template>
        </el-table-column>
        <el-table-column
          label="操作"
          :min-width="isCompactTable ? 140 : 200"
          :fixed="isCompactTable ? false : 'right'"
          class-name="action-column"
          align="center"
        >
          <template #default="{ row }">
            <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
              <el-button link type="primary" @click="handleView(row)">详情</el-button>
              <el-button
                v-if="row.status === 0"
                v-permission="'sys:report:handle'"
                link
                type="primary"
                @click="handleTake(row)"
              >
                接手
              </el-button>
              <el-button
                v-if="row.status <= 1"
                v-permission="'sys:report:handle'"
                link
                type="success"
                @click="openProcessDialog(row)"
              >
                处理
              </el-button>
              <el-button
                v-if="row.status <= 1"
                v-permission="'sys:report:handle'"
                link
                type="danger"
                @click="handleReject(row)"
              >
                驳回
              </el-button>
              <el-button
                v-if="row.status === 1"
                v-permission="'sys:report:handle'"
                link
                type="warning"
                @click="handleOverride(row)"
              >
                接管
              </el-button>
              <el-button
                v-if="row.status >= 2 && row.resultType"
                v-permission="'sys:report:handle'"
                link
                type="primary"
                @click="handleEditProcess(row)"
              >
                修改处理
              </el-button>
              <el-button
                v-if="row.status >= 2"
                v-permission="'sys:report:repair'"
                link
                type="warning"
                @click="handleRepair(row)"
              >
                修复
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          :layout="paginationLayout"
          :small="isCompactTable"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="processDialogVisible"
      :title="isViewMode ? '举报详情' : '处理举报'"
      width="640px"
      align-center
    >
      <el-descriptions v-if="currentRow" :column="2" border size="small">
        <el-descriptions-item label="举报人">{{ currentRow.reporterUsername }}</el-descriptions-item>
        <el-descriptions-item label="举报时间">{{ currentRow.reportedAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="对象类型">
          {{ targetTypeLabel(currentRow.reportTargetType) }}
        </el-descriptions-item>
        <el-descriptions-item label="对象ID">{{ currentRow.reportTargetId }}</el-descriptions-item>
        <el-descriptions-item label="举报原因" :span="2">
          {{ currentRow.reasonCode }}
          <span v-if="currentRow.reasonDetail"> - {{ currentRow.reasonDetail }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(currentRow.status)" size="small">
            {{ statusLabel(currentRow.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRow.resultType" label="处理结果">
          {{ resultTypeLabel(currentRow.resultType) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRow.handlerUsername" label="处理人">
          {{ currentRow.handlerUsername }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRow.handledAt" label="处理时间">
          {{ currentRow.handledAt }}
        </el-descriptions-item>
      </el-descriptions>

      <div v-if="handleLogs.length" style="margin-top: 16px">
        <div style="font-weight: 500; margin-bottom: 8px">处理日志</div>
        <el-timeline>
          <el-timeline-item
            v-for="log in handleLogs"
            :key="log.id"
            :timestamp="log.createdAt"
            placement="top"
          >
            <div>
              <span>{{ log.operatorUsername }}</span>
              <span style="color: var(--el-text-color-secondary); margin: 0 8px">
                {{ actionTypeLabel(log.actionType) }}
              </span>
              <el-tag v-if="log.actionResult" size="small" type="info">
                {{ log.actionResult }}
              </el-tag>
            </div>
            <div
              v-if="log.actionRemark"
              style="color: var(--el-text-color-secondary); font-size: 13px"
            >
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
              <el-radio value="revoke_message">撤回消息</el-radio>
              <el-radio value="mute_user">禁言用户</el-radio>
              <el-radio value="ban_user">封禁账号</el-radio>
              <el-radio value="record_only">仅记录</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="处罚类型">
            <el-select v-model="processForm.punishmentType" class="filter-control" clearable>
              <el-option
                v-for="opt in punishmentOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
          <template v-if="processForm.resultType === 'mute_user'">
            <el-form-item label="会话ID">
              <el-input
                v-model.number="processForm.conversationId"
                placeholder="举报消息所属会话ID"
                style="width: 200px"
                clearable
              />
            </el-form-item>
            <el-form-item label="禁言范围">
              <el-select
                v-model="processForm.muteScope"
                placeholder="请选择禁言范围"
                style="width: 200px"
              >
                <el-option label="全局禁言" value="global" />
                <el-option label="大厅禁言" value="lobby" />
                <el-option label="主题频道" value="topic_channel" />
                <el-option label="群组" value="group" />
              </el-select>
            </el-form-item>
            <el-form-item label="禁言截止">
              <el-date-picker
                v-model="processForm.muteUntil"
                type="datetime"
                placeholder="选择禁言截止时间"
                style="width: 220px"
              />
            </el-form-item>
          </template>
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

    <el-dialog v-model="repairVisible" title="修复举报状态" width="480px" align-center>
      <el-form label-width="100px">
        <el-form-item label="目标状态">
          <el-select v-model="repairForm.targetStatus" style="width: 100%">
            <el-option label="待处理" :value="0" />
            <el-option label="处理中" :value="1" />
            <el-option label="已处理" :value="2" />
            <el-option label="已驳回" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="repairForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入修复原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="repairVisible = false">取消</el-button>
        <el-button type="primary" :loading="repairLoading" @click="confirmRepair">确认修复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useReportStore } from '@/stores'
import type { ReportAdminVO, ReportHandleLogVO, ReportHandleRequest } from '@/types/api-types'

const punishmentOptions = computed(() => {
  const map: Record<string, { value: string; label: string }[]> = {
    delete_content: [{ value: 'content_delete', label: '内容删除' }],
    revoke_message: [{ value: 'message_revoke', label: '消息撤回' }],
    mute_user: [
      { value: 'mute', label: '禁言' },
    ],
    ban_user: [{ value: 'ban', label: '封禁' }],
    record_only: [{ value: 'none', label: '无处罚' }],
  }
  return map[processForm.resultType] ?? []
})

const reportStore = useReportStore()
const { paginationLayout, isCompactTable } = useContentAdmin()

const query = reactive({
  reportTargetType: '' as string,
  status: undefined as number | undefined,
})

const dateRange = ref<[string, string] | []>([])

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
const currentRow = ref<ReportAdminVO | null>(null)
const handleLogs = ref<ReportHandleLogVO[]>([])

const processForm = reactive({
  resultType: 'delete_content' as string,
  punishmentType: '' as string,
  remark: '',
  conversationId: undefined as number | undefined,
  muteScope: undefined as 'global' | 'lobby' | 'topic_channel' | 'group' | undefined,
  muteUntil: null as Date | null,
})

function targetTypeLabel(type: string): string {
  const map: Record<string, string> = {
    article: '文章',
    comment: '评论',
    chat_message: '消息',
  }
  return map[type] || type
}

function resultTypeLabel(type: string): string {
  const map: Record<string, string> = {
    delete_content: '删除内容',
    revoke_message: '撤回消息',
    mute_user: '禁言用户',
    ban_user: '封禁账号',
    record_only: '仅记录',
  }
  return map[type] || type
}

function actionTypeLabel(type: string): string {
  const map: Record<string, string> = {
    claim: '认领',
    handle: '处理',
    reject: '驳回',
    override: '接管',
    create: '提交',
  }
  return map[type] || type
}

function statusTagType(status: number): 'info' | 'warning' | 'success' | 'danger' {
  const map: Record<number, 'info' | 'warning' | 'success' | 'danger'> = {
    0: 'warning',
    1: 'info',
    2: 'success',
    3: 'danger',
  }
  return map[status] ?? 'info'
}

function statusLabel(status: number): string {
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
    await reportStore.fetchReports({
      current: pagination.current,
      size: pagination.size,
      reportTargetType: query.reportTargetType || undefined,
      status: query.status,
      reportedStart: dateRange.value[0] || undefined,
      reportedEnd: dateRange.value[1] || undefined,
    })
    tableData.value = reportStore.reports
    pagination.total = reportStore.total
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
  dateRange.value = []
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
  const success = await reportStore.takeReport(row.id)
  if (success) {
    ElMessage.success('已接手该举报')
    void fetchList()
  } else {
    ElMessage.error('接手失败')
  }
}

async function openProcessDialog(row: ReportAdminVO) {
  const detail = await reportStore.getReportById(row.id)
  currentRow.value = detail ?? { ...row }
  isViewMode.value = false
  processForm.resultType = 'delete_content'
  processForm.punishmentType = ''
  processForm.remark = ''
  processForm.conversationId = undefined
  processForm.muteScope = undefined
  processForm.muteUntil = null
  handleLogs.value = await reportStore.getReportLogs(row.id)
  processDialogVisible.value = true
}

async function handleEditProcess(row: ReportAdminVO) {
  try {
    await ElMessageBox.confirm('该举报已处理，确定要修改处理结果吗？', '修改处理', {
      confirmButtonText: '确定修改',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const detail = await reportStore.getReportById(row.id)
  currentRow.value = detail ?? { ...row }
  isViewMode.value = false
  processForm.resultType = currentRow.value.resultType || 'delete_content'
  processForm.punishmentType = ''
  processForm.remark = ''
  processForm.conversationId = undefined
  processForm.muteScope = undefined
  processForm.muteUntil = null
  handleLogs.value = await reportStore.getReportLogs(row.id)
  processDialogVisible.value = true
}

async function handleView(row: ReportAdminVO) {
  const detail = await reportStore.getReportById(row.id)
  currentRow.value = detail ?? { ...row }
  isViewMode.value = true
  handleLogs.value = await reportStore.getReportLogs(row.id)
  processDialogVisible.value = true
}

async function confirmProcess() {
  submitLoading.value = true
  try {
    const data: ReportHandleRequest = {
      resultType: processForm.resultType,
      punishmentType: processForm.punishmentType || undefined,
      remark: processForm.remark || undefined,
    }

    if (processForm.resultType === 'mute_user') {
      if (processForm.conversationId) {
        data.conversationId = processForm.conversationId
      }
      if (processForm.muteScope) {
        data.muteScope = processForm.muteScope
      }
      if (processForm.muteUntil) {
        data.muteUntil = processForm.muteUntil.toISOString()
      }
    }

    if (!currentRow.value) return
    const success = await reportStore.handleReport(currentRow.value.id, data)
    if (success) {
      ElMessage.success('处理完成')
      processDialogVisible.value = false
      void fetchList()
    } else {
      ElMessage.error('处理失败')
    }
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
    const success = await reportStore.rejectReport(row.id, {
      remark: value || undefined,
    })
    if (success) {
      ElMessage.success('已驳回该举报')
      void fetchList()
    } else {
      ElMessage.error('驳回失败')
    }
  } catch {
    // user cancelled
  }
}

async function handleOverride(row: ReportAdminVO) {
  try {
    await ElMessageBox.confirm('确定要接管该举报的处理吗？', '接管举报', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const success = await reportStore.overrideReport(row.id)
    if (success) {
      ElMessage.success('已接管该举报')
      void fetchList()
    } else {
      ElMessage.error('接管操作失败')
    }
  } catch {
    // user cancelled
  }
}

const repairVisible = ref(false)
const repairLoading = ref(false)
const repairRow = ref<ReportAdminVO | null>(null)
const repairForm = reactive({
  targetStatus: 0 as 0 | 1 | 2 | 3,
  remark: '',
})

function handleRepair(row: ReportAdminVO) {
  repairRow.value = row
  repairForm.targetStatus = row.status as 0 | 1 | 2 | 3
  repairForm.remark = ''
  repairVisible.value = true
}

async function confirmRepair() {
  if (!repairRow.value) return
  try {
    await ElMessageBox.confirm('确定要修复该举报的状态吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  repairLoading.value = true
  try {
    const success = await reportStore.repairReport(repairRow.value.id, {
      targetStatus: repairForm.targetStatus,
      remark: repairForm.remark || undefined,
    })
    if (success) {
      ElMessage.success('举报状态已修复')
      repairVisible.value = false
      void fetchList()
    } else {
      ElMessage.error('修复操作失败')
    }
  } finally {
    repairLoading.value = false
  }
}

onMounted(() => {
  void fetchList()
})
</script>

<style scoped>
.report-list-page {
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
  width: 200px;
}

.filter-control--range {
  width: 360px;
}

.search-actions {
  margin-left: 0;
  margin-right: 0;
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

.action-column {
  border-left: 2px solid var(--el-border-color);
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
