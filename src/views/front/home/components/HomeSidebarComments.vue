<template>
  <div class="sidebar-comments">
    <div class="sidebar-block-title">最新评论</div>
    <div v-if="comments.length" class="comment-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <img v-if="comment.userAvatar" :src="comment.userAvatar" class="comment-avatar" alt="" />
        <div v-else class="comment-avatar comment-avatar-placeholder">
          {{ comment.userNickname?.charAt(0) }}
        </div>
        <div class="comment-body">
          <div class="comment-meta">
            <span class="comment-nickname">{{ comment.userNickname }}</span>
            <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
        </div>
      </div>
    </div>
    <div v-else class="sidebar-empty">暂无评论</div>
  </div>
</template>

<script lang="ts" setup>
/**
 * 侧边栏最新评论组件
 * @description 展示最近的用户评论，支持日期格式化
 * @module front/home/components/HomeSidebarComments
 */
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
  gap: 10px;
}

.comment-item {
  display: flex;
  gap: 10px;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  font-size: 13px;
  font-weight: 600;
}

.comment-body {
  min-width: 0;
  flex: 1;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.comment-nickname {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.comment-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.comment-content {
  font-size: 13px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-empty {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
</style>
