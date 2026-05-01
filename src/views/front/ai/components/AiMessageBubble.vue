<template>
  <div :class="['message-bubble', `message-bubble--${role}`]">
    <div class="bubble-content">
      <div class="bubble-text">{{ content }}</div>
      <div v-if="errorMessage" class="bubble-error">
        <el-icon><WarningFilled /></el-icon>
        {{ errorMessage }}
      </div>
    </div>
    <div v-if="createdAt" class="bubble-time">{{ createdAt }}</div>
  </div>
</template>

<script lang="ts" setup>
import { WarningFilled } from '@element-plus/icons-vue'

defineProps<{
  role: 'user' | 'assistant' | 'system'
  content: string
  errorMessage?: string
  createdAt?: string
}>()
</script>

<style scoped>
.message-bubble {
  display: flex;
  flex-direction: column;
  max-width: 75%;
}

.message-bubble--user {
  align-self: flex-end;
}

.message-bubble--user .bubble-content {
  background: var(--el-color-primary);
  color: #fff;
  border-radius: 12px 12px 4px 12px;
}

.message-bubble--assistant {
  align-self: flex-start;
}

.message-bubble--assistant .bubble-content {
  background: #f4f4f5;
  color: var(--el-text-color-primary);
  border-radius: 12px 12px 12px 4px;
}

.message-bubble--system {
  align-self: center;
}

.message-bubble--system .bubble-content {
  background: var(--el-color-warning-light-5);
  color: var(--el-text-color-primary);
  border-radius: 8px;
  font-size: 13px;
}

.bubble-content {
  padding: 10px 16px;
  line-height: 1.6;
  word-break: break-word;
}

.bubble-text {
  white-space: pre-wrap;
  font-size: 14px;
}

.bubble-error {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-color-danger);
}

.message-bubble--user .bubble-error {
  color: rgba(255, 255, 255, 0.85);
}

.bubble-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  margin-top: 4px;
  padding: 0 4px;
}

.message-bubble--user .bubble-time {
  text-align: right;
}
</style>
