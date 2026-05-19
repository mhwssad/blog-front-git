/** * AI 会话管理 * @description 后台 AI
会话列表管理，支持按用户、渠道、状态、时间范围筛选，查看会话详情 * @module admin/ai/AiSessionManage
* @see api/sys/ai.ts */
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
              v-for="ch in channelStore.channels"
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

    <DataTable
      :data="usageStore.sessions"
      :loading="usageStore.sessionLoading"
      :total="usageStore.sessionTotal"
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :page-sizes="[10, 20, 50]"
      :pagination-layout="paginationLayout"
      :compact="isCompactTable"
      title="AI 会话列表"
      @size-change="handleSizeChange"
      @page-change="handleCurrentChange"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="userId" label="用户ID" width="90" align="center" />
      <el-table-column prop="username" label="用户名" min-width="120" align="center" />
      <el-table-column prop="nickname" label="昵称" min-width="120" align="center" />
      <el-table-column
        prop="channelName"
        label="渠道"
        min-width="140"
        align="center"
        show-overflow-tooltip
      />
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
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useAiUsageStore, useAiChannelStore } from '@/stores'
import { useContentAdmin } from '@/composables/useContentAdmin'
import DataTable from '@/components/common/DataTable.vue'
import {
  AI_SESSION_STATUS_OPTIONS,
  formatAiDate,
  formatAiSceneType,
  formatAiSessionStatus,
} from '@/utils/aiAdmin'

const usageStore = useAiUsageStore()
const channelStore = useAiChannelStore()

const query = reactive({
  userId: '' as string,
  channelConfigId: undefined as number | undefined,
  status: undefined as number | undefined,
})

const dateRange = ref<[string, string] | null>(null)

const pagination = reactive({
  current: 1,
  size: 10,
})

const { paginationLayout, isCompactTable } = useContentAdmin({
  minHeight: 360,
  bottomOffset: 28,
})

async function fetchList() {
  const params: Record<string, unknown> = {
    current: pagination.current,
    size: pagination.size,
  }
  if (query.userId) params.userId = Number(query.userId)
  if (query.channelConfigId != null) params.channelConfigId = query.channelConfigId
  if (query.status != null) params.status = query.status
  if (dateRange.value) {
    params.startTime = dateRange.value[0]
    params.endTime = dateRange.value[1]
  }

  await usageStore.fetchSessions(params as Parameters<typeof usageStore.fetchSessions>[0])
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
  await channelStore.fetchChannels({ size: 100 })
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
</style>
