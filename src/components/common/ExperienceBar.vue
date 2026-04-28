<template>
  <div class="experience-bar">
    <div class="experience-bar__header">
      <UserLevelBadge :level="level" />
      <span v-if="showText" class="experience-bar__progress-text">
        {{ current }}/{{ total }} 经验
      </span>
    </div>
    <el-progress
      :percentage="percentage"
      :stroke-width="10"
      :show-text="false"
      color="#409eff"
    />
    <div v-if="showText && level < 10" class="experience-bar__next">
      下一个等级: Lv.{{ level + 1 }} 还需 {{ total - current }} 经验
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import UserLevelBadge from './UserLevelBadge.vue'

interface Props {
  current: number
  total: number
  level: number
  showText?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showText: true,
})

const percentage = computed(() => {
  if (props.total <= 0) return 0
  return Math.min(Math.round((props.current / props.total) * 100), 100)
})
</script>

<style scoped>
.experience-bar {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.experience-bar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.experience-bar__progress-text {
  font-size: 12px;
  color: #909399;
}

.experience-bar__next {
  font-size: 12px;
  color: #909399;
}
</style>
