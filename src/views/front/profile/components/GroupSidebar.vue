<template>
  <div class="group-sidebar">
    <div class="group-list">
      <div
        v-for="item in groups"
        :key="item.key"
        class="group-item"
        :class="{ active: modelValue === item.key }"
        @click="emit('update:modelValue', item.key)"
      >
        <el-icon :size="16">
          <component :is="item.icon" />
        </el-icon>
        <span class="group-label">{{ item.label }}</span>
        <span class="group-count">{{ item.count }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { User, Star, Hide, UserFilled } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: string
  followingCount: number
  specialCount: number
  whisperCount: number
  fanCount: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const groups = computed(() => [
  { key: 'all', label: '全部关注', icon: User, count: props.followingCount },
  { key: 'special', label: '特别关注', icon: Star, count: props.specialCount },
  { key: 'whisper', label: '悄悄关注', icon: Hide, count: props.whisperCount },
  { key: 'fans', label: '我的粉丝', icon: UserFilled, count: props.fanCount },
])
</script>

<style scoped>
.group-sidebar {
  width: 200px;
  flex-shrink: 0;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--el-text-color-regular);
  transition:
    background-color 0.2s,
    color 0.2s;
  user-select: none;
}

.group-item:hover {
  background-color: var(--el-fill-color-light);
}

.group-item.active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 500;
}

.group-label {
  flex: 1;
  min-width: 0;
}

.group-count {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.group-item.active .group-count {
  color: var(--el-color-primary);
  opacity: 0.7;
}

@media (max-width: 768px) {
  .group-sidebar {
    width: 100%;
  }

  .group-list {
    flex-direction: row;
    overflow-x: auto;
    gap: 8px;
    padding-bottom: 8px;
  }

  .group-item {
    flex-shrink: 0;
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>
