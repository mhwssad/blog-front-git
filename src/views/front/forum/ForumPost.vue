<template>
  <div class="forum-post-page">
    <el-skeleton v-if="forumStore.loading && !forumStore.currentPost" :rows="12" animated />

    <el-empty
      v-else-if="!forumStore.currentPost && !forumStore.loading"
      description="帖子不存在或已被删除"
    />

    <template v-else-if="forumStore.currentPost">
      <div class="post-container">
        <el-breadcrumb separator="/" class="post-breadcrumb">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/forum' }">论坛</el-breadcrumb-item>
          <el-breadcrumb-item>帖子详情</el-breadcrumb-item>
        </el-breadcrumb>

        <article class="post-article">
          <header class="post-header">
            <h1 class="post-title">{{ post.title }}</h1>
            <div class="post-meta">
              <span class="meta-author">{{ post.authorName }}</span>
              <span class="meta-sep">&middot;</span>
              <router-link :to="`/forum/sections/${post.sectionId}`" class="meta-section">
                {{ post.sectionName }}
              </router-link>
              <template v-if="post.publishedAt">
                <span class="meta-sep">&middot;</span>
                <time>{{ DateUtils.formatRelativeTime(post.publishedAt) }}</time>
              </template>
            </div>
          </header>

          <div class="post-body" v-html="post.content"></div>

          <div class="action-bar">
            <div class="action-stats">
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
            <div class="action-buttons">
              <el-button
                :type="post.liked ? 'primary' : 'default'"
                :plain="!post.liked"
                @click="toggleLike"
              >
                <el-icon><Star /></el-icon>
                {{ post.liked ? '已点赞' : '点赞' }}
              </el-button>
              <el-button
                :type="post.collected ? 'warning' : 'default'"
                :plain="!post.collected"
                @click="toggleCollect"
              >
                <el-icon><CollectionTag /></el-icon>
                {{ post.collected ? '已收藏' : '收藏' }}
              </el-button>
            </div>
          </div>
        </article>

        <section class="reply-section">
          <h2 class="reply-section-title">回复 ({{ forumStore.replyTotal }})</h2>

          <div v-if="forumStore.replies.length" class="reply-list">
            <ForumReplyItem
              v-for="reply in forumStore.replies"
              :key="reply.id"
              :reply="reply"
              :post-id="postId"
              :depth="0"
              @reply="handleReplyTo"
            />
          </div>
          <el-empty v-else description="暂无回复，来说两句吧" :image-size="80" />

          <el-pagination
            v-if="forumStore.replyTotal > 10"
            :current-page="replyPage"
            :page-size="10"
            :total="forumStore.replyTotal"
            layout="prev, pager, next"
            class="reply-pagination"
            @current-change="handlePageChange"
          />

          <div v-if="post.canReply && authStore.isLoggedIn" class="reply-editor">
            <div v-if="replyingTo" class="reply-indicator">
              <span>回复 @{{ replyingTo.userName }}</span>
              <el-button size="small" text @click="cancelReply">取消</el-button>
            </div>
            <el-input
              v-model="replyContent"
              type="textarea"
              :rows="3"
              placeholder="写下你的回复..."
              maxlength="2000"
              show-word-limit
            />
            <div class="reply-editor-actions">
              <el-button v-if="replyingTo" @click="cancelReply">取消</el-button>
              <el-button
                type="primary"
                :loading="submitting"
                :disabled="!replyContent.trim()"
                @click="submitReply"
              >
                发表回复
              </el-button>
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { View, Star, ChatDotRound, CollectionTag } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserForumStore } from '@/stores'
import { useAuthStore } from '@/stores'
import { DateUtils } from '@/utils/dateUtils'
import type { ForumReplyVO } from '@/types/api-types'
import ForumReplyItem from './components/ForumReplyItem.vue'

const route = useRoute()
const forumStore = useUserForumStore()
const authStore = useAuthStore()

const postId = computed(() => Number(route.params.postId))
const post = computed(() => forumStore.currentPost!)

const replyPage = ref(1)
const replyContent = ref('')
const replyingTo = ref<ForumReplyVO | null>(null)
const submitting = ref(false)

onMounted(async () => {
  await forumStore.fetchPostById(postId.value)
  await forumStore.fetchReplies(postId.value, { current: 1, size: 10 })
})

async function toggleLike() {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  const ok = post.value.liked
    ? await forumStore.unlikePost(postId.value)
    : await forumStore.likePost(postId.value)
  if (ok) {
    await forumStore.fetchPostById(postId.value)
  }
}

async function toggleCollect() {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  const ok = post.value.collected
    ? await forumStore.uncollectPost(postId.value)
    : await forumStore.collectPost(postId.value)
  if (ok) {
    await forumStore.fetchPostById(postId.value)
  }
}

function handleReplyTo(reply: ForumReplyVO) {
  replyingTo.value = reply
  replyContent.value = ''
}

function cancelReply() {
  replyingTo.value = null
  replyContent.value = ''
}

async function submitReply() {
  if (!replyContent.value.trim()) return
  submitting.value = true
  try {
    const ok = await forumStore.createReply(postId.value, {
      parentId: replyingTo.value?.id,
      content: replyContent.value.trim(),
    })
    if (ok) {
      ElMessage.success('回复成功')
      replyContent.value = ''
      replyingTo.value = null
      await forumStore.fetchReplies(postId.value, { current: replyPage.value, size: 10 })
    }
  } finally {
    submitting.value = false
  }
}

async function handlePageChange(page: number) {
  replyPage.value = page
  await forumStore.fetchReplies(postId.value, { current: page, size: 10 })
}

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
</script>

<style scoped>
.forum-post-page {
  min-height: 60vh;
}

.post-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 16px;
}

.post-breadcrumb {
  margin-bottom: 20px;
}

.post-article {
  background: var(--el-bg-color, #fff);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.post-header {
  margin-bottom: 20px;
}

.post-title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--el-text-color-primary);
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--el-text-color-placeholder);
  flex-wrap: wrap;
}

.meta-author {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.meta-section {
  color: var(--el-color-primary);
  text-decoration: none;
}

.meta-section:hover {
  text-decoration: underline;
}

.meta-sep {
  font-size: 10px;
}

.post-body {
  font-size: 15px;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  word-break: break-word;
}

.post-body :deep(h1),
.post-body :deep(h2),
.post-body :deep(h3) {
  margin-top: 1.2em;
  margin-bottom: 0.6em;
  color: var(--el-text-color-primary);
}

.post-body :deep(p) {
  margin: 0.6em 0;
}

.post-body :deep(img) {
  max-width: 100%;
  border-radius: 4px;
}

.post-body :deep(pre) {
  padding: 12px;
  border-radius: 6px;
  background: var(--el-fill-color-light, #f5f7fa);
  overflow-x: auto;
}

.post-body :deep(blockquote) {
  margin: 0.8em 0;
  padding: 8px 16px;
  border-left: 4px solid var(--el-color-primary-light-5);
  background: var(--el-fill-color-lighter, #fafafa);
  color: var(--el-text-color-secondary);
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
  flex-wrap: wrap;
  gap: 12px;
}

.action-stats {
  display: flex;
  gap: 16px;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.reply-section {
  margin-top: 32px;
  background: var(--el-bg-color, #fff);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.reply-section-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.reply-list {
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.reply-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.reply-editor {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.reply-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 6px 12px;
  background: var(--el-color-primary-light-9);
  border-radius: 4px;
  font-size: 13px;
  color: var(--el-color-primary);
}

.reply-editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

@media (max-width: 640px) {
  .post-container {
    padding: 16px 8px;
  }

  .post-article {
    padding: 16px;
  }

  .post-title {
    font-size: 20px;
  }

  .action-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .reply-section {
    padding: 16px;
  }
}
</style>
