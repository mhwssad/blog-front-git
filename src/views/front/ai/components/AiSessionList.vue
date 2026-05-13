<template>
  <template v-for="session in sessions" :key="session.id">
    <button
      class="session-item"
      :class="{ 'is-active': selectedId === session.id }"
      type="button"
      @click="$emit('select', session.id)"
    >
      <div class="session-item__main">
        <div class="session-item__title">
          <span class="session-title-text">{{ session.title || '新对话' }}</span>
          <el-tag v-if="session.status === 0" size="small" type="info" effect="plain"> 关闭 </el-tag>
        </div>
        <div class="session-item__meta">
          <span>{{ session.sceneType || 'general' }}</span>
          <span>{{ formatAITime(session.lastMessageAt || session.updatedAt || session.createdAt) }}</span>
        </div>
      </div>
      <el-button
        v-if="session.status === 1"
        :icon="Close"
        circle
        size="small"
        text
        @click.stop="$emit('close', session.id)"
      />
    </button>
  </template>

  <el-empty v-if="sessions.length === 0" description="暂无会话" />
</template>

<script lang="ts" setup>
import { Close } from '@element-plus/icons-vue'
import type { AiSessionVO } from '@/types/api-types'
import { formatAITime } from './ai-helpers'

defineProps<{
  sessions: AiSessionVO[]
  selectedId: number | null
}>()

defineEmits<{
  select: [id: number]
  close: [id: number]
}>()
</script>

<style scoped>
.session-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 6px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.session-item:hover {
  background: var(--el-fill-color-light);
}

.session-item.is-active {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

.session-item__main {
  min-width: 0;
  flex: 1;
}

.session-item__title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.session-title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.session-item__meta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
</style>
