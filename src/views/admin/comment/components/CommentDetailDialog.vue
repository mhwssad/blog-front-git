<template>
  <el-dialog
    v-model="dialogVisible"
    title="评论详情"
    width="720px"
    destroy-on-close
    align-center
    @close="handleClose"
  >
    <div v-if="!comment" style="text-align: center; padding: 32px; color: var(--el-text-color-secondary)">
      暂无数据
    </div>

    <template v-else>
      <div class="detail-user">
        <el-avatar v-if="comment.userAvatar" :src="comment.userAvatar" :size="40" />
        <div class="detail-user__info">
          <span class="detail-user__name">{{ comment.userNickname || '匿名用户' }}</span>
          <span class="detail-user__meta">ID {{ comment.userId }} · {{ formatCreatedAt(comment.createdAt) }}</span>
        </div>
        <el-tag
          size="small"
          :type="comment.status === 1 ? 'success' : comment.status === 2 ? 'warning' : 'info'"
          style="margin-left: auto"
        >
          {{ formatCommentStatus(comment.status) }}
        </el-tag>
      </div>

      <div v-if="parentComment" class="parent-section">
        <div class="parent-label">回复的评论</div>
        <div class="parent-body">
          <div class="parent-user">
            <el-avatar v-if="parentComment.userAvatar" :src="parentComment.userAvatar" :size="28" />
            <span class="parent-user__name">{{ parentComment.userNickname || '匿名用户' }}</span>
            <span class="parent-user__time">{{ formatCreatedAt(parentComment.createdAt) }}</span>
          </div>
          <p class="parent-content">{{ parentComment.content }}</p>
          <div v-if="parentComment.images?.length" class="parent-images">
            <el-image
              v-for="(image, index) in parentComment.images"
              :key="index"
              class="parent-image"
              :src="image"
              fit="cover"
              :preview-src-list="parentComment.images"
            />
          </div>
        </div>
      </div>

      <div class="detail-content">
        <p>{{ comment.content }}</p>
        <div v-if="comment.images?.length" class="detail-images">
          <el-image
            v-for="(image, index) in comment.images"
            :key="index"
            class="detail-image"
            :src="image"
            fit="cover"
            :preview-src-list="comment.images"
          />
        </div>
      </div>

      <el-descriptions :column="3" border size="small">
        <el-descriptions-item label="评论目标">
          <el-tag size="small" effect="plain">{{ formatTargetType(comment.targetType) }}</el-tag>
          <span style="margin-left: 6px; color: var(--el-text-color-secondary)">编号 {{ comment.targetId }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="评论层级">
          <template v-if="comment.rootId">
            <span>属于讨论 #{{ comment.rootId }}</span>
            <template v-if="comment.parentId && comment.parentId !== comment.rootId">
              <el-divider direction="vertical" />
              <span>回复 #{{ comment.parentId }}</span>
            </template>
          </template>
          <span v-else>顶级评论</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag size="small" :type="comment.status === 1 ? 'success' : comment.status === 2 ? 'warning' : 'info'">
            {{ formatCommentStatus(comment.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="点赞数">
          <span class="stat-value">
            <el-icon :size="14" style="vertical-align: middle; margin-right: 2px"><Star /></el-icon>
            {{ comment.likeCount }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="回复数">
          <span class="stat-value">
            <el-icon :size="14" style="vertical-align: middle; margin-right: 2px"><ChatDotRound /></el-icon>
            {{ comment.replyCount }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="评论编号">
          #{{ comment.id }}
        </el-descriptions-item>
        <el-descriptions-item label="发表时间" :span="2">
          {{ formatCreatedAt(comment.createdAt) }}
        </el-descriptions-item>
      </el-descriptions>

      <div v-if="replyTree.length" class="reply-section">
        <div class="section-title">回复 ({{ comment.replyCount }})</div>
        <el-tree
          class="reply-tree"
          :data="replyTree"
          :props="{ children: 'children' }"
          node-key="id"
          default-expand-all
          :expand-on-click-node="false"
        >
          <template #default="{ data }">
            <div class="reply-node">
              <div class="reply-node__header">
                <span class="reply-node__author">{{ data.userNickname || '匿名用户' }}</span>
                <el-tag size="small" :type="data.status === 1 ? 'success' : data.status === 2 ? 'warning' : 'info'">
                  {{ formatCommentStatus(data.status) }}
                </el-tag>
                <span class="reply-node__time">{{ formatCreatedAt(data.createdAt) }}</span>
              </div>
              <p class="reply-node__content">{{ data.content }}</p>
            </div>
          </template>
        </el-tree>
      </div>
    </template>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, type PropType } from 'vue'
import { Star, ChatDotRound } from '@element-plus/icons-vue'
import type { CommentVO } from '@/types/api-types'
import { formatCommentStatus, formatCreatedAt, formatTargetType } from '@/utils/contentAdmin'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  comment: {
    type: Object as PropType<CommentVO | null>,
    default: null,
  },
  parentComment: {
    type: Object as PropType<CommentVO | null>,
    default: null,
  },
})

const emit = defineEmits(['update:visible'])

const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

function buildReplyTree(items: CommentVO[]): CommentVO[] {
  return items.map(item => ({
    ...item,
    children: item.children ? buildReplyTree(item.children) : [],
  }))
}

const replyTree = computed(() => {
  if (!props.comment?.children?.length) return []
  return buildReplyTree(props.comment.children)
})

function handleClose(): void {
  dialogVisible.value = false
}
</script>

<style scoped>
.detail-user {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-user__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-user__name {
  font-weight: 600;
  font-size: 15px;
}

.detail-user__meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.parent-section {
  margin-bottom: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}

.parent-label {
  padding: 6px 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.parent-body {
  padding: 10px 12px;
}

.parent-user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.parent-user__name {
  font-weight: 500;
  font-size: 13px;
}

.parent-user__time {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  margin-left: auto;
}

.parent-content {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}

.parent-images {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.parent-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
}

.detail-content {
  margin-bottom: 16px;
}

.detail-content p {
  margin: 0 0 8px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.7;
}

.detail-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
}

.reply-section {
  margin-top: 16px;
}

.section-title {
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
}

.reply-tree {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 8px;
}

.reply-node {
  padding: 8px 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.reply-node__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.reply-node__author {
  font-weight: 500;
  font-size: 13px;
}

.reply-node__time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: auto;
}

.reply-node__content {
  margin: 0;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-word;
}

.stat-value {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
</style>
