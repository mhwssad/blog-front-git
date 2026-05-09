<template>
  <div class="conversation-list">
    <div class="conv-header">
      <el-input
        v-model="keyword"
        placeholder="搜索会话"
        clearable
        size="small"
        @input="emit('search', keyword)"
      />
    </div>

    <div v-if="loading" class="conv-loading">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="conversations.length" class="conv-items">
      <div
        v-for="conv in conversations"
        :key="conv.id"
        class="conv-item"
        :class="{ active: activeId === conv.id }"
        @click="emit('select', conv.id)"
      >
        <el-avatar :size="40" :src="conv.avatar ?? undefined">
          {{ (conv.name ?? conv.targetNickname ?? '?').charAt(0) }}
        </el-avatar>
        <div class="conv-body">
          <div class="conv-top">
            <span class="conv-name">{{
              conv.name ?? conv.targetNickname ?? conv.targetUsername ?? '会话'
            }}</span>
            <span v-if="conv.unreadCount" class="conv-badge">{{ conv.unreadCount }}</span>
          </div>
          <div class="conv-preview">
            {{ conv.lastMessage?.content ?? '' }}
          </div>
        </div>
      </div>
    </div>

    <el-empty v-else description="暂无会话" :image-size="48" />
  </div>
</template>

<script lang="ts" setup>
/**
 * 会话列表组件
 * @description 展示用户的所有会话（含未读数），支持搜索过滤
 * @module front/chat/components/ConversationList
 */
import { ref } from 'vue'
import type { ChatConversationVO } from '@/types/api-types'

defineProps<{
  conversations: ChatConversationVO[]
  activeId?: number
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [id: number]
  search: [keyword: string]
}>()

// 搜索关键词
const keyword = ref('')
</script>

<style scoped>
.conversation-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.conv-header {
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.conv-loading {
  padding: 12px;
}

.conv-items {
  flex: 1;
  overflow-y: auto;
}

.conv-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.conv-item:hover {
  background: var(--el-fill-color-light);
}

.conv-item.active {
  background: var(--el-color-primary-light-9);
}

.conv-body {
  flex: 1;
  min-width: 0;
}

.conv-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.conv-name {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conv-badge {
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border-radius: 9px;
  background: var(--el-color-danger);
  color: #fff;
  flex-shrink: 0;
  padding: 0 5px;
}

.conv-preview {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}
</style>
