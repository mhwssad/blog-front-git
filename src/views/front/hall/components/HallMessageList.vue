<template>
  <div class="hall-message-list" ref="listRef">
    <template v-if="messages.length">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="hall-message-item"
        :class="{ 'is-system': msg.isSystem }"
      >
        <template v-if="msg.isSystem">
          <span class="system-text">{{ msg.content }}</span>
        </template>
        <template v-else>
          <el-avatar :size="32">{{ msg.username.charAt(0) }}</el-avatar>
          <div class="msg-body">
            <div class="msg-header">
              <span class="msg-username">{{ msg.username }}</span>
              <user-level-badge :level="msg.level" />
            </div>
            <div class="msg-content">{{ msg.content }}</div>
          </div>
          <span class="msg-time">{{ msg.time }}</span>
        </template>
      </div>
    </template>
    <el-empty v-else description="暂无消息" :image-size="64" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue'

export interface HallMessage {
  id: number
  username: string
  level: number
  content: string
  time: string
  isSystem: boolean
}

const props = defineProps<{
  messages: HallMessage[]
}>()

const listRef = ref<HTMLElement | null>(null)

function scrollToBottom(): void {
  nextTick(() => {
    if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
  })
}

watch(() => props.messages.length, scrollToBottom)
</script>

<style scoped>
.hall-message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.hall-message-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 16px;
}

.hall-message-item.is-system {
  justify-content: center;
  margin-bottom: 12px;
}

.system-text {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light);
  padding: 4px 12px;
  border-radius: 12px;
}

.msg-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.msg-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.msg-username {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.msg-content {
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.msg-time {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  margin-top: 2px;
}
</style>
