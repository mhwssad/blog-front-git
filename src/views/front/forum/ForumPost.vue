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
            <div class="post-badges">
              <el-tag v-if="post.isTop === 1" size="small" type="danger" effect="dark" round>
                置顶
              </el-tag>
              <el-tag v-if="post.isEssence === 1" size="small" type="warning" effect="dark" round>
                精华
              </el-tag>
            </div>

            <h1 class="post-title">{{ post.title }}</h1>

            <div class="post-author-card">
              <el-avatar :size="40" class="post-author-avatar">
                {{ post.authorName?.charAt(0) }}
              </el-avatar>
              <div class="post-author-info">
                <span class="post-author-name">{{ post.authorName }}</span>
                <div class="post-author-meta">
                  <router-link
                    :to="`/forum/sections/${post.sectionId}`"
                    class="post-section-link"
                  >
                    {{ post.sectionName }}
                  </router-link>
                  <template v-if="post.publishedAt">
                    <span class="meta-sep">&middot;</span>
                    <time>{{ DateUtils.formatRelativeTime(post.publishedAt) }}</time>
                  </template>
                </div>
              </div>
            </div>
          </header>

          <div class="post-body" v-html="post.content"></div>

          <div class="action-bar">
            <div class="action-btn-group">
              <button
                type="button"
                class="action-btn"
                :class="{ 'action-btn--active': post.liked }"
                @click="toggleLike"
              >
                <el-icon :size="20"><Star /></el-icon>
                <span class="action-btn__label">{{ post.liked ? '已点赞' : '点赞' }}</span>
                <span class="action-btn__count">{{ formatCount(post.likeCount) }}</span>
              </button>
              <button
                type="button"
                class="action-btn"
                :class="{ 'action-btn--active action-btn--collect': post.collected }"
                @click="toggleCollect"
              >
                <el-icon :size="20"><CollectionTag /></el-icon>
                <span class="action-btn__label">{{ post.collected ? '已收藏' : '收藏' }}</span>
                <span class="action-btn__count">{{ formatCount(post.collectCount) }}</span>
              </button>
              <button type="button" class="action-btn" @click="handleShare">
                <el-icon :size="20"><Share /></el-icon>
                <span class="action-btn__label">分享</span>
              </button>
            </div>
            <div class="action-stats">
              <span class="stat-item">
                <el-icon aria-hidden="true"><View /></el-icon>{{ formatCount(post.viewCount) }}
                浏览
              </span>
              <span class="stat-item">
                <el-icon aria-hidden="true"><ChatDotRound /></el-icon
                >{{ formatCount(post.replyCount) }} 回复
              </span>
            </div>
          </div>
        </article>

        <section class="reply-section">
          <div class="reply-section-header">
            <h2 class="reply-section-title">回复 ({{ forumStore.replyTotal }})</h2>
            <div class="reply-sort-tabs">
              <button
                v-for="opt in sortOptions"
                :key="opt.value"
                type="button"
                class="reply-sort-tab"
                :class="{ 'reply-sort-tab--active': replySort === opt.value }"
                @click="replySort = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div v-if="sortedReplies.length" class="reply-list">
            <ForumReplyItem
              v-for="reply in sortedReplies"
              :key="reply.id"
              :reply="reply"
              :post-id="postId"
              :depth="0"
              @reply="handleReplyTo"
              @like="handleLikeReply"
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
              <el-tag size="small" closable @close="cancelReply">
                回复 @{{ replyingTo.userName }}
              </el-tag>
            </div>
            <el-input
              v-model="replyContent"
              type="textarea"
              :rows="4"
              placeholder="写下你的回复..."
              maxlength="2000"
              show-word-limit
              resize="vertical"
            />
            <div class="reply-editor-actions">
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
import { View, Star, ChatDotRound, CollectionTag, Share } from '@element-plus/icons-vue'
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
const replySort = ref<'latest' | 'earliest' | 'hot'>('latest')

const sortOptions = [
  { label: '最新', value: 'latest' as const },
  { label: '最早', value: 'earliest' as const },
  { label: '热门', value: 'hot' as const },
]

const sortedReplies = computed(() => {
  const list = [...forumStore.replies]
  switch (replySort.value) {
    case 'earliest':
      return list.sort((a, b) => a.floorNo - b.floorNo)
    case 'hot':
      return list.sort((a, b) => b.likeCount - a.likeCount)
    default:
      return list.sort((a, b) => b.floorNo - a.floorNo)
  }
})

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

function handleShare() {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  }).catch(() => {
    ElMessage.info('请手动复制链接')
  })
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

function handleLikeReply(_replyId: number) {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
  }
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
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.post-header {
  margin-bottom: 24px;
}

.post-badges {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.post-title {
  margin: 0 0 16px;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--el-text-color-primary);
}

.post-author-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 10px;
}

.post-author-avatar {
  font-size: 16px;
  background: var(--el-color-primary-light-5);
  color: var(--el-color-primary-dark-2);
  flex-shrink: 0;
}

.post-author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.post-author-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.post-author-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

.post-section-link {
  color: var(--el-color-primary);
  text-decoration: none;
}

.post-section-link:hover {
  text-decoration: underline;
}

.meta-sep {
  font-size: 10px;
}

.post-body {
  font-size: 15px;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  word-break: break-word;
}

.post-body :deep(h1),
.post-body :deep(h2),
.post-body :deep(h3) {
  margin-top: 1.4em;
  margin-bottom: 0.6em;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.post-body :deep(h1) {
  font-size: 1.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.post-body :deep(h2) {
  font-size: 1.3em;
  padding-bottom: 0.2em;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.post-body :deep(h3) {
  font-size: 1.15em;
}

.post-body :deep(p) {
  margin: 0.6em 0;
}

.post-body :deep(ul),
.post-body :deep(ol) {
  padding-left: 1.5em;
  margin: 0.6em 0;
}

.post-body :deep(li) {
  margin: 0.2em 0;
}

.post-body :deep(img) {
  max-width: 100%;
  border-radius: 6px;
  margin: 0.8em 0;
}

.post-body :deep(pre) {
  padding: 14px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  overflow-x: auto;
  margin: 0.8em 0;
  font-size: 13px;
  line-height: 1.6;
}

.post-body :deep(code) {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  font-size: 0.9em;
}

.post-body :deep(pre code) {
  padding: 0;
  background: none;
}

.post-body :deep(blockquote) {
  margin: 0.8em 0;
  padding: 10px 16px;
  border-left: 4px solid var(--el-color-primary-light-5);
  background: var(--el-fill-color-lighter);
  color: var(--el-text-color-secondary);
  border-radius: 0 6px 6px 0;
}

.post-body :deep(a) {
  color: var(--el-color-primary);
  text-decoration: none;
}

.post-body :deep(a:hover) {
  text-decoration: underline;
}

.post-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.8em 0;
}

.post-body :deep(th),
.post-body :deep(td) {
  border: 1px solid var(--el-border-color-lighter);
  padding: 8px 12px;
  text-align: left;
}

.post-body :deep(th) {
  background: var(--el-fill-color-lighter);
  font-weight: 600;
}

.post-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--el-border-color-lighter);
  margin: 1.2em 0;
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 28px;
  padding: 20px 0 0;
  border-top: 1px solid var(--el-border-color-lighter);
  flex-wrap: wrap;
  gap: 16px;
}

.action-btn-group {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s,
    background 0.2s,
    transform 0.15s;
  font-size: 12px;
  min-width: 64px;
}

.action-btn:hover {
  border-color: var(--el-color-primary-light-5);
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.action-btn--active {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.action-btn--collect.action-btn--active {
  border-color: var(--el-color-warning);
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}

.action-btn__label {
  font-size: 12px;
}

.action-btn__count {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.action-btn--active .action-btn__count {
  color: inherit;
}

.action-stats {
  display: flex;
  gap: 16px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.reply-section {
  margin-top: 24px;
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.reply-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.reply-section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.reply-sort-tabs {
  display: flex;
  gap: 4px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  padding: 2px;
}

.reply-sort-tab {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}

.reply-sort-tab:hover {
  color: var(--el-color-primary);
}

.reply-sort-tab--active {
  background: var(--el-bg-color);
  color: var(--el-color-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.reply-list {
  border-top: 1px solid var(--el-border-color-lighter);
}

.reply-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.reply-editor {
  margin-top: 24px;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
}

.reply-indicator {
  margin-bottom: 8px;
}

.reply-editor-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

@media (max-width: 640px) {
  .post-container {
    padding: 16px 8px;
  }

  .post-article {
    padding: 20px 16px;
  }

  .post-title {
    font-size: 20px;
  }

  .action-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-btn-group {
    width: 100%;
    justify-content: space-around;
  }

  .reply-section {
    padding: 16px;
  }

  .reply-section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
