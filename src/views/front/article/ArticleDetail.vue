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

    <el-empty v-else :description="articleEmptyText">
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
/**
 * 文章详情页
 * @description 展示文章内容、目录、评论，提供点赞、收藏、评论等交互功能
 * @module front/article
 * @see ../../api/front/article.ts
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore, useFrontContentStore, useUserContentStore } from '@/stores'
import type { TocHeading } from '@/types/ui'
import ArticleHeader from './components/ArticleHeader.vue'
import ArticleContent from './components/ArticleContent.vue'
import ArticleSidebar from './components/ArticleSidebar.vue'
import ActionBar from './components/ActionBar.vue'
import CommentSection from './components/CommentSection.vue'
import CollectionModal from './components/CollectionModal.vue'
import PasswordModal from './components/PasswordModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const frontContentStore = useFrontContentStore()
const userContentStore = useUserContentStore()

const articleId = computed(() => Number(route.params.id))
// 当前文章数据
const article = computed(() => frontContentStore.currentArticle)

// 空状态提示文案（根据错误类型区分）
const articleEmptyText = computed(() => {
  const error = frontContentStore.articleError
  if (error === 403) return '无权访问此文章（仅指定用户可见）'
  if (error === 401) return '请先登录后再查看此文章'
  return '文章不存在或已被删除'
})

// 密码验证相关状态
const needPassword = ref(false) // 是否需要密码
const showPasswordModal = ref(true) // 密码弹窗是否显示

// 收藏弹窗可见性
const collectModalVisible = ref(false)

// 文章目录（从正文提取的Heading）
const tocHeadings = ref<TocHeading[]>([])

/**
 * 加载文章详情
 * 若文章设置了访问级别（accessLevel=2），则先显示密码验证弹窗
 */
async function loadArticle(): Promise<void> {
  needPassword.value = false
  const result = await frontContentStore.fetchArticleById(articleId.value)
  if (result?.accessLevel === 2) {
    needPassword.value = true
    showPasswordModal.value = true
  }
  if (result) {
    // 加载文章评论列表
    void frontContentStore.fetchArticleComments(articleId.value, { current: 1, size: 50 })
    // 已登录用户加载收藏夹列表（用于收藏弹窗）
    if (authStore.isLoggedIn) {
      await userContentStore.fetchCollectionFolders()
    }
  }
}

/**
 * 密码验证成功后关闭弹窗并显示文章内容
 */
function handlePasswordVerify(): void {
  needPassword.value = false
  showPasswordModal.value = false
}

/**
 * 提取文章正文中的目录结构
 * @param headings - 从 ArticleContent 组件提取的 Heading 列表
 */
function handleHeadings(headings: TocHeading[]): void {
  tocHeadings.value = headings
}

/**
 * 处理点赞/取消点赞
 */
async function handleLike(): Promise<void> {
  if (!article.value || !authStore.isLoggedIn) return
  // 根据当前点赞状态选择点赞或取消点赞
  const fn = article.value.liked ? userContentStore.unlikeArticle : userContentStore.likeArticle
  const success = await fn(article.value.id)
  if (success && article.value) {
    article.value.liked = !article.value.liked
    article.value.likeCount += article.value.liked ? 1 : -1
  }
}

/**
 * 取消收藏文章
 */
async function handleUncollect(): Promise<void> {
  if (!article.value) return
  const col = userContentStore.collections.find(
    c => c.targetType === 'article' && c.targetId === article.value!.id
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

/**
 * 收藏文章到指定文件夹
 * @param folderId - 目标收藏夹ID
 */
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

/**
 * 提交评论
 * @param data - 评论内容及回复相关参数
 */
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
  const comment = frontContentStore.articleComments.find(c => c.id === id)
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
