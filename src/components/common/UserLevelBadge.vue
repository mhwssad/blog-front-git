<template>
  <span class="user-level-badge" :style="badgeStyle">
    <span class="level-number">Lv.{{ level }}</span>
    <span v-if="size !== 'small'" class="level-title">{{ title }}</span>
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  level: number
  size?: 'small' | 'default'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
})

const titleMap: Record<number, string> = {
  1: '新用户',
  2: '初级用户',
  3: '活跃用户',
  4: '进阶用户',
  5: '成熟用户',
  6: '核心用户',
  7: '深度用户',
  8: '资深用户',
  9: '高阶用户',
  10: '社区核心',
}

const colorMap: Record<number, string> = {
  1: '#909399',
  2: '#67c23a',
  3: '#409eff',
  4: '#9b59b6',
  5: '#e6a23c',
  6: '#f56c6c',
  7: '#d4a017',
  8: '#d4a017',
  9: '#d4a017',
  10: '#d4a017',
}

const title = computed(() => titleMap[props.level] ?? '')
const color = computed(() => colorMap[props.level] ?? '#909399')

const badgeStyle = computed(() => ({
  '--badge-color': color.value,
}))
</script>

<style scoped>
.user-level-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1;
  background-color: color-mix(in srgb, var(--badge-color) 12%, transparent);
  color: var(--badge-color);
  font-weight: 500;
  white-space: nowrap;
}

.level-number {
  font-weight: 600;
}

.level-title {
  font-size: 11px;
  opacity: 0.9;
}
</style>
