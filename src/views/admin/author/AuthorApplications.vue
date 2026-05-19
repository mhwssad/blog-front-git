<template>
  <div class="author-application-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="用户 ID" class="filter-item">
          <el-input-number
            v-model="searchForm.userId"
            :min="1"
            controls-position="right"
            class="filter-control"
          />
        </el-form-item>
        <el-form-item label="状态" class="filter-item">
          <el-select
            v-model="searchForm.applyStatus"
            placeholder="全部"
            clearable
            class="filter-control"
          >
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
            <el-option label="待补充" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词" class="filter-item">
          <el-input
            v-model="searchForm.keyword"
            clearable
            placeholder="用户名/昵称"
            class="filter-control"
          />
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button v-permission="'sys:author-application:query'" type="primary" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <DataTable
      :data="store.applications"
      :loading="store.loading"
      :total="store.total"
      :current-page="pagination.current"
      :page-size="pagination.size"
      :page-sizes="[10, 20, 50]"
      :pagination-layout="paginationLayout"
      :compact="isCompactTable"
      title="作者申请列表"
      @update:current-page="pagination.current = $event"
      @update:page-size="pagination.size = $event"
      @size-change="handleSizeChange"
      @page-change="handlePageChange"
    >
      <template #header-extra>
        <span class="card-header__meta">{{ store.total }} 条</span>
      </template>

      <el-table-column prop="userId" label="用户ID" min-width="80" align="center" />
      <el-table-column prop="username" label="用户名" min-width="100" align="center" />
      <el-table-column prop="nickname" label="昵称" min-width="100" align="center" />
      <el-table-column
        prop="contentDirection"
        label="擅长方向"
        min-width="140"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column label="状态" min-width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.applyStatus)" size="small">
            {{ row.applyStatusLabel || STATUS_LABELS[row.applyStatus] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" min-width="160" align="center">
        <template #default="{ row }">{{ row.submittedAt || '-' }}</template>
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
            <template v-if="row.applyStatus === 0">
              <el-button
                v-permission="'sys:author-application:review'"
                link
                type="success"
                @click="handleReview(row, 1)"
              >
                通过
              </el-button>
              <el-button
                v-permission="'sys:author-application:review'"
                link
                type="danger"
                @click="handleReview(row, 2)"
              >
                拒绝
              </el-button>
            </template>
            <el-button
              v-if="row.applyStatus !== 0"
              v-permission="'sys:author-application:repair'"
              link
              type="warning"
              @click="handleRepair(row)"
            >
              修复
            </el-button>
          </div>
        </template>
      </el-table-column>
    </DataTable>

    <el-dialog v-model="detailVisible" title="申请详情" width="600px" align-center>
      <el-descriptions v-if="currentRow" :column="1" border size="small">
        <el-descriptions-item label="申请人">
          {{ currentRow.nickname || currentRow.username }}（ID: {{ currentRow.userId }}）
        </el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentRow.username }}</el-descriptions-item>
        <el-descriptions-item label="擅长方向">{{ currentRow.contentDirection || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请说明">{{ currentRow.applyReason || '-' }}</el-descriptions-item>
        <el-descriptions-item v-if="currentRow.introduction" label="个人简介">
          {{ currentRow.introduction }}
        </el-descriptions-item>
        <el-descriptions-item v-if="sampleLinks.length > 0" label="作品链接">
          <div v-for="(link, i) in sampleLinks" :key="i" class="sample-link">{{ link }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(currentRow.applyStatus)" size="small">
            {{ currentRow.applyStatusLabel || STATUS_LABELS[currentRow.applyStatus] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRow.reviewerUsername" label="审核人">
          {{ currentRow.reviewerNickname || currentRow.reviewerUsername }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRow.reviewComment" label="审核备注">
          {{ currentRow.reviewComment }}
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentRow.submittedAt || '-' }}</el-descriptions-item>
        <el-descriptions-item v-if="currentRow.reviewedAt" label="审核时间">
          {{ currentRow.reviewedAt }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="repairVisible" title="修复申请状态" width="480px" align-center>
      <el-form label-width="100px">
        <el-form-item label="目标状态">
          <el-select v-model="repairForm.targetStatus" style="width: 100%">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
            <el-option label="待补充" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="repairForm.reviewComment"
            type="textarea"
            :rows="3"
            placeholder="请输入修复原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="repairVisible = false">取消</el-button>
        <el-button type="primary" :loading="repairLoading" @click="confirmRepair">
          确认修复
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useAuthorApplicationStore } from '@/stores'
import type { SysAuthorApplicationAdminVO } from '@/types/api-types'

const STATUS_LABELS: Record<number, string> = {
  0: '待审核',
  1: '已通过',
  2: '已拒绝',
  3: '待补充',
}

const store = useAuthorApplicationStore()
const { isCompactTable, paginationLayout } = useContentAdmin()

const searchForm = reactive({
  userId: undefined as number | undefined,
  applyStatus: undefined as number | undefined,
  keyword: undefined as string | undefined,
})

const pagination = reactive({ current: 1, size: 10 })
const detailVisible = ref(false)
const currentRow = ref<SysAuthorApplicationAdminVO | null>(null)

const repairVisible = ref(false)
const repairLoading = ref(false)
const repairRow = ref<SysAuthorApplicationAdminVO | null>(null)
const repairForm = reactive({
  targetStatus: 0 as 0 | 1 | 2 | 3,
  reviewComment: '',
})

const sampleLinks = computed(() => {
  if (!currentRow.value?.sampleLinks) return []
  if (typeof currentRow.value.sampleLinks === 'string') {
    try {
      return JSON.parse(currentRow.value.sampleLinks)
    } catch {
      return []
    }
  }
  return currentRow.value.sampleLinks
})

function statusTagType(status: number): 'info' | 'warning' | 'success' | 'danger' {
  if (status === 0) return 'warning'
  if (status === 1) return 'success'
  if (status === 2) return 'danger'
  return 'info'
}

async function fetchList(): Promise<void> {
  try {
    await store.fetchApplications({
      ...searchForm,
      current: pagination.current,
      size: pagination.size,
    })
  } catch {
    ElMessage.error('获取申请列表失败')
  }
}

function handleSearch(): void {
  pagination.current = 1
  void fetchList()
}

function handleReset(): void {
  searchForm.userId = undefined
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

async function handleReview(
  row: SysAuthorApplicationAdminVO,
  status: 1 | 2 | 3,
): Promise<void> {
  const action = status === 1 ? '通过' : '拒绝'
  try {
    await ElMessageBox.confirm(
      `确定${action} "${row.nickname || row.username}" 的作者申请吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    const success = await store.reviewApplication(row.id, { reviewStatus: status })
    if (success) {
      ElMessage.success(`已${action}`)
      void fetchList()
    } else {
      ElMessage.error(`${action}失败`)
    }
  } catch {
    // 用户取消
  }
}

function handleView(row: SysAuthorApplicationAdminVO): void {
  currentRow.value = { ...row }
  detailVisible.value = true
}

function handleRepair(row: SysAuthorApplicationAdminVO): void {
  repairRow.value = row
  repairForm.targetStatus = row.applyStatus as 0 | 1 | 2 | 3
  repairForm.reviewComment = ''
  repairVisible.value = true
}

async function confirmRepair(): Promise<void> {
  if (!repairRow.value) return
  try {
    await ElMessageBox.confirm('确定要修复该申请的状态吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  repairLoading.value = true
  try {
    const success = await store.repairApplication(repairRow.value.id, {
      targetStatus: repairForm.targetStatus,
      reviewComment: repairForm.reviewComment || '管理员修复申请状态',
    })
    if (success) {
      ElMessage.success('申请状态已修复')
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
.author-application-page {
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
  width: 200px;
}

.search-actions {
  margin-left: 0;
  margin-right: 0;
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

.sample-link {
  word-break: break-all;
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
