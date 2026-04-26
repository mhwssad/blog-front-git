<template>
  <div class="comment-item" :class="{ 'is-reply': isReply }">
    <div class="comment-avatar">
      <el-avatar :size="36" :src="comment.userAvatar ?? undefined">
        {{ comment.userNickname?.charAt(0) }}
      </el-avatar>
    </div>

    <div class="comment-body">
      <div class="comment-header">
        <span class="comment-nickname">{{ comment.userNickname }}</span>
        <span class="comment-time">{{ comment.createdAt }}</span>
      </div>

      <div class="comment-content">{{ comment.content }}</div>

      <div class="comment-actions">
        <el-button link size="small" @click="toggleLike">
          <el-icon><Star /></el-icon>
          {{ comment.likeCount }}
        </el-button>
        <el-button link size="small" @click="toggleReply">回复</el-button>
        <el-button
          v-if="isOwner"
          link
          size="small"
          type="danger"
          @click="emit('delete', comment.id)"
        >
          删除
        </el-button>
      </div>

      <div v-if="showReplyInput" class="reply-input">
        <el-input
          v-model="replyContent"
          size="small"
          placeholder="回复..."
          maxlength="500"
          @keyup.enter="submitReply"
        />
        <el-button size="small" type="primary" :disabled="!replyContent.trim()" @click="submitReply">
          发送
        </el-button>
      </div>

      <div v-if="comment.children?.length" class="comment-children">
        <CommentItem
          v-for="child in comment.children"
          :key="child.id"
          :comment="child"
          :current-user-id="currentUserId"
          :is-reply="true"
          @reply="emit('reply', $event)"
          @like="emit('like', $event)"
          @delete="emit('delete', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { Star } from '@element-plus/icons-vue'
import type { CommentVO } from '@/api/types'

const props = withDefaults(
  defineProps<{
    comment: CommentVO
    currentUserId?: number
    isReply?: boolean
  }>(),
  { isReply: false },
)

const emit = defineEmits<{
  reply: [data: { content: string; rootId: number; parentId: number }]
  like: [id: number]
  delete: [id: number]
}>()

const showReplyInput = ref(false)
const replyContent = ref('')

const isOwner = computed(() => props.currentUserId === props.comment.userId)

function toggleLike(): void {
  emit('like', props.comment.id)
}

function toggleReply(): void {
  showReplyInput.value = !showReplyInput.value
  replyContent.value = ''
}

function submitReply(): void {
  if (!replyContent.value.trim()) return
  const rootId = props.comment.rootId && props.comment.rootId !== 0
    ? props.comment.rootId
    : props.comment.id
  emit('reply', {
    content: replyContent.value.trim(),
    rootId,
    parentId: props.comment.id,
  })
  showReplyInput.value = false
  replyContent.value = ''
}
</script>

<style scoped>
.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
}

.comment-item:not(:last-child) {
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-nickname {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.comment-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.comment-content {
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.reply-input {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.comment-children {
  margin-top: 4px;
  padding-left: 12px;
  border-left: 2px solid var(--el-border-color-lighter);
}
</style>
