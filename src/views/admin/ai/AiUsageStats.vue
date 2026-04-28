<template>
  <div class="ai-usage-stats-page">
    <el-card shadow="never" style="margin-bottom: 16px">
      <div style="display: flex; justify-content: space-between; align-items: center">
        <span style="font-weight: 500">AI 调用统计</span>
        <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
          <el-radio-button value="today">今天</el-radio-button>
          <el-radio-button value="7days">近7天</el-radio-button>
          <el-radio-button value="30days">近30天</el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats.totalCalls.toLocaleString() }}</div>
          <div class="stat-label">总调用次数</div>
          <div class="stat-growth" :class="{ 'stat-growth--up': stats.totalCallsGrowth > 0 }">
            {{ stats.totalCallsGrowth > 0 ? '+' : '' }}{{ stats.totalCallsGrowth }}%
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats.todayCalls.toLocaleString() }}</div>
          <div class="stat-label">今日调用</div>
          <div class="stat-growth" :class="{ 'stat-growth--up': stats.todayCallsGrowth > 0 }">
            {{ stats.todayCallsGrowth > 0 ? '+' : '' }}{{ stats.todayCallsGrowth }}%
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats.failureRate }}%</div>
          <div class="stat-label">失败率</div>
          <div class="stat-growth" :class="{ 'stat-growth--up': stats.failureRateChange < 0 }">
            {{ stats.failureRateChange > 0 ? '+' : '' }}{{ stats.failureRateChange }}%
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats.activeUsers }}</div>
          <div class="stat-label">活跃用户</div>
          <div class="stat-growth" :class="{ 'stat-growth--up': stats.activeUsersGrowth > 0 }">
            {{ stats.activeUsersGrowth > 0 ? '+' : '' }}{{ stats.activeUsersGrowth }}%
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" style="margin-bottom: 16px">
      <template #header>
        <span>趋势图</span>
      </template>
      <div class="chart-placeholder">ECharts 趋势图</div>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <span>用户 TOP10</span>
      </template>
      <el-table :data="topUsers" border stripe>
        <el-table-column prop="rank" label="排名" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.rank <= 3" :type="rankTagType(row.rank)" size="small" effect="dark">
              {{ row.rank }}
            </el-tag>
            <span v-else>{{ row.rank }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户" min-width="140" align="center" />
        <el-table-column prop="callCount" label="调用次数" min-width="120" align="center" />
        <el-table-column prop="lastUsedTime" label="最后使用时间" min-width="180" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'

interface StatsData {
  totalCalls: number
  totalCallsGrowth: number
  todayCalls: number
  todayCallsGrowth: number
  failureRate: number
  failureRateChange: number
  activeUsers: number
  activeUsersGrowth: number
}

interface TopUser {
  rank: number
  username: string
  callCount: number
  lastUsedTime: string
}

const timeRange = ref('7days')

const stats = reactive<StatsData>({
  totalCalls: 0,
  totalCallsGrowth: 0,
  todayCalls: 0,
  todayCallsGrowth: 0,
  failureRate: 0,
  failureRateChange: 0,
  activeUsers: 0,
  activeUsersGrowth: 0,
})

const topUsers = ref<TopUser[]>([])

function rankTagType(rank: number): 'info' | 'warning' | 'danger' {
  if (rank === 1) return 'danger'
  if (rank === 2) return 'warning'
  return 'info'
}

function handleTimeRangeChange() {
  loadStats()
}

function loadStats() {
  const statsMap: Record<string, StatsData> = {
    today: { totalCalls: 1520, totalCallsGrowth: 12, todayCalls: 1520, todayCallsGrowth: 8, failureRate: 2.1, failureRateChange: -0.3, activeUsers: 85, activeUsersGrowth: 5 },
    '7days': { totalCalls: 12680, totalCallsGrowth: 15, todayCalls: 1520, todayCallsGrowth: 8, failureRate: 1.8, failureRateChange: -0.5, activeUsers: 320, activeUsersGrowth: 10 },
    '30days': { totalCalls: 58400, totalCallsGrowth: 22, todayCalls: 1520, todayCallsGrowth: 8, failureRate: 2.3, failureRateChange: -0.8, activeUsers: 890, activeUsersGrowth: 18 },
  }
  Object.assign(stats, statsMap[timeRange.value])

  topUsers.value = [
    { rank: 1, username: '张三', callCount: 1280, lastUsedTime: '2026-04-28 09:30:00' },
    { rank: 2, username: '李四', callCount: 960, lastUsedTime: '2026-04-28 08:45:00' },
    { rank: 3, username: '王五', callCount: 840, lastUsedTime: '2026-04-28 10:15:00' },
    { rank: 4, username: '赵六', callCount: 720, lastUsedTime: '2026-04-27 22:30:00' },
    { rank: 5, username: '孙七', callCount: 680, lastUsedTime: '2026-04-27 18:00:00' },
    { rank: 6, username: '周八', callCount: 550, lastUsedTime: '2026-04-27 15:20:00' },
    { rank: 7, username: '吴九', callCount: 480, lastUsedTime: '2026-04-27 12:10:00' },
    { rank: 8, username: '郑十', callCount: 420, lastUsedTime: '2026-04-26 20:45:00' },
    { rank: 9, username: '钱十一', callCount: 380, lastUsedTime: '2026-04-26 16:30:00' },
    { rank: 10, username: '陈十二', callCount: 350, lastUsedTime: '2026-04-26 14:00:00' },
  ]
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.ai-usage-stats-page {
  padding: 20px;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.stat-growth {
  font-size: 13px;
  color: var(--el-color-danger);
  margin-top: 4px;
}

.stat-growth--up {
  color: var(--el-color-success);
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  color: var(--el-text-color-secondary);
  font-size: 16px;
}
</style>
