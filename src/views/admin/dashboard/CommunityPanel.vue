<template>
  <el-card shadow="never" class="panel-card">
    <template #header>
      <div class="panel-header">
        <span>社区统计</span>
      </div>
    </template>

    <div class="stat-items">
      <div v-for="item in stats" :key="item.label" class="stat-item">
        <div class="stat-value" :style="{ color: item.color }">{{ item.value }}</div>
        <div class="stat-label">{{ item.label }}</div>
      </div>
    </div>

    <div
      v-if="community?.hotSections?.length"
      ref="chartContainer"
      class="chart-container"
    />
    <el-empty v-else description="暂无热门版块数据" :image-size="48" />
  </el-card>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import type { DashboardCommunityVO } from '@/types/api-types'
import { useECharts } from '@/composables/useECharts'

const props = defineProps<{
  community: DashboardCommunityVO | null
}>()

const chartContainer = ref<HTMLElement>()
const { init, setOption } = useECharts()

const stats = computed(() => [
  { label: '聊天消息', value: props.community?.chatMessageCount ?? 0, color: '#7c3aed' },
  { label: '大厅消息', value: props.community?.lobbyMessageCount ?? 0, color: '#0284c7' },
  { label: '群组数', value: props.community?.groupCount ?? 0, color: '#047857' },
  { label: '论坛发帖', value: props.community?.forumPostCount ?? 0, color: '#ea580c' },
  { label: '论坛回复', value: props.community?.forumReplyCount ?? 0, color: '#b45309' },
])

function updateChart() {
  const sections = props.community?.hotSections ?? []
  if (!sections.length || !chartContainer.value) return

  const sorted = [...sections].sort((a, b) => a.hotValue - b.hotValue)

  setOption({
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
    },
    grid: { left: 80, right: 16, top: 8, bottom: 16 },
    xAxis: {
      type: 'value',
      name: '热度值',
      nameTextStyle: { fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: sorted.map((s) => s.sectionName),
      axisLabel: { fontSize: 12 },
    },
    series: [
      {
        type: 'bar' as const,
        data: sorted.map((s) => s.hotValue),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#06b6d4' },
            ],
          },
          borderRadius: [0, 4, 4, 0],
        },
        barWidth: 16,
      },
    ],
  })
}

watch(
  () => props.community?.hotSections,
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
