<template>
  <div class="reply-item" :class="{ 'reply-item--nested': depth > 0 }">
    <div class="reply-body">
      <div class="reply-main">
        <el-avatar :size="avatarSize" class="reply-avatar">
          {{ reply.userName?.charAt(0) }}
        </el-avatar>

        <div class="reply-content-wrap">
          <div class="reply-header">
            <span class="reply-username">{{ reply.userName }}</span>
            <el-tooltip :content="reply.createdAt" placement="top">
              <time class="reply-time">{{ DateUtils.formatRelativeTime(reply.createdAt) }}</time>
            </el-tooltip>
            <span class="reply-floor">#{{ reply.floorNo }}</span>
          </div>

          <div class="reply-content">{{ reply.content }}</div>

          <div class="reply-footer">
            <el-button size="small" text class="reply-like-btn" @click="$emit('like', reply.id)">
              <el-icon><Star /></el-icon>
              {{ formatCount(reply.likeCount) }}
            </el-button>
            <el-button size="small" text @click="$emit('reply', reply)">回复</el-button>
          </div>
        </div>
      </div>

      <div v-if="reply.children?.length && depth < 3" class="reply-children">
        <ForumReplyItem
          v-for="child in reply.children"
          :key="child.id"
          :reply="child"
          :post-id="postId"
          :depth="depth + 1"
          @reply="(r) => $emit('reply', r)"
          @like="(id) => $emit('like', id)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Star } from '@element-plus/icons-vue'
import type { ForumReplyVO } from '@/types/api-types'
import { DateUtils } from '@/utils/dateUtils'

const props = withDefaults(
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
  like: [replyId: number]
}>()

const avatarSize = computed(() => (props.depth > 0 ? 24 : 32))

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
</script>

<style scoped>
.reply-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.reply-item:last-child {
  border-bottom: none;
}

.reply-item--nested {
  border-bottom: none;
  padding: 10px 0;
}

.reply-main {
  display: flex;
  gap: 12px;
}

.reply-avatar {
  font-size: 12px;
  background: var(--el-color-primary-light-5);
  color: var(--el-color-primary-dark-2);
  flex-shrink: 0;
}

.reply-content-wrap {
  flex: 1;
  min-width: 0;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
}

.reply-username {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.reply-time {
  color: var(--el-text-color-placeholder);
  cursor: default;
}

.reply-floor {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  font-weight: 500;
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
  gap: 4px;
  margin-top: 6px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

.reply-like-btn {
  color: var(--el-text-color-placeholder);
}

.reply-like-btn:hover {
  color: var(--el-color-primary);
}

.reply-children {
  margin-top: 8px;
  padding-left: 28px;
  border-left: 2px solid var(--el-border-color-lighter, #ebeef5);
  background: var(--el-fill-color-lighter);
  border-radius: 0 8px 8px 0;
  padding-right: 12px;
}

@media (max-width: 640px) {
  .reply-main {
    gap: 8px;
  }

  .reply-children {
    padding-left: 16px;
  }
}
</style>
