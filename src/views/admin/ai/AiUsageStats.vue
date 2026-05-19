/** * AI 使用统计 * @description 展示 AI 调用次数、Token
消耗、配额使用等统计数据，支持使用日志和会话管理 * @module admin/ai/AiUsageStats * @see
api/sys/ai.ts (AiUsageStore, AiChannelStore) */
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
              <el-input
                v-model="logSearchForm.userId"
                clearable
                placeholder="用户ID"
                style="width: 120px"
              />
            </el-form-item>
            <el-form-item label="渠道">
              <el-select
                v-model="logSearchForm.channelConfigId"
                clearable
                placeholder="全部"
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
              <el-select
                v-model="logSearchForm.successStatus"
                clearable
                placeholder="全部"
                style="width: 100px"
              >
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

          <DataTable
            :data="usageStore.usageLogs"
            :loading="usageStore.usageLogLoading"
            :total="usageStore.usageLogTotal"
            v-model:current-page="logPagination.current"
            v-model:page-size="logPagination.size"
            :page-sizes="[10, 20, 50]"
            pagination-layout="total, sizes, prev, pager, next, jumper"
            :show-card="false"
            @size-change="handleLogSizeChange"
            @page-change="handleLogPageChange"
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
            <el-table-column
              prop="errorCode"
              label="错误码"
              width="120"
              align="center"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.errorCode || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="RAG" width="80" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.ragEnabled === 1" type="success" size="small">启用</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="RAG命中" width="90" align="center">
              <template #default="{ row }">
                {{ row.ragHitCount ?? '-' }}
              </template>
            </el-table-column>
            <el-table-column label="RAG耗时" width="100" align="center">
              <template #default="{ row }">
                {{ row.ragDurationMs != null ? `${row.ragDurationMs}ms` : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="时间" min-width="170" align="center">
              <template #default="{ row }">
                {{ formatAiDate(row.createdAt) }}
              </template>
            </el-table-column>
          </DataTable>
        </el-tab-pane>

        <!-- 会话管理 Tab -->
        <el-tab-pane label="会话管理" name="sessions">
          <el-form :model="sessionSearchForm" inline class="search-form">
            <el-form-item label="用户ID">
              <el-input
                v-model="sessionSearchForm.userId"
                clearable
                placeholder="用户ID"
                style="width: 120px"
              />
            </el-form-item>
            <el-form-item label="渠道">
              <el-select
                v-model="sessionSearchForm.channelConfigId"
                clearable
                placeholder="全部"
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
              <el-select
                v-model="sessionSearchForm.status"
                clearable
                placeholder="全部"
                style="width: 100px"
              >
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

          <DataTable
            :data="usageStore.sessions"
            :loading="usageStore.sessionLoading"
            :total="usageStore.sessionTotal"
            v-model:current-page="sessionPagination.current"
            v-model:page-size="sessionPagination.size"
            :page-sizes="[10, 20, 50]"
            pagination-layout="total, sizes, prev, pager, next, jumper"
            :show-card="false"
            @size-change="handleSessionSizeChange"
            @page-change="handleSessionPageChange"
          >
            <el-table-column prop="id" label="ID" width="70" align="center" />
            <el-table-column prop="userId" label="用户ID" width="80" align="center" />
            <el-table-column prop="username" label="用户名" min-width="100" align="center" />
            <el-table-column prop="nickname" label="昵称" min-width="100" align="center" />
            <el-table-column
              prop="channelName"
              label="渠道"
              min-width="140"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column
              prop="title"
              label="会话标题"
              min-width="160"
              align="center"
              show-overflow-tooltip
            />
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
          </DataTable>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useAiUsageStore, useAiChannelStore } from '@/stores'
import DataTable from '@/components/common/DataTable.vue'
import {
  AI_SUCCESS_STATUS_OPTIONS,
  AI_SESSION_STATUS_OPTIONS,
  formatAiDate,
  formatAiSuccessStatus,
  formatAiSessionStatus,
} from '@/utils'

// Store 实例
const usageStore = useAiUsageStore()
const channelStore = useAiChannelStore()

// 当前激活的 Tab 页
const activeTab = ref('logs')

// 统计数据引用（响应式更新）
const stats = computed(() => usageStore.usageStats)

// 日志搜索时间范围 [开始时间, 结束时间]
const logTimeRange = ref<[string, string] | null>(null)
// 会话搜索时间范围 [开始时间, 结束时间]
const sessionTimeRange = ref<[string, string] | null>(null)

// 日期选择器的默认时间（用于设置结束时间为当天 23:59:59）
const defaultTime: [Date, Date] = [new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]

// 日志搜索表单
const logSearchForm = reactive({
  userId: undefined as number | undefined,
  channelConfigId: undefined as number | undefined,
  successStatus: undefined as number | undefined,
})

// 日志分页
const logPagination = reactive({ current: 1, size: 20 })

// 会话搜索表单
const sessionSearchForm = reactive({
  userId: undefined as number | undefined,
  channelConfigId: undefined as number | undefined,
  status: undefined as number | undefined,
})

// 会话分页
const sessionPagination = reactive({ current: 1, size: 20 })

/**
 * 格式化 Token 数量显示
 * - 超过 10000 显示为 "Xw" 格式（万）
 * - 否则使用千分位格式化
 * @param value - Token 数量
 */
function formatTokenCount(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`
  return value.toLocaleString()
}

// ==================== 日志相关操作 ====================

/**
 * 获取使用日志列表
 */
async function fetchLogs(): Promise<void> {
  await usageStore.fetchUsageLogs({
    ...logSearchForm,
    startTime: logTimeRange.value?.[0],
    endTime: logTimeRange.value?.[1],
    current: logPagination.current,
    size: logPagination.size,
  })
}

/**
 * 日志搜索 - 重置到第一页并刷新数据
 */
function handleLogSearch(): void {
  logPagination.current = 1
  void fetchLogs()
  void fetchStats()
}

/**
 * 重置日志搜索条件
 */
function handleLogReset(): void {
  logSearchForm.userId = undefined
  logSearchForm.channelConfigId = undefined
  logSearchForm.successStatus = undefined
  logTimeRange.value = null
  logPagination.current = 1
  void fetchLogs()
  void fetchStats()
}

/**
 * 日志每页条数变更
 * @param size - 新的每页条数
 */
function handleLogSizeChange(size: number): void {
  logPagination.size = size
  logPagination.current = 1
  void fetchLogs()
}

/**
 * 日志页码变更
 * @param current - 新的页码
 */
function handleLogPageChange(current: number): void {
  logPagination.current = current
  void fetchLogs()
}

// ==================== 会话相关操作 ====================

/**
 * 获取会话列表
 */
async function fetchSessions(): Promise<void> {
  await usageStore.fetchSessions({
    ...sessionSearchForm,
    startTime: sessionTimeRange.value?.[0],
    endTime: sessionTimeRange.value?.[1],
    current: sessionPagination.current,
    size: sessionPagination.size,
  })
}

/**
 * 会话搜索 - 重置到第一页并刷新数据
 */
function handleSessionSearch(): void {
  sessionPagination.current = 1
  void fetchSessions()
}

/**
 * 重置会话搜索条件
 */
function handleSessionReset(): void {
  sessionSearchForm.userId = undefined
  sessionSearchForm.channelConfigId = undefined
  sessionSearchForm.status = undefined
  sessionTimeRange.value = null
  sessionPagination.current = 1
  void fetchSessions()
}

/**
 * 会话每页条数变更
 * @param size - 新的每页条数
 */
function handleSessionSizeChange(size: number): void {
  sessionPagination.size = size
  sessionPagination.current = 1
  void fetchSessions()
}

/**
 * 会话页码变更
 * @param current - 新的页码
 */
function handleSessionPageChange(current: number): void {
  sessionPagination.current = current
  void fetchSessions()
}

/**
 * 获取统计数据（总调用次数、成功/失败次数、Token 消耗等）
 */
async function fetchStats(): Promise<void> {
  await usageStore.fetchUsageStats({
    ...logSearchForm,
    startTime: logTimeRange.value?.[0],
    endTime: logTimeRange.value?.[1],
  })
}

/**
 * Tab 页切换处理
 * @param tab - 切换后的 Tab 标识
 */
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
</style>
