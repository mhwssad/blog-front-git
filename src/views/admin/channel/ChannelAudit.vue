<template>
  <div class="channel-audit-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.applyStatus"
            placeholder="全部"
            clearable
            style="width: 160px"
          >
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="用户名 / 频道名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <DataTable
      :data="chatStore.channelApplications"
      :loading="chatStore.channelAppLoading"
      :total="chatStore.channelAppTotal"
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :page-sizes="[10, 20, 50]"
      :pagination-layout="paginationLayout"
      :compact="isCompactTable"
      title="频道申请列表"
      @size-change="handleSearch"
      @page-change="handleSearch"
    >
      <el-table-column prop="username" label="用户名" min-width="120" align="center" />
      <el-table-column prop="nickname" label="昵称" min-width="120" align="center" />
      <el-table-column prop="desiredName" label="频道名" min-width="140" align="center" />
      <el-table-column label="场景类型" min-width="120" align="center">
        <template #default="{ row }">
          {{ formatSceneType(row.desiredSceneType) }}
        </template>
      </el-table-column>
      <el-table-column prop="desiredCategoryCode" label="分类编码" min-width="120" align="center" />
      <el-table-column label="状态" min-width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.applyStatus)">
            {{ statusLabel(row.applyStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="reviewerNickname" label="审核人" min-width="120" align="center" />
      <el-table-column label="申请时间" min-width="180" align="center">
        <template #default="{ row }">
          {{ formatCreatedAt(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="200" align="center">
        <template #default="{ row }">
          <template v-if="row.applyStatus === 0">
            <el-button link type="success" @click="handleApprove(row)">通过</el-button>
            <el-button link type="danger" @click="handleReject(row)">拒绝</el-button>
          </template>
          <el-button link type="primary" @click="handleView(row)">查看</el-button>
        </template>
      </el-table-column>
    </DataTable>

    <el-dialog v-model="detailVisible" title="申请详情" width="560px">
      <div v-loading="detailLoading">
        <el-descriptions v-if="detailData" :column="1" border>
          <el-descriptions-item label="用户名">{{ detailData.username }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ detailData.nickname }}</el-descriptions-item>
          <el-descriptions-item label="频道名">{{ detailData.desiredName }}</el-descriptions-item>
          <el-descriptions-item label="场景类型">{{
            formatSceneType(detailData.desiredSceneType)
          }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{
            detailData.desiredCategoryCode
          }}</el-descriptions-item>
          <el-descriptions-item v-if="detailData.description" label="描述">
            {{ detailData.description }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(detailData.applyStatus)">
              {{ statusLabel(detailData.applyStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            {{ formatCreatedAt(detailData.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="detailData.reviewComment" label="审核备注">
            {{ detailData.reviewComment }}
          </el-descriptions-item>
          <el-descriptions-item v-if="detailData.reviewerNickname" label="审核人">
            {{ detailData.reviewerNickname }}
          </el-descriptions-item>
          <el-descriptions-item v-if="detailData.reviewedAt" label="审核时间">
            {{ formatCreatedAt(detailData.reviewedAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useChatStore } from '@/stores'
import { useContentAdmin } from '@/composables/useContentAdmin'
import DataTable from '@/components/common/DataTable.vue'
import { formatCreatedAt, formatChatSceneType } from '@/utils'
import type { SysChannelApplicationVO, SysChannelApplicationReviewRequest } from '@/types/api-types'

const chatStore = useChatStore()
const { isCompactTable, paginationLayout } = useContentAdmin()

const searchForm = reactive({
  applyStatus: undefined as number | undefined,
  keyword: '',
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref<SysChannelApplicationVO | null>(null)

const STATUS_TAG_MAP: Record<number, 'info' | 'warning' | 'success' | 'danger'> = {
  0: 'warning',
  1: 'success',
  2: 'danger',
}
const STATUS_LABEL_MAP: Record<number, string> = {
  0: '待审核',
  1: '已通过',
  2: '已拒绝',
}

function statusTagType(status: number) {
  return STATUS_TAG_MAP[status] ?? 'info'
}

function statusLabel(status: number) {
  return STATUS_LABEL_MAP[status] ?? '未知'
}

async function fetchList(): Promise<void> {
  await chatStore.fetchChannelApplications({
    current: pagination.current,
    size: pagination.size,
    applyStatus: searchForm.applyStatus,
    keyword: searchForm.keyword || undefined,
  })
}

function handleSearch(): void {
  pagination.current = 1
  void fetchList()
}

function handleReset(): void {
  searchForm.applyStatus = undefined
  searchForm.keyword = ''
  pagination.current = 1
  void fetchList()
}

async function handleView(row: SysChannelApplicationVO): Promise<void> {
  detailLoading.value = true
  detailVisible.value = true
  const result = await chatStore.fetchChannelApplicationById(row.id)
  detailData.value = result
  detailLoading.value = false
}

function reviewApplication(row: SysChannelApplicationVO, approved: boolean): void {
  const actionText = approved ? '通过' : '拒绝'
  const title = approved ? `通过 "${row.desiredName}" 频道申请` : `拒绝 "${row.desiredName}" 频道申请`
  ElMessageBox.prompt('请输入审核备注（可选）', title, {
    confirmButtonText: `确定${actionText}`,
    cancelButtonText: '取消',
    type: approved ? 'success' : 'warning',
    inputPlaceholder: approved ? '通过原因/备注' : '拒绝原因/备注',
  })
    .then(async ({ value }) => {
      const data: SysChannelApplicationReviewRequest = {
        approved,
        reviewRemark: value || undefined,
      }
      const ok = await chatStore.reviewChannelApplication(row.id, data)
      if (ok) {
        ElMessage.success(`已${actionText}`)
        void fetchList()
      } else {
        ElMessage.error('操作失败')
      }
    })
    .catch(() => {})
}

function handleApprove(row: SysChannelApplicationVO): void {
  reviewApplication(row, true)
}

function handleReject(row: SysChannelApplicationVO): void {
  reviewApplication(row, false)
}

function formatSceneType(sceneType?: string): string {
  return formatChatSceneType(sceneType)
}

onMounted(() => {
  void fetchList()
})
</script>

<style scoped>
.channel-audit-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 16px;
}
</style>
