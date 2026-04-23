<template>
  <el-card shadow="never" class="sidebar-card">
    <template #header>
      <div class="sidebar-title-row">
        <el-tag type="primary" effect="plain" round>最新评论</el-tag>
        <el-icon class="title-icon"><ChatLineRound /></el-icon>
      </div>
    </template>

    <div class="comment-list">
      <article v-for="comment in comments" :key="comment.id" class="comment-item">
        <el-avatar :size="40" :src="comment.userAvatar || undefined">
          {{ comment.userNickname.slice(0, 1) }}
        </el-avatar>
        <div class="comment-copy">
          <div class="comment-topline">
            <strong>{{ comment.userNickname }}</strong>
            <span>{{ formatDate(comment.createdAt) }}</span>
          </div>
          <p>{{ comment.content }}</p>
        </div>
      </article>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { ChatLineRound } from '@element-plus/icons-vue'
import type { PublicCommentVO } from '@/api/types'

defineProps<{
  comments: PublicCommentVO[]
  formatDate: (value?: string | null) => string
}>()
</script>

<style scoped>
.sidebar-card {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
}

.sidebar-title-row,
.comment-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-icon {
  color: #94a3b8;
}

.comment-item {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 12px;
}

.comment-item + .comment-item {
  margin-top: 18px;
}

.comment-topline strong {
  font-size: 14px;
  color: #0f172a;
}

.comment-topline span {
  color: #94a3b8;
  font-size: 12px;
}

.comment-copy p {
  margin-top: 8px;
  color: #475569;
  font-size: 14px;
  line-height: 1.75;
}
</style>
