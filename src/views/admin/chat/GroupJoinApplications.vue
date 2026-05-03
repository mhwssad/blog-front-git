<template>
  <div class="group-join-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="会话ID">
          <el-input
            v-model="query.conversationId"
            placeholder="会话ID"
            clearable
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.applyStatus" placeholder="全部" clearable style="width: 140px">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="用户名/昵称"
            clearable
            style="width: 160px"
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
        <span>入群申请列表</span>
      </template>
      <div>
        <el-table
          :data="tableData"
          v-loading="loading"
          :size="isCompactTable ? 'small' : 'default'"
          border
          stripe
        >
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="conversationId" label="会话ID" width="100" align="center" />
          <el-table-column prop="username" label="申请人" min-width="120" align="center" />
          <el-table-column prop="nickname" label="昵称" min-width="120" align="center" />
          <el-table-column
            prop="applyMessage"
            label="申请留言"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column prop="applyStatus" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.applyStatus)">{{ statusLabel(row.applyStatus) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="申请时间" min-width="180" align="center">
            <template #default="{ row }">
              {{ formatAiDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" align="center">
            <template #default="{ row }">
              <template v-if="row.applyStatus === 0">
                <el-button link type="primary" @click="handleApprove(row)">通过</el-button>
                <el-button link type="danger" @click="handleReject(row)">拒绝</el-button>
              </template>
              <template v-else>
                <el-button link type="primary" @click="handleView(row)">查看</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-area">
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

    <el-dialog v-model="detailVisible" title="申请详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="申请ID">{{ currentRow.id }}</el-descriptions-item>
        <el-descriptions-item label="会话ID">{{ currentRow.conversationId }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentRow.username }} ({{ currentRow.nickname }})</el-descriptions-item>
        <el-descriptions-item label="申请留言">{{ currentRow.applyMessage || '无' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusLabel(currentRow.applyStatus) }}</el-descriptions-item>
        <el-descriptions-item v-if="currentRow.reviewComment" label="审核备注">
          {{ currentRow.reviewComment }}
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ formatAiDate(currentRow.createdAt) }}</el-descriptions-item>
        <el-descriptions-item v-if="currentRow.reviewedAt" label="审核时间">
          {{ formatAiDate(currentRow.reviewedAt) }}
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
import { SysChatApi } from '@/api/sys/chat'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { formatAiDate } from '@/utils'
import type { GroupJoinApplicationVO } from '@/types/api-types'

const query = reactive({
  conversationId: '' as string,
  applyStatus: undefined as number | undefined,
  keyword: '',
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const tableData = ref<GroupJoinApplicationVO[]>([])
const loading = ref(false)
const detailVisible = ref(false)
const currentRow = ref<GroupJoinApplicationVO>({} as GroupJoinApplicationVO)

const { paginationLayout, isCompactTable } = useContentAdmin()

function statusTagType(status: number): 'warning' | 'success' | 'danger' | 'info' {
  const map: Record<number, 'warning' | 'success' | 'danger' | 'info'> = {
    0: 'warning',
    1: 'success',
    2: 'danger',
  }
  return map[status] ?? 'info'
}

function statusLabel(status: number) {
  const map: Record<number, string> = { 0: '待审核', 1: '已通过', 2: '已拒绝' }
  return map[status] ?? String(status)
}

async function fetchList() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      current: pagination.current,
      size: pagination.size,
    }
    if (query.conversationId) params.conversationId = Number(query.conversationId)
    if (query.applyStatus !== undefined && query.applyStatus !== null) params.applyStatus = query.applyStatus
    if (query.keyword) params.keyword = query.keyword

    const res = await SysChatApi.getGroupJoinApplications(
      params as Parameters<typeof SysChatApi.getGroupJoinApplications>[0],
    )
    const page = res.data.data
    tableData.value = page?.records ?? []
    pagination.total = page?.total ?? 0
  } catch {
    ElMessage.error('获取入群申请列表失败')
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  pagination.current = 1
  void fetchList()
}

function handleReset() {
  query.conversationId = ''
  query.applyStatus = undefined
  query.keyword = ''
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

async function handleApprove(row: GroupJoinApplicationVO) {
  try {
    await ElMessageBox.confirm(`确定通过 ${row.nickname} 的入群申请？`, '通过申请', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    })
    await SysChatApi.reviewGroupJoinApplication(row.id, { reviewStatus: 1 })
    ElMessage.success('已通过')
    void fetchList()
  } catch {
    // cancelled or error
  }
}

async function handleReject(row: GroupJoinApplicationVO) {
  try {
    const { value } = await ElMessageBox.prompt('请输入拒绝原因（可选）', '拒绝申请', {
      confirmButtonText: '确定拒绝',
      cancelButtonText: '取消',
      inputPlaceholder: '拒绝原因...',
    })
    await SysChatApi.reviewGroupJoinApplication(row.id, {
      reviewStatus: 2,
      reviewComment: value || undefined,
    })
    ElMessage.success('已拒绝')
    void fetchList()
  } catch {
    // cancelled or error
  }
}

function handleView(row: GroupJoinApplicationVO) {
  currentRow.value = { ...row }
  detailVisible.value = true
}

onMounted(() => {
  void fetchList()
})
</script>

<style scoped>
.group-join-page {
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
