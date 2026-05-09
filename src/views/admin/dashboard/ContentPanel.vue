<template>
  <el-card shadow="never" class="panel-card">
    <template #header>
      <div class="panel-header">
        <span>内容统计</span>
      </div>
    </template>

    <div class="stat-items">
      <div v-for="item in items" :key="item.label" class="stat-item">
        <div class="stat-value" :style="{ color: item.color }">{{ item.value }}</div>
        <div class="stat-label">{{ item.label }}</div>
      </div>
    </div>

    <div ref="chartContainer" class="chart-container" />
  </el-card>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import type { DashboardContentVO } from '@/types/api-types'
import { useECharts } from '@/composables/useECharts'

const props = defineProps<{
  content: DashboardContentVO | null
}>()

const chartContainer = ref<HTMLElement>()
const { init, setOption } = useECharts()

const colors = ['#047857', '#dc2626', '#7c3aed', '#ea580c', '#0284c7']

function getColor(index: number): string {
  return colors[index] ?? colors[0]!
}

const items = computed(() => [
  { label: '发文数', value: props.content?.articleCount ?? 0, color: colors[0] },
  { label: '待审核', value: props.content?.pendingArticleReviewCount ?? 0, color: colors[1] },
  { label: '评论数', value: props.content?.commentCount ?? 0, color: colors[2] },
  { label: '点赞数', value: props.content?.likeCount ?? 0, color: colors[3] },
  { label: '收藏数', value: props.content?.collectCount ?? 0, color: colors[4] },
])

function updateChart() {
  if (!chartContainer.value) return

  setOption({
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
    },
    grid: { left: 60, right: 16, top: 8, bottom: 16 },
    xAxis: {
      type: 'value',
      nameTextStyle: { fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: items.value.map((i) => i.label),
      axisLabel: { fontSize: 12 },
    },
    series: [
      {
        type: 'bar' as const,
        data: items.value.map((item, idx) => ({
          value: item.value,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: getColor(idx) },
                { offset: 1, color: `${getColor(idx)}88` },
              ],
            },
            borderRadius: [0, 4, 4, 0],
          },
        })),
        barWidth: 16,
      },
    ],
  })
}

watch(() => props.content, updateChart, { deep: true })

onMounted(() => {
  if (chartContainer.value) {
    init(chartContainer.value)
    updateChart()
  }
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
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.stat-item {
  text-align: center;
  padding: 12px 6px;
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

.chart-container {
  width: 100%;
  height: 200px;
}

@media (max-width: 768px) {
  .stat-items {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
