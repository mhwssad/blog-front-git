<template>
  <div class="ai-usage-stats-page">
    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :lg="4" :sm="8" :xs="12">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats?.totalCalls ?? 0 }}</div>
          <div class="stat-label">总调用次数</div>
        </el-card>
      </el-col>
      <el-col :lg="4" :sm="8" :xs="12">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats?.successCalls ?? 0 }}</div>
          <div class="stat-label">成功次数</div>
        </el-card>
      </el-col>
      <el-col :lg="4" :sm="8" :xs="12">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value stat-value--danger">{{ stats?.failedCalls ?? 0 }}</div>
          <div class="stat-label">失败次数</div>
        </el-card>
      </el-col>
      <el-col :lg="6" :sm="12" :xs="12">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ formatTokenCount(stats?.totalTokens ?? 0) }}</div>
          <div class="stat-label">总 Token 消耗</div>
        </el-card>
      </el-col>
      <el-col :lg="6" :sm="12" :xs="12">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats?.totalQuotaCost?.toFixed(2) ?? '0.00' }}</div>
          <div class="stat-label">总配额消耗</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 使用日志 Tab -->
        <el-tab-pane label="使用日志" name="logs">
          <el-form :model="logSearchForm" inline class="search-form">
            <el-form-item label="用户ID">
              <el-input v-model="logSearchForm.userId" clearable placeholder="用户ID" style="width: 120px" />
            </el-form-item>
            <el-form-item label="渠道">
              <el-select v-model="logSearchForm.channelConfigId" clearable placeholder="全部" style="width: 160px">
                <el-option
                  v-for="ch in channelStore.channels"
                  :key="ch.id"
                  :label="ch.channelName"
                  :value="ch.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="logSearchForm.successStatus" clearable placeholder="全部" style="width: 100px">
                <el-option
                  v-for="opt in AI_SUCCESS_STATUS_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="logTimeRange"
                type="daterange"
                range-separator="-"
                start-placeholder="开始"
                end-placeholder="结束"
                value-format="YYYY-MM-DD HH:mm:ss"
                :default-time="defaultTime"
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleLogSearch">查询</el-button>
              <el-button @click="handleLogReset">重置</el-button>
            </el-form-item>
          </el-form>

          <el-table
            v-loading="usageStore.usageLogLoading"
            :data="usageStore.usageLogs"
            table-layout="auto"
            border
            stripe
          >
            <el-table-column prop="id" label="ID" width="70" align="center" />
            <el-table-column prop="userId" label="用户ID" width="80" align="center" />
            <el-table-column prop="channelConfigId" label="渠道ID" width="80" align="center" />
            <el-table-column prop="sessionId" label="会话ID" width="80" align="center" />
            <el-table-column prop="requestSceneType" label="场景" width="80" align="center" />
            <el-table-column prop="requestTokens" label="请求Token" width="100" align="center" />
            <el-table-column prop="responseTokens" label="响应Token" width="100" align="center" />
            <el-table-column prop="totalTokens" label="总Token" width="90" align="center" />
            <el-table-column prop="quotaCost" label="额度" width="70" align="center" />
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.successStatus === 1 ? 'success' : 'danger'" size="small">
                  {{ formatAiSuccessStatus(row.successStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="errorCode" label="错误码" width="120" align="center" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.errorCode || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="时间" min-width="170" align="center">
              <template #default="{ row }">
                {{ formatAiDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="logPagination.current"
              v-model:page-size="logPagination.size"
              :total="usageStore.usageLogTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleLogSizeChange"
              @current-change="handleLogPageChange"
            />
          </div>
        </el-tab-pane>

        <!-- 会话管理 Tab -->
        <el-tab-pane label="会话管理" name="sessions">
          <el-form :model="sessionSearchForm" inline class="search-form">
            <el-form-item label="用户ID">
              <el-input v-model="sessionSearchForm.userId" clearable placeholder="用户ID" style="width: 120px" />
            </el-form-item>
            <el-form-item label="渠道">
              <el-select v-model="sessionSearchForm.channelConfigId" clearable placeholder="全部" style="width: 160px">
                <el-option
                  v-for="ch in channelStore.channels"
                  :key="ch.id"
                  :label="ch.channelName"
                  :value="ch.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="sessionSearchForm.status" clearable placeholder="全部" style="width: 100px">
                <el-option
                  v-for="opt in AI_SESSION_STATUS_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="sessionTimeRange"
                type="daterange"
                range-separator="-"
                start-placeholder="开始"
                end-placeholder="结束"
                value-format="YYYY-MM-DD HH:mm:ss"
                :default-time="defaultTime"
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSessionSearch">查询</el-button>
              <el-button @click="handleSessionReset">重置</el-button>
            </el-form-item>
          </el-form>

          <el-table
            v-loading="usageStore.sessionLoading"
            :data="usageStore.sessions"
            table-layout="auto"
            border
            stripe
          >
            <el-table-column prop="id" label="ID" width="70" align="center" />
            <el-table-column prop="userId" label="用户ID" width="80" align="center" />
            <el-table-column prop="username" label="用户名" min-width="100" align="center" />
            <el-table-column prop="nickname" label="昵称" min-width="100" align="center" />
            <el-table-column prop="channelName" label="渠道" min-width="140" align="center" show-overflow-tooltip />
            <el-table-column prop="title" label="会话标题" min-width="160" align="center" show-overflow-tooltip />
            <el-table-column prop="sceneType" label="场景" width="80" align="center" />
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                  {{ formatAiSessionStatus(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="最后消息" min-width="170" align="center">
              <template #default="{ row }">
                {{ formatAiDate(row.lastMessageAt) }}
              </template>
            </el-table-column>
            <el-table-column label="创建时间" min-width="170" align="center">
              <template #default="{ row }">
                {{ formatAiDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="sessionPagination.current"
              v-model:page-size="sessionPagination.size"
              :total="usageStore.sessionTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSessionSizeChange"
              @current-change="handleSessionPageChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useAiUsageStore, useAiChannelStore } from '@/stores'
import {
  AI_SUCCESS_STATUS_OPTIONS,
  AI_SESSION_STATUS_OPTIONS,
  formatAiDate,
  formatAiSuccessStatus,
  formatAiSessionStatus,
} from '@/utils'

const usageStore = useAiUsageStore()
const channelStore = useAiChannelStore()

const activeTab = ref('logs')
const stats = ref(usageStore.usageStats)

const logTimeRange = ref<[string, string] | null>(null)
const sessionTimeRange = ref<[string, string] | null>(null)

const defaultTime: [Date, Date] = [new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]

const logSearchForm = reactive({
  userId: undefined as number | undefined,
  channelConfigId: undefined as number | undefined,
  successStatus: undefined as number | undefined,
})

const logPagination = reactive({ current: 1, size: 20 })

const sessionSearchForm = reactive({
  userId: undefined as number | undefined,
  channelConfigId: undefined as number | undefined,
  status: undefined as number | undefined,
})

const sessionPagination = reactive({ current: 1, size: 20 })

function formatTokenCount(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`
  return value.toLocaleString()
}

// 日志相关
async function fetchLogs(): Promise<void> {
  await usageStore.fetchUsageLogs({
    ...logSearchForm,
    startTime: logTimeRange.value?.[0],
    endTime: logTimeRange.value?.[1],
    current: logPagination.current,
    size: logPagination.size,
  })
}

function handleLogSearch(): void {
  logPagination.current = 1
  void fetchLogs()
  void fetchStats()
}

function handleLogReset(): void {
  logSearchForm.userId = undefined
  logSearchForm.channelConfigId = undefined
  logSearchForm.successStatus = undefined
  logTimeRange.value = null
  logPagination.current = 1
  void fetchLogs()
  void fetchStats()
}

function handleLogSizeChange(size: number): void {
  logPagination.size = size
  logPagination.current = 1
  void fetchLogs()
}

function handleLogPageChange(current: number): void {
  logPagination.current = current
  void fetchLogs()
}

// 会话相关
async function fetchSessions(): Promise<void> {
  await usageStore.fetchSessions({
    ...sessionSearchForm,
    startTime: sessionTimeRange.value?.[0],
    endTime: sessionTimeRange.value?.[1],
    current: sessionPagination.current,
    size: sessionPagination.size,
  })
}

function handleSessionSearch(): void {
  sessionPagination.current = 1
  void fetchSessions()
}

function handleSessionReset(): void {
  sessionSearchForm.userId = undefined
  sessionSearchForm.channelConfigId = undefined
  sessionSearchForm.status = undefined
  sessionTimeRange.value = null
  sessionPagination.current = 1
  void fetchSessions()
}

function handleSessionSizeChange(size: number): void {
  sessionPagination.size = size
  sessionPagination.current = 1
  void fetchSessions()
}

function handleSessionPageChange(current: number): void {
  sessionPagination.current = current
  void fetchSessions()
}

async function fetchStats(): Promise<void> {
  await usageStore.fetchUsageStats({
    ...logSearchForm,
    startTime: logTimeRange.value?.[0],
    endTime: logTimeRange.value?.[1],
  })
  stats.value = usageStore.usageStats
}

function handleTabChange(tab: string | number): void {
  if (tab === 'logs') {
    void fetchLogs()
  } else if (tab === 'sessions') {
    void fetchSessions()
  }
}

onMounted(async () => {
  await channelStore.fetchChannels({ size: 100 })
  await fetchStats()
  await fetchLogs()
})
</script>

<style scoped>
.ai-usage-stats-page {
  padding: 0;
  max-width: 1560px;
  margin: 0 auto;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.stat-value--danger {
  color: var(--el-color-danger);
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 0;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
