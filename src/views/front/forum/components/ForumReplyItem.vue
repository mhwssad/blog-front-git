<template>
  <div class="reply-item">
    <div class="reply-header">
      <span class="reply-floor">#{{ reply.floorNo }}楼</span>
      <span class="reply-username">{{ reply.userName }}</span>
      <time class="reply-time">{{ DateUtils.formatRelativeTime(reply.createdAt) }}</time>
    </div>

    <div class="reply-content">{{ reply.content }}</div>

    <div class="reply-footer">
      <span class="reply-like">
        <el-icon aria-hidden="true"><Star /></el-icon>{{ formatCount(reply.likeCount) }}
      </span>
      <el-button size="small" text @click="$emit('reply', reply)">回复</el-button>
    </div>

    <div v-if="reply.children?.length && depth < 3" class="reply-children">
      <ForumReplyItem
        v-for="child in reply.children"
        :key="child.id"
        :reply="child"
        :post-id="postId"
        :depth="depth + 1"
        @reply="(r) => $emit('reply', r)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Star } from '@element-plus/icons-vue'
import type { ForumReplyVO } from '@/types/api-types'
import { DateUtils } from '@/utils/dateUtils'

withDefaults(
  defineProps<{
    reply: ForumReplyVO
    postId: number
    depth?: number
  }>(),
  {
    depth: 0,
  }
)

defineEmits<{
  reply: [reply: ForumReplyVO]
}>()

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
</script>

<style scoped>
.reply-item {
  padding: 12px 0;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
}

.reply-floor {
  color: var(--el-text-color-placeholder);
  font-weight: 500;
}

.reply-username {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.reply-time {
  color: var(--el-text-color-placeholder);
}

.reply-content {
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  word-break: break-word;
}

.reply-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 6px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

.reply-like {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.reply-children {
  margin-top: 4px;
  padding-left: 24px;
  border-left: 2px solid var(--el-border-color-lighter, #ebeef5);
}

@media (max-width: 640px) {
  .reply-children {
    padding-left: 16px;
  }
}
</style>
