<template>
  <el-card shadow="never" class="panel-card">
    <template #header>
      <div class="panel-header">
        <span>AI 统计</span>
      </div>
    </template>

    <div class="stat-items">
      <div v-for="item in stats" :key="item.label" class="stat-item">
        <div class="stat-value" :style="{ color: item.color }">{{ item.value }}</div>
        <div class="stat-label">{{ item.label }}</div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-wrapper">
        <div ref="aiChartContainer" class="chart-container" />
      </div>
      <div class="chart-wrapper">
        <div ref="agentChartContainer" class="chart-container" />
      </div>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import type { DashboardAiVO } from '@/types/api-types'
import { useECharts } from '@/composables/useECharts'

const props = defineProps<{
  ai: DashboardAiVO | null
}>()

const aiChartContainer = ref<HTMLElement>()
const agentChartContainer = ref<HTMLElement>()
const { init: initAi, setOption: setAiOption } = useECharts()
const { init: initAgent, setOption: setAgentOption } = useECharts()

const stats = computed(() => [
  { label: '调用总数', value: props.ai?.aiCallCount ?? 0, color: '#6366f1' },
  { label: 'RAG 调用', value: props.ai?.ragCallCount ?? 0, color: '#0891b2' },
  { label: 'Agent 任务', value: props.ai?.agentTaskCount ?? 0, color: '#059669' },
])

function buildPieOption(
  success: number,
  failed: number,
  title: string,
  successColor: string,
  failedColor: string,
) {
  const total = success + failed
  const rate = total > 0 ? ((success / total) * 100).toFixed(1) : '0.0'

  return {
    title: {
      text: `${rate}%`,
      subtext: title,
      left: 'center',
      top: 'center',
      textStyle: { fontSize: 16, fontWeight: 700 },
      subtextStyle: { fontSize: 11, color: '#909399' },
    },
    tooltip: {
      trigger: 'item' as const,
      formatter: '{b}: {c} ({d}%)',
    },
    series: [
      {
        type: 'pie' as const,
        radius: ['55%', '80%'],
        center: ['50%', '50%'],
        label: { show: false },
        data: [
          { value: success, name: '成功', itemStyle: { color: successColor } },
          { value: failed, name: '失败', itemStyle: { color: failedColor } },
        ],
      },
    ],
  }
}

function updateCharts() {
  if (!props.ai) return

  setAiOption(
    buildPieOption(
      props.ai.aiSuccessCallCount,
      props.ai.aiFailedCallCount,
      'AI 调用率',
      '#10b981',
      '#ef4444',
    ),
  )

  setAgentOption(
    buildPieOption(
      props.ai.agentSuccessTaskCount,
      props.ai.agentFailedTaskCount,
      'Agent 成功率',
      '#3b82f6',
      '#f59e0b',
    ),
  )
}

watch(() => props.ai, updateCharts, { deep: true })

onMounted(() => {
  if (aiChartContainer.value) {
    initAi(aiChartContainer.value)
  }
  if (agentChartContainer.value) {
    initAgent(agentChartContainer.value)
  }
  updateCharts()
})
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
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.stat-item {
  text-align: center;
  padding: 10px 6px;
  border-radius: 10px;
  background: var(--el-fill-color-light);
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

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.chart-wrapper {
  min-width: 0;
}

.chart-container {
  width: 100%;
  height: 180px;
}

@media (max-width: 768px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}
</style>
