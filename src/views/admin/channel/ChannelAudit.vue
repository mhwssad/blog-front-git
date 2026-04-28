<template>
  <div class="channel-audit-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 160px">
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间">
          <el-date-picker
            v-model="query.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
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
          <span>频道申请列表</span>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="applicant" label="申请人" min-width="120" align="center" />
        <el-table-column prop="channelName" label="频道名" min-width="140" align="center" />
        <el-table-column prop="description" label="描述" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column prop="applyTime" label="申请时间" min-width="180" align="center" />
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" align="center">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button link type="success" @click="handleApprove(row)">通过</el-button>
              <el-button link type="danger" @click="handleReject(row)">拒绝</el-button>
            </template>
            <el-button v-else link type="primary" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-area">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="申请详情" width="560px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="申请人">{{ currentRow.applicant }}</el-descriptions-item>
        <el-descriptions-item label="频道名">{{ currentRow.channelName }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ currentRow.description }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentRow.applyTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(currentRow.status)">{{ statusLabel(currentRow.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRow.reviewRemark" label="审核备注">
          {{ currentRow.reviewRemark }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface ChannelApplication {
  id: number
  applicant: string
  channelName: string
  description: string
  applyTime: string
  status: 'pending' | 'approved' | 'rejected'
  reviewRemark?: string
}

const query = reactive({
  status: '' as string,
  dateRange: null as [string, string] | null,
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const tableData = ref<ChannelApplication[]>([])
const loading = ref(false)
const detailVisible = ref(false)
const currentRow = ref<ChannelApplication>({} as ChannelApplication)

function statusTagType(status: string): 'info' | 'warning' | 'success' | 'danger' {
  const map: Record<string, 'info' | 'warning' | 'success' | 'danger'> = { pending: 'warning', approved: 'success', rejected: 'danger' }
  return map[status] || 'info'
}

function statusLabel(status: string) {
  const map: Record<string, string> = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }
  return map[status] || status
}

function handleQuery() {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, applicant: '张三', channelName: 'Rust 学习小组', description: 'Rust 语言学习与交流频道', applyTime: '2026-04-20 09:00:00', status: 'pending' },
      { id: 2, applicant: '李四', channelName: 'Go 语言', description: 'Go 语言技术讨论频道', applyTime: '2026-04-19 11:30:00', status: 'approved', reviewRemark: '符合要求' },
      { id: 3, applicant: '王五', channelName: '产品经理交流', description: '产品设计与需求讨论', applyTime: '2026-04-18 15:20:00', status: 'rejected', reviewRemark: '已有类似频道' },
      { id: 4, applicant: '赵六', channelName: '面试经验', description: '面试技巧与经验分享', applyTime: '2026-04-17 10:45:00', status: 'pending' },
    ]
    pagination.total = 4
    loading.value = false
  }, 300)
}

function handleReset() {
  query.status = ''
  query.dateRange = null
  pagination.current = 1
  handleQuery()
}

function handleApprove(row: ChannelApplication) {
  ElMessageBox.confirm(`确定通过 "${row.channelName}" 频道申请吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    row.status = 'approved'
    ElMessage.success('已通过')
  }).catch(() => {})
}

function handleReject(row: ChannelApplication) {
  ElMessageBox.confirm(`确定拒绝 "${row.channelName}" 频道申请吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    row.status = 'rejected'
    ElMessage.success('已拒绝')
  }).catch(() => {})
}

function handleView(row: ChannelApplication) {
  currentRow.value = { ...row }
  detailVisible.value = true
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.channel-audit-page {
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
</style>
