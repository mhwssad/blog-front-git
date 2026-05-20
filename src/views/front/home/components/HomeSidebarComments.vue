<template>
  <div class="sidebar-comments">
    <h3 class="sidebar-block-title">
      <el-icon aria-hidden="true" class="title-icon"><ChatDotSquare /></el-icon>
      最新评论
    </h3>
    <div v-if="comments.length" class="comment-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <img v-if="comment.userAvatar" :src="comment.userAvatar" class="comment-avatar" alt="" />
        <div v-else class="comment-avatar comment-avatar--placeholder">
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
import { ChatDotSquare } from '@element-plus/icons-vue'
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
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.title-icon {
  color: var(--el-color-primary);
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.comment-item {
  display: flex;
  gap: 10px;
}

.comment-item:not(:last-child) {
  padding-bottom: 14px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
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
  gap: 8px;
  margin-bottom: 4px;
}

.comment-nickname {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.comment-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.comment-content {
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sidebar-empty {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-align: center;
  padding: 8px 0;
}
</style>
