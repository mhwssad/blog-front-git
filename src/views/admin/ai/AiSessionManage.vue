<template>
  <div class="ai-session-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="用户ID">
          <el-input v-model="query.userId" placeholder="用户ID" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="渠道">
          <el-select
            v-model="query.channelConfigId"
            placeholder="全部"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="ch in channelList"
              :key="ch.id"
              :label="ch.channelName"
              :value="ch.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <el-option
              v-for="opt in AI_SESSION_STATUS_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
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
        <span>AI 会话列表</span>
      </template>
        <el-table
          :data="tableData"
          v-loading="loading"
          :size="isCompactTable ? 'small' : 'default'"
          border
          stripe
        >
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="userId" label="用户ID" width="90" align="center" />
          <el-table-column prop="username" label="用户名" min-width="120" align="center" />
          <el-table-column prop="nickname" label="昵称" min-width="120" align="center" />
          <el-table-column prop="channelName" label="渠道" min-width="140" align="center" show-overflow-tooltip />
          <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
          <el-table-column prop="sceneType" label="场景" width="100" align="center">
            <template #default="{ row }">
              {{ formatAiSceneType(row.sceneType) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'">
                {{ formatAiSessionStatus(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastMessageAt" label="最后消息" min-width="180" align="center">
            <template #default="{ row }">
              {{ formatAiDate(row.lastMessageAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" min-width="180" align="center">
            <template #default="{ row }">
              {{ formatAiDate(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
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
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { aiSysApi } from '@/api/sys/ai'
import { useContentAdmin } from '@/composables/useContentAdmin'
import {
  AI_SESSION_STATUS_OPTIONS,
  formatAiDate,
  formatAiSceneType,
  formatAiSessionStatus,
} from '@/utils/aiAdmin'
import type { AiChannelConfigVO, AiSessionAdminVO } from '@/types/api-types'

const query = reactive({
  userId: '' as string,
  channelConfigId: undefined as number | undefined,
  status: undefined as number | undefined,
})

const dateRange = ref<[string, string] | null>(null)

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const tableData = ref<AiSessionAdminVO[]>([])
const loading = ref(false)
const channelList = ref<AiChannelConfigVO[]>([])

const { paginationLayout, isCompactTable } =
  useContentAdmin({
    minHeight: 360,
    bottomOffset: 28,
  })

async function fetchChannels() {
  try {
    const res = await aiSysApi.getChannels({ size: 100 })
    channelList.value = res.data.data?.records ?? []
  } catch {
    // ignore
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      current: pagination.current,
      size: pagination.size,
    }
    if (query.userId) params.userId = Number(query.userId)
    if (query.channelConfigId !== undefined && query.channelConfigId !== null)
      params.channelConfigId = query.channelConfigId
    if (query.status !== undefined && query.status !== null) params.status = query.status
    if (dateRange.value) {
      params.startTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }

    const res = await aiSysApi.getSessions(
      params as Parameters<typeof aiSysApi.getSessions>[0],
    )
    const page = res.data.data
    tableData.value = page?.records ?? []
    pagination.total = page?.total ?? 0
  } catch {
    ElMessage.error('获取会话列表失败')
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  pagination.current = 1
  void fetchList()
}

function handleReset() {
  query.userId = ''
  query.channelConfigId = undefined
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

onMounted(async () => {
  await fetchChannels()
  void fetchList()
})
</script>

<style scoped>
.ai-session-page {
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
