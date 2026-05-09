<template>
  <section class="comment-section">
    <h3 class="section-title">评论 ({{ comments.length }})</h3>

    <div v-if="loggedIn && canComment" class="comment-input-area">
      <el-input
        v-model="newComment"
        type="textarea"
        :rows="3"
        placeholder="写下你的评论..."
        maxlength="500"
        show-word-limit
      />
      <div class="input-actions">
        <el-button
          type="primary"
          :loading="loading"
          :disabled="!newComment.trim()"
          @click="handleSubmit"
        >
          发表评论
        </el-button>
      </div>
    </div>
    <div v-else-if="!loggedIn" class="login-hint">
      <el-text type="info">登录后即可评论</el-text>
      <el-button type="primary" link @click="$router.push('/login')">去登录</el-button>
    </div>

    <div v-loading="loading" class="comment-list">
      <template v-if="comments.length">
        <CommentItem
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :current-user-id="currentUserId"
          @reply="handleReply"
          @like="emit('like', $event)"
          @delete="emit('delete', $event)"
        />
      </template>
      <el-empty v-else description="暂无评论，快来抢沙发" />
    </div>
  </section>
</template>

<script lang="ts" setup>
/**
 * 评论区域组件
 * @description 包含评论输入、评论列表展示，支持发表评论和回复
 * @module front/article/components/CommentSection
 */
import { ref } from 'vue'
import type { PublicCommentVO } from '@/types/api-types'
import CommentItem from './CommentItem.vue'

const props = defineProps<{
  comments: PublicCommentVO[]
  loading: boolean
  currentUserId?: number
  canComment: boolean
  loggedIn: boolean
}>()

const emit = defineEmits<{
  submit: [data: { content: string; rootId?: number; parentId?: number }]
  like: [id: number]
  delete: [id: number]
}>()

const newComment = ref('')

// 发表评论
function handleSubmit(): void {
  if (!newComment.value.trim()) return
  emit('submit', { content: newComment.value.trim() })
  newComment.value = ''
}

// 处理回复（转发给父组件）
function handleReply(data: { content: string; rootId: number; parentId: number }): void {
  emit('submit', data)
}
</script>

<style scoped>
.comment-section {
  padding: 24px 0;
}

.section-title {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
}

.comment-input-area {
  margin-bottom: 24px;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.login-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.comment-list {
  min-height: 60px;
}
</style>
