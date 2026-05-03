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
            <el-option label="待审核" :value="1" />
            <el-option label="已通过" :value="2" />
            <el-option label="已拒绝" :value="3" />
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

    <el-card class="table-card" shadow="never">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>频道申请列表</span>
        </div>
      </template>
        <el-table
          v-loading="chatStore.channelAppLoading"
          :data="chatStore.channelApplications"
          :size="isCompactTable ? 'small' : 'default'"
          border
          stripe
          table-layout="auto"
        >
          <el-table-column prop="username" label="用户名" min-width="120" align="center" />
          <el-table-column prop="nickname" label="昵称" min-width="120" align="center" />
          <el-table-column prop="desiredName" label="频道名" min-width="140" align="center" />
          <el-table-column prop="desiredSceneType" label="场景类型" min-width="120" align="center" />
          <el-table-column label="状态" min-width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.applyStatus)">
                {{ statusLabel(row.applyStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="申请时间" min-width="180" align="center">
            <template #default="{ row }">
              {{ formatAiDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="200" align="center">
            <template #default="{ row }">
              <template v-if="row.applyStatus === 1">
                <el-button link type="success" @click="handleApprove(row)">通过</el-button>
                <el-button link type="danger" @click="handleReject(row)">拒绝</el-button>
              </template>
              <el-button link type="primary" @click="handleView(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      <div class="pagination-area">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="chatStore.channelAppTotal"
          :page-sizes="[10, 20, 50]"
          :layout="paginationLayout"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="申请详情" width="560px">
      <div v-loading="detailLoading">
        <el-descriptions v-if="detailData" :column="1" border>
          <el-descriptions-item label="用户名">{{ detailData.username }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ detailData.nickname }}</el-descriptions-item>
          <el-descriptions-item label="频道名">{{ detailData.desiredName }}</el-descriptions-item>
          <el-descriptions-item label="场景类型">{{ detailData.desiredSceneType }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ detailData.desiredCategoryCode }}</el-descriptions-item>
          <el-descriptions-item v-if="detailData.description" label="描述">
            {{ detailData.description }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(detailData.applyStatus)">
              {{ statusLabel(detailData.applyStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            {{ formatAiDate(detailData.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="detailData.reviewComment" label="审核备注">
            {{ detailData.reviewComment }}
          </el-descriptions-item>
          <el-descriptions-item v-if="detailData.reviewerNickname" label="审核人">
            {{ detailData.reviewerNickname }}
          </el-descriptions-item>
          <el-descriptions-item v-if="detailData.reviewedAt" label="审核时间">
            {{ formatAiDate(detailData.reviewedAt) }}
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
import { formatAiDate } from '@/utils'
import type {
  SysChannelApplicationVO,
  SysChannelApplicationReviewRequest,
} from '@/types/api-types'

const chatStore = useChatStore()
const { isCompactTable, paginationLayout } =
  useContentAdmin()

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
  1: 'warning',
  2: 'success',
  3: 'danger',
}
const STATUS_LABEL_MAP: Record<number, string> = {
  1: '待审核',
  2: '已通过',
  3: '已拒绝',
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

function handleApprove(row: SysChannelApplicationVO): void {
  ElMessageBox.prompt('请输入审核意见（可选）', `通过 "${row.desiredName}" 频道申请`, {
    confirmButtonText: '确定通过',
    cancelButtonText: '取消',
    type: 'warning',
    inputPlaceholder: '审核意见',
  })
    .then(async ({ value }) => {
      const data: SysChannelApplicationReviewRequest = {
        reviewStatus: 2,
        reviewComment: value || undefined,
      }
      const ok = await chatStore.reviewChannelApplication(row.id, data)
      if (ok) {
        ElMessage.success('已通过')
        void fetchList()
      } else {
        ElMessage.error('操作失败')
      }
    })
    .catch(() => {})
}

function handleReject(row: SysChannelApplicationVO): void {
  ElMessageBox.prompt('请输入拒绝原因', `拒绝 "${row.desiredName}" 频道申请`, {
    confirmButtonText: '确定拒绝',
    cancelButtonText: '取消',
    type: 'warning',
    inputPlaceholder: '拒绝原因',
  })
    .then(async ({ value }) => {
      const data: SysChannelApplicationReviewRequest = {
        reviewStatus: 3,
        reviewComment: value || undefined,
      }
      const ok = await chatStore.reviewChannelApplication(row.id, data)
      if (ok) {
        ElMessage.success('已拒绝')
        void fetchList()
      } else {
        ElMessage.error('操作失败')
      }
    })
    .catch(() => {})
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

.table-card {
  margin-bottom: 16px;
}

.pagination-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
