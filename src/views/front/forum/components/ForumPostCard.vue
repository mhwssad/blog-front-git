<template>
  <div class="forum-post-card">
    <div class="post-content">
      <div class="post-header">
        <el-tag v-if="post.isTop === 1" size="small" type="danger" effect="dark" round>置顶</el-tag>
        <el-tag v-if="post.isEssence === 1" size="small" type="warning" effect="dark" round>精华</el-tag>
        <el-tag v-if="showSection" size="small" effect="plain">{{ post.sectionName }}</el-tag>
        <router-link :to="`/forum/posts/${post.id}`" class="post-title">
          {{ post.title }}
        </router-link>
      </div>

      <div class="post-meta">
        <span class="meta-author">{{ post.authorName }}</span>
        <span class="meta-sep">&middot;</span>
        <time>{{ DateUtils.formatRelativeTime(post.publishedAt ?? post.createdAt) }}</time>
      </div>

      <div class="post-footer">
        <div class="post-stats">
          <span class="stat-item">
            <el-icon aria-hidden="true"><View /></el-icon>{{ formatCount(post.viewCount) }}
          </span>
          <span class="stat-item">
            <el-icon aria-hidden="true"><Star /></el-icon>{{ formatCount(post.likeCount) }}
          </span>
          <span class="stat-item">
            <el-icon aria-hidden="true"><ChatDotRound /></el-icon>{{ formatCount(post.replyCount) }}
          </span>
          <span class="stat-item">
            <el-icon aria-hidden="true"><CollectionTag /></el-icon>{{ formatCount(post.collectCount) }}
          </span>
        </div>

        <div v-if="showStatus" class="post-status">
          <el-tag :type="statusTagType" size="small">{{ statusLabel }}</el-tag>
        </div>

        <div v-if="showActions" class="post-actions">
          <el-button size="small" text @click="$emit('edit', post)">
            <el-icon><Edit /></el-icon>编辑
          </el-button>
          <el-button size="small" text type="danger" @click="$emit('delete', post)">
            <el-icon><Delete /></el-icon>删除
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { View, Star, ChatDotRound, CollectionTag, Edit, Delete } from '@element-plus/icons-vue'
import type { ForumPostVO } from '@/types/api-types'
import { DateUtils } from '@/utils/dateUtils'

const props = withDefaults(
  defineProps<{
    post: ForumPostVO
    showSection?: boolean
    showStatus?: boolean
    showActions?: boolean
  }>(),
  {
    showSection: true,
    showStatus: false,
    showActions: false,
  }
)

defineEmits<{
  edit: [post: ForumPostVO]
  delete: [post: ForumPostVO]
}>()

const statusTagType = computed(() => {
  switch (props.post.status) {
    case 0:
      return 'warning'
    case 1:
      return 'success'
    case 5:
      return 'info'
    default:
      return 'info'
  }
})

const statusLabel = computed(() => {
  switch (props.post.status) {
    case 0:
      return '草稿'
    case 1:
      return '已发布'
    case 5:
      return '隐藏'
    default:
      return '未知'
  }
})

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
</script>

<style scoped>
.forum-post-card {
  display: flex;
  align-items: center;
  background: var(--el-bg-color, #fff);
  border-radius: 8px;
  padding: 16px 20px;
  transition:
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
}

.forum-post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.04);
}

.post-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--el-text-color-primary);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.post-title:hover {
  color: var(--el-color-primary);
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

.meta-author {
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.meta-sep {
  font-size: 10px;
}

.post-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.post-stats {
  display: flex;
  gap: 14px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.post-status {
  margin-left: auto;
}

.post-actions {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

@media (max-width: 640px) {
  .forum-post-card {
    flex-direction: column;
    align-items: stretch;
  }

  .post-title {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .post-footer {
    justify-content: space-between;
  }
}

@media (prefers-reduced-motion: reduce) {
  .forum-post-card {
    transition: none;
  }

  .forum-post-card:hover {
    transform: none;
  }
}
</style>
