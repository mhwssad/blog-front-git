<template>
  <el-dialog
    v-model="dialogVisible"
    width="820px"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    center
    @close="handleClose"
    class="comment-detail-dialog"
  >
    <template #title>评论详情</template>

    <div v-if="!comment" class="dialog-empty">
      <el-empty description="暂无评论详情" />
    </div>

    <div v-else class="detail-body">
      <div class="detail-overview">
        <div class="detail-overview__item">
          <span class="detail-overview__label">评论 ID</span>
          <span class="detail-overview__value">#{{ comment.id }}</span>
        </div>
        <div class="detail-overview__item">
          <span class="detail-overview__label">状态</span>
          <el-tag size="small" :type="comment.status === 1 ? 'success' : 'info'">
            {{ formatCommentStatus(comment.status) }}
          </el-tag>
        </div>
        <div class="detail-overview__item">
          <span class="detail-overview__label">目标</span>
          <el-tag size="small" effect="plain">{{ formatTargetType(comment.targetType) }}</el-tag>
        </div>
        <div class="detail-overview__item">
          <span class="detail-overview__label">互动</span>
          <span class="detail-overview__value">点赞 {{ comment.likeCount }} / 回复 {{ comment.replyCount }}</span>
        </div>
      </div>

      <el-descriptions :column="1" border size="small" label-align="right">
        <el-descriptions-item label="评论内容">
          <p class="comment-content">{{ comment.content }}</p>
        </el-descriptions-item>
        <el-descriptions-item v-if="comment.images?.length" label="评论图片">
          <div class="image-tiles">
            <el-image
              v-for="(image, index) in comment.images"
              :key="`img-${comment.id}-${index}`"
              class="comment-image"
              :src="image"
              fit="cover"
              :preview-src-list="comment.images"
            />
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="用户信息">
          <div class="user-info">
            <el-avatar v-if="comment.userAvatar" :src="comment.userAvatar" size="small" />
            <span class="user-title">
              {{ comment.userNickname || '匿名用户' }}（ID {{ comment.userId }})
            </span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="目标信息">
          {{ formatTargetType(comment.targetType) }} · ID {{ comment.targetId }}
        </el-descriptions-item>
        <el-descriptions-item label="关联评论">
          根评论 ID：{{ comment.rootId ?? '-' }} · 父评论 ID：{{ comment.parentId ?? '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="统计">
          点赞 {{ comment.likeCount }} · 回复 {{ comment.replyCount }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          {{ formatCommentStatus(comment.status) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatCreatedAt(comment.createdAt) }}
        </el-descriptions-item>
      </el-descriptions>

      <div v-if="replyTree.length" class="reply-section">
        <div class="section-title">回复层级</div>
        <el-tree
          class="reply-tree"
          :data="replyTree"
          :props="{ children: 'children' }"
          node-key="id"
          :show-checkbox="false"
          default-expand-all
          :expand-on-click-node="false"
        >
          <template #default="{ data }">
            <div class="reply-node">
              <div class="reply-node__header">
                <span class="reply-author">{{ data.userNickname || '匿名用户' }}（ID {{ data.userId }}）</span>
                <span class="reply-meta">
                  {{ formatCommentStatus(data.status) }} · {{ formatCreatedAt(data.createdAt) }}
                </span>
              </div>
              <p class="reply-content">{{ data.content }}</p>
            </div>
          </template>
        </el-tree>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, type PropType } from 'vue'
import type { CommentVO } from '@/types/api-types'
import {
  formatCommentStatus,
  formatCreatedAt,
  formatTargetType,
} from '@/utils/contentAdmin'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  comment: {
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
  if (!props.comment?.children?.length) {
    return []
  }

  return buildReplyTree(props.comment.children)
})

function handleClose(): void {
  dialogVisible.value = false
}
</script>

<style scoped>
.comment-detail-dialog .detail-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-overview {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.detail-overview__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #f8fafc;
}

.detail-overview__label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.detail-overview__value {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.comment-content {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.7;
}

.image-tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.comment-image {
  width: 96px;
  height: 96px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-title {
  font-weight: 500;
}

.reply-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-weight: 500;
  font-size: 14px;
  color: #2c3e50;
}

.reply-tree {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 12px;
}

.reply-node {
  padding: 12px;
  background: #f9fafc;
  border-radius: 6px;
  border: 1px solid #f0f1f5;
  margin-bottom: 10px;
}

.reply-node__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 6px;
  font-size: 13px;
  color: #546572;
}

.reply-author {
  font-weight: 500;
  color: #2c3e50;
}

.reply-meta {
  font-size: 12px;
}

.reply-content {
  margin: 0;
  font-size: 13px;
  color: #2c3e50;
}

.dialog-empty {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .detail-overview {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
