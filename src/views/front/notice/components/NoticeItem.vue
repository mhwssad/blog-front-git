<template>
  <div class="notice-item" :class="{ unread: notice.isRead === 0 }" @click="emit('click', notice)">
    <div class="notice-dot" />
    <div class="notice-body">
      <div class="notice-header">
        <span class="notice-title">{{ notice.title }}</span>
        <span class="notice-time">{{ notice.publishTime ?? notice.createTime }}</span>
      </div>
      <div class="notice-summary">{{ notice.content }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * 通知项组件
 * @description 展示单条通知，包含标题、时间和内容摘要，支持点击查看详情
 * @module front/notice/components/NoticeItem
 */
import type { UserNoticeVO } from '@/types/api-types'

defineProps<{
  notice: UserNoticeVO
}>()

const emit = defineEmits<{
  click: [notice: UserNoticeVO]
}>()
</script>

<style scoped>
.notice-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.notice-item:hover {
  background: var(--el-fill-color-light);
}

.notice-item:not(:last-child) {
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.notice-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: transparent;
  flex-shrink: 0;
  margin-top: 6px;
}

.notice-item.unread .notice-dot {
  background: var(--el-color-primary);
}

.notice-body {
  flex: 1;
  min-width: 0;
}

.notice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.notice-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-item.unread .notice-title {
  font-weight: 600;
}

.notice-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

.notice-summary {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
