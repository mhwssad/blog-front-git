<template>
  <div class="message-list" ref="listRef">
    <div v-if="loading" class="msg-loading">
      <el-skeleton :rows="4" animated />
    </div>
    <template v-else-if="messages.length">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-item"
        :class="{ 'is-self': msg.senderId === currentUserId }"
      >
        <el-avatar :size="32" :src="msg.senderAvatar ?? undefined">
          {{ (msg.senderNickname ?? '?').charAt(0) }}
        </el-avatar>
        <div class="msg-body">
          <div class="msg-sender">{{ msg.senderNickname }}</div>
          <div v-if="msg.revoked" class="msg-revoked">消息已撤回</div>
          <div v-else class="msg-bubble">
            <div v-if="msg.reply" class="msg-reply">
              <span class="reply-name">{{ msg.reply.senderNickname }}</span>
              : {{ msg.reply.content ?? '[文件]' }}
            </div>
            <span>{{ msg.content }}</span>
          </div>
          <div class="msg-time">{{ msg.createdAt }}</div>
        </div>
        <el-dropdown v-if="!msg.revoked" trigger="click" class="msg-actions">
          <el-icon class="msg-more"><MoreFilled /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-if="msg.senderId === currentUserId" @click="emit('revoke', msg.id)">
                撤回
              </el-dropdown-item>
              <el-dropdown-item @click="emit('delete', msg.id)">删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </template>
    <el-empty v-else description="暂无消息" :image-size="64" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue'
import { MoreFilled } from '@element-plus/icons-vue'
import type { ChatMessageVO } from '@/types/api-types'

const props = defineProps<{
  messages: ChatMessageVO[]
  currentUserId?: number
  loading?: boolean
}>()

const emit = defineEmits<{
  revoke: [messageId: number]
  delete: [messageId: number]
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
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.msg-loading {
  padding: 16px 0;
}

.message-item {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.message-item.is-self {
  flex-direction: row-reverse;
}

.message-item.is-self .msg-body {
  align-items: flex-end;
}

.message-item.is-self .msg-bubble {
  background: var(--el-color-primary-light-9);
}

.msg-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 60%;
}

.msg-sender {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.msg-revoked {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  font-style: italic;
}

.msg-bubble {
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.msg-reply {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 4px 8px;
  margin-bottom: 4px;
  border-left: 2px solid var(--el-color-primary-light-5);
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.reply-name {
  font-weight: 500;
  color: var(--el-color-primary);
}

.msg-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.msg-actions {
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.message-item:hover .msg-actions {
  opacity: 1;
}

.msg-more {
  cursor: pointer;
  color: var(--el-text-color-placeholder);
  margin-top: 8px;
}
</style>
