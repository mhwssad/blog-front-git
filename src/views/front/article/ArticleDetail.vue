<template>
  <div class="article-detail-page">
    <div v-if="frontContentStore.articleLoading" class="loading-state">
      <el-skeleton :rows="12" animated />
    </div>

    <template v-else-if="article">
      <PasswordModal
        v-if="article.accessLevel === 2"
        :visible="showPasswordModal"
        @verify="handlePasswordVerify"
      />

      <template v-if="!needPassword">
        <ArticleHeader :article="article" />

        <el-row :gutter="24" class="content-row">
          <el-col :xs="24" :lg="18">
            <ArticleContent :content="article.content" @headings-extracted="handleHeadings" />
            <ActionBar
              :article="article"
              :action-loading="userContentStore.actionLoading"
              :logged-in="authStore.isLoggedIn"
              @like="handleLike"
              @collect="collectModalVisible = true"
              @uncollect="handleUncollect"
            />
            <CommentSection
              :comments="frontContentStore.articleComments"
              :loading="frontContentStore.commentLoading"
              :current-user-id="authStore.currentUser?.id"
              :can-comment="article.canComment !== false"
              :logged-in="authStore.isLoggedIn"
              @submit="handleCommentSubmit"
              @like="handleCommentLike"
              @delete="handleCommentDelete"
            />
          </el-col>
          <el-col :xs="24" :lg="6" class="sidebar-col">
            <ArticleSidebar :headings="tocHeadings" />
          </el-col>
        </el-row>
      </template>
    </template>

    <el-empty v-else description="文章不存在或已被删除">
      <el-button type="primary" @click="router.push('/')">返回首页</el-button>
    </el-empty>

    <CollectionModal
      v-model:visible="collectModalVisible"
      :folders="userContentStore.collectionFolders"
      :target-id="articleId"
      target-type="article"
      :loading="userContentStore.actionLoading"
      @collect="handleCollect"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore, useFrontContentStore, useUserContentStore } from '@/stores'
import ArticleHeader from './components/ArticleHeader.vue'
import ArticleContent from './components/ArticleContent.vue'
import ArticleSidebar from './components/ArticleSidebar.vue'
import ActionBar from './components/ActionBar.vue'
import CommentSection from './components/CommentSection.vue'
import CollectionModal from './components/CollectionModal.vue'
import PasswordModal from './components/PasswordModal.vue'

interface TocHeading {
  id: string
  text: string
  level: number
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const frontContentStore = useFrontContentStore()
const userContentStore = useUserContentStore()

const articleId = computed(() => Number(route.params.id))
const article = computed(() => frontContentStore.currentArticle)
const needPassword = ref(false)
const showPasswordModal = ref(true)
const collectModalVisible = ref(false)
const tocHeadings = ref<TocHeading[]>([])

async function loadArticle(): Promise<void> {
  needPassword.value = false
  const result = await frontContentStore.fetchArticleById(articleId.value)
  if (result?.accessLevel === 2) {
    needPassword.value = true
    showPasswordModal.value = true
  }
  if (result) {
    void frontContentStore.fetchArticleComments(articleId.value, { current: 1, size: 50 })
    if (authStore.isLoggedIn) {
      await userContentStore.fetchCollectionFolders()
    }
  }
}

function handlePasswordVerify(): void {
  needPassword.value = false
  showPasswordModal.value = false
}

function handleHeadings(headings: TocHeading[]): void {
  tocHeadings.value = headings
}

async function handleLike(): Promise<void> {
  if (!article.value || !authStore.isLoggedIn) return
  const fn = article.value.liked ? userContentStore.unlikeArticle : userContentStore.likeArticle
  const success = await fn(article.value.id)
  if (success && article.value) {
    article.value.liked = !article.value.liked
    article.value.likeCount += article.value.liked ? 1 : -1
  }
}

async function handleUncollect(): Promise<void> {
  if (!article.value) return
  const col = userContentStore.collections.find(
    (c) => c.targetType === 'article' && c.targetId === article.value!.id,
  )
  if (col) {
    const success = await userContentStore.deleteCollection(col.id)
    if (success && article.value) {
      article.value.collected = false
      article.value.collectCount -= 1
      ElMessage.success('已取消收藏')
    }
  }
}

async function handleCollect(folderId: number): Promise<void> {
  if (!article.value) return
  const success = await userContentStore.createCollection({
    folderId,
    targetId: article.value.id,
    targetType: 'article',
  })
  if (success && article.value) {
    article.value.collected = true
    article.value.collectCount += 1
    collectModalVisible.value = false
    ElMessage.success('收藏成功')
  }
}

async function handleCommentSubmit(data: {
  content: string
  rootId?: number
  parentId?: number
}): Promise<void> {
  const result = await userContentStore.createComment({
    targetType: 'article',
    targetId: articleId.value,
    content: data.content,
    rootId: data.rootId ?? 0,
    parentId: data.parentId ?? 0,
  })
  if (result) {
    ElMessage.success('评论成功')
    void frontContentStore.fetchArticleComments(articleId.value, { current: 1, size: 50 })
  }
}

async function handleCommentLike(id: number): Promise<void> {
  const comment = frontContentStore.articleComments.find((c) => c.id === id)
  if (!comment) return
  const fn = comment.liked ? userContentStore.unlikeComment : userContentStore.likeComment
  const success = await fn(id)
  if (success) {
    comment.liked = !comment.liked
    comment.likeCount += comment.liked ? 1 : -1
  }
}

async function handleCommentDelete(id: number): Promise<void> {
  const success = await userContentStore.deleteComment(id)
  if (success) {
    ElMessage.success('删除成功')
    void frontContentStore.fetchArticleComments(articleId.value, { current: 1, size: 50 })
  }
}

onMounted(() => {
  void loadArticle()
})

onBeforeUnmount(() => {
  frontContentStore.clearCurrentArticle()
})
</script>

<style scoped>
.article-detail-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px;
}

.loading-state {
  padding: 40px 0;
}

.content-row {
  margin-top: 24px;
}

.sidebar-col {
  position: relative;
}

@media (max-width: 992px) {
  .sidebar-col {
    display: none;
  }
}
</style>
