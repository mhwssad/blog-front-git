<template>
  <div class="author-application-page">
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
          <span>作者申请列表</span>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="applicant" label="申请人" min-width="120" align="center" />
        <el-table-column prop="applyTime" label="申请时间" min-width="180" align="center" />
        <el-table-column prop="specialty" label="擅长方向" min-width="160" align="center" />
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

    <el-dialog v-model="detailVisible" title="申请详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="申请人">{{ currentRow.applicant }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentRow.applyTime }}</el-descriptions-item>
        <el-descriptions-item label="擅长方向">{{ currentRow.specialty }}</el-descriptions-item>
        <el-descriptions-item label="个人简介">{{ currentRow.introduction }}</el-descriptions-item>
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

interface Application {
  id: number
  applicant: string
  applyTime: string
  specialty: string
  introduction: string
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

const tableData = ref<Application[]>([])
const loading = ref(false)
const detailVisible = ref(false)
const currentRow = ref<Application>({} as Application)

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
      { id: 1, applicant: '张三', applyTime: '2026-04-20 10:30:00', specialty: '前端开发', introduction: '5年前端开发经验，熟悉Vue和React', status: 'pending' },
      { id: 2, applicant: '李四', applyTime: '2026-04-19 14:20:00', specialty: '后端开发', introduction: 'Java全栈开发者，擅长Spring Boot', status: 'approved', reviewRemark: '资质优秀，通过' },
      { id: 3, applicant: '王五', applyTime: '2026-04-18 09:15:00', specialty: '数据分析', introduction: '数据科学方向，熟悉Python和SQL', status: 'rejected', reviewRemark: '相关经验不足' },
      { id: 4, applicant: '赵六', applyTime: '2026-04-17 16:45:00', specialty: 'UI设计', introduction: '8年设计经验，精通Figma', status: 'pending' },
      { id: 5, applicant: '孙七', applyTime: '2026-04-16 11:00:00', specialty: 'DevOps', introduction: '精通CI/CD和云原生技术', status: 'approved', reviewRemark: '经验丰富' },
    ]
    pagination.total = 5
    loading.value = false
  }, 300)
}

function handleReset() {
  query.status = ''
  query.dateRange = null
  pagination.current = 1
  handleQuery()
}

function handleApprove(row: Application) {
  ElMessageBox.confirm(`确定通过 "${row.applicant}" 的作者申请吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    row.status = 'approved'
    ElMessage.success('已通过')
  }).catch(() => {})
}

function handleReject(row: Application) {
  ElMessageBox.confirm(`确定拒绝 "${row.applicant}" 的作者申请吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    row.status = 'rejected'
    ElMessage.success('已拒绝')
  }).catch(() => {})
}

function handleView(row: Application) {
  currentRow.value = { ...row }
  detailVisible.value = true
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.author-application-page {
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
