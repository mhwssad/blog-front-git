<template>
  <div class="sidebar-comments">
    <div class="sidebar-block-title">最新评论</div>
    <div v-if="comments.length" class="comment-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <el-avatar :size="28" :src="comment.userAvatar ?? undefined">
          {{ comment.userNickname?.charAt(0) }}
        </el-avatar>
        <div class="comment-body">
          <div class="comment-top">
            <span class="comment-name">{{ comment.userNickname }}</span>
            <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
          </div>
          <p class="comment-text">{{ comment.content }}</p>
        </div>
      </div>
    </div>
    <div v-else class="sidebar-empty">暂无评论</div>
  </div>
</template>

<script lang="ts" setup>
import type { PublicCommentVO } from '@/types/api-types'

defineProps<{
  comments: PublicCommentVO[]
  formatDate: (value?: string | null) => string
}>()
</script>

<style scoped>
.sidebar-block-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-item {
  display: flex;
  gap: 10px;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.comment-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.comment-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.comment-text {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-empty {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
</style>
