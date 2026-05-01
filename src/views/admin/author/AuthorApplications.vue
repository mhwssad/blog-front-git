<template>
  <div class="author-application-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="状态">
          <el-select v-model="searchForm.applyStatus" placeholder="全部" clearable style="width: 160px">
            <el-option label="待审核" :value="1" />
            <el-option label="已通过" :value="2" />
            <el-option label="已拒绝" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" clearable placeholder="用户名/昵称" style="width: 180px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <span>作者申请列表</span>
      </template>
      <el-table :data="store.applications" v-loading="store.loading" border stripe>
        <el-table-column prop="username" label="用户名" min-width="100" align="center" />
        <el-table-column prop="nickname" label="昵称" min-width="100" align="center" />
        <el-table-column prop="contentDirection" label="擅长方向" min-width="140" align="center" show-overflow-tooltip />
        <el-table-column label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.applyStatus)">{{ row.applyStatusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" min-width="170" align="center">
          <template #default="{ row }">{{ formatAiDate(row.submittedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" align="center">
          <template #default="{ row }">
            <template v-if="row.applyStatus === 1">
              <el-button link type="success" @click="handleReview(row, 2)">通过</el-button>
              <el-button link type="danger" @click="handleReview(row, 3)">拒绝</el-button>
            </template>
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-area">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="store.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="申请详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="申请人">{{ currentRow.username }} ({{ currentRow.nickname }})</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ formatAiDate(currentRow.submittedAt) }}</el-descriptions-item>
        <el-descriptions-item label="擅长方向">{{ currentRow.contentDirection }}</el-descriptions-item>
        <el-descriptions-item label="申请说明">{{ currentRow.applyReason }}</el-descriptions-item>
        <el-descriptions-item v-if="currentRow.introduction" label="个人简介">{{ currentRow.introduction }}</el-descriptions-item>
        <el-descriptions-item v-if="currentRow.sampleLinks?.length" label="作品链接">
          <div v-for="(link, i) in currentRow.sampleLinks" :key="i">{{ link }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(currentRow.applyStatus)">{{ currentRow.applyStatusLabel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRow.reviewComment" label="审核备注">
          {{ currentRow.reviewComment }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRow.reviewerUsername" label="审核人">
          {{ currentRow.reviewerNickname || currentRow.reviewerUsername }}
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
import { useAuthorApplicationStore } from '@/stores'
import { formatAiDate } from '@/utils'
import type { SysAuthorApplicationAdminVO } from '@/types/api-types'

const store = useAuthorApplicationStore()

const searchForm = reactive({
  applyStatus: undefined as number | undefined,
  keyword: undefined as string | undefined,
})

const pagination = reactive({ current: 1, size: 10 })
const detailVisible = ref(false)
const currentRow = ref<SysAuthorApplicationAdminVO>({} as SysAuthorApplicationAdminVO)

function statusTagType(status: number): 'info' | 'warning' | 'success' | 'danger' {
  if (status === 1) return 'warning'
  if (status === 2) return 'success'
  if (status === 3) return 'danger'
  return 'info'
}

async function fetchList(): Promise<void> {
  await store.fetchApplications({
    ...searchForm,
    current: pagination.current,
    size: pagination.size,
  })
}

function handleSearch(): void {
  pagination.current = 1
  void fetchList()
}

function handleReset(): void {
  searchForm.applyStatus = undefined
  searchForm.keyword = undefined
  pagination.current = 1
  void fetchList()
}

function handleSizeChange(size: number): void {
  pagination.size = size
  pagination.current = 1
  void fetchList()
}

function handlePageChange(current: number): void {
  pagination.current = current
  void fetchList()
}

async function handleReview(row: SysAuthorApplicationAdminVO, status: 1 | 2 | 3): Promise<void> {
  const action = status === 2 ? '通过' : '拒绝'
  try {
    await ElMessageBox.confirm(`确定${action} "${row.nickname || row.username}" 的作者申请吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const success = await store.reviewApplication(row.id, { reviewStatus: status })
    if (success) {
      ElMessage.success(`已${action}`)
      void fetchList()
    }
  } catch {
    // 用户取消
  }
}

function handleView(row: SysAuthorApplicationAdminVO): void {
  currentRow.value = { ...row }
  detailVisible.value = true
}

onMounted(() => {
  void fetchList()
})
</script>

<style scoped>
.author-application-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 16px;
}

.pagination-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
