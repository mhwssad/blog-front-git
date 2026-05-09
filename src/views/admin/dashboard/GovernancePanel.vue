<template>
  <el-card shadow="never" class="panel-card">
    <template #header>
      <div class="panel-header">
        <span>治理面板</span>
      </div>
    </template>

    <div class="stat-items">
      <div
        v-for="item in reportStats"
        :key="item.label"
        class="stat-item"
        :class="{ 'stat-item--warning': item.warning }"
      >
        <div class="stat-value" :style="{ color: item.color }">{{ item.value }}</div>
        <div class="stat-label">{{ item.label }}</div>
      </div>
    </div>

    <div class="extra-row">
      <div class="extra-item">
        <span class="extra-label">平均处理时长</span>
        <span class="extra-value">{{ governance?.averageHandleDurationMinutes ?? 0 }} 分钟</span>
      </div>
      <div class="extra-item">
        <span class="extra-label">待审核文章</span>
        <el-tag :type="pendingArticleReviewCount > 0 ? 'warning' : 'success'" size="small">
          {{ pendingArticleReviewCount }}
        </el-tag>
      </div>
      <div class="extra-item">
        <span class="extra-label">待审核作者申请</span>
        <el-tag :type="pendingAuthorAppCount > 0 ? 'warning' : 'success'" size="small">
          {{ pendingAuthorAppCount }}
        </el-tag>
      </div>
    </div>

    <div
      v-if="governance?.punishmentDistributions?.length"
      ref="chartContainer"
      class="chart-container"
    />
  </el-card>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import type { DashboardGovernanceVO } from '@/types/api-types'
import { useECharts } from '@/composables/useECharts'

const props = defineProps<{
  governance: DashboardGovernanceVO | null
  pendingArticleReviewCount: number
  pendingAuthorAppCount: number
}>()

const chartContainer = ref<HTMLElement>()
const { init, setOption } = useECharts()

const reportStats = computed(() => [
  {
    label: '举报总数',
    value: props.governance?.reportCount ?? 0,
    color: '#64748b',
    warning: false,
  },
  {
    label: '待处理',
    value: props.governance?.pendingReportCount ?? 0,
    color: '#dc2626',
    warning: true,
  },
  {
    label: '处理中',
    value: props.governance?.processingReportCount ?? 0,
    color: '#ea580c',
    warning: false,
  },
  {
    label: '已处理',
    value: props.governance?.handledReportCount ?? 0,
    color: '#059669',
    warning: false,
  },
  {
    label: '已驳回',
    value: props.governance?.rejectedReportCount ?? 0,
    color: '#64748b',
    warning: false,
  },
])

function updateChart() {
  const distributions = props.governance?.punishmentDistributions ?? []
  if (!distributions.length || !chartContainer.value) return

  setOption({
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
    },
    grid: { left: 16, right: 16, top: 8, bottom: 16, containLabel: true },
    xAxis: {
      type: 'category',
      data: distributions.map((d) => d.punishmentType),
      axisLabel: { fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      name: '数量',
      nameTextStyle: { fontSize: 11 },
    },
    series: [
      {
        type: 'bar' as const,
        data: distributions.map((d) => d.count),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 1,
            x2: 0,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#f59e0b' },
              { offset: 1, color: '#ea580c' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: 28,
      },
    ],
  })
}

watch(
  () => props.governance?.punishmentDistributions,
  async (val) => {
    if (!val?.length) return
    await nextTick()
    if (chartContainer.value) {
      init(chartContainer.value)
      updateChart()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.panel-card {
  min-height: 0;
}

.panel-header {
  font-weight: 600;
}

.stat-items {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.stat-item {
  text-align: center;
  padding: 10px 6px;
  border-radius: 10px;
  background: var(--el-fill-color-light);
}

.stat-item--warning {
  background: var(--el-color-warning-light-9);
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.extra-row {
  display: flex;
  gap: 20px;
  padding: 8px 12px;
  margin-bottom: 10px;
  border-radius: 10px;
  background: var(--el-fill-color-light);
}

.extra-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.extra-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.extra-value {
  font-size: 13px;
  font-weight: 600;
}

.chart-container {
  width: 100%;
  height: 200px;
}

@media (max-width: 768px) {
  .stat-items {
    grid-template-columns: repeat(3, 1fr);
  }

  .extra-row {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
