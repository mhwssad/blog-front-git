/**
 * 前台内容 Store
 * 提供前台页面所需的公开内容（文章、分类、标签、评论等）
 * 基于 content-api.md 文档
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ContentApi } from '@/api/content'
import type {
  PageResult,
  PublicArticleCardVO,
  PublicArticleDetailVO,
  PublicArticleQueryRequest,
  PublicArticleSeriesDetailVO,
  PublicArticleSeriesVO,
  PublicCategoryTreeVO,
  PublicChannelDetailVO,
  PublicChannelVO,
  PublicCommentQueryRequest,
  PublicCommentVO,
  PublicTagQueryRequest,
  PublicTagVO,
  ChatLobbyMessageVO,
} from '@/types/api-types'

export const useFrontContentStore = defineStore('frontContent', () => {
  // ==================== 状态 ====================

  /**
   * 列表加载状态
   */
  const loading = ref(false)

  /**
   * 文章详情加载状态
   */
  const articleLoading = ref(false)

  /**
   * 评论加载状态
   */
  const commentLoading = ref(false)

  /**
   * 首页初始化加载状态
   */
  const initializing = ref(false)

  /**
   * 文章列表
   */
  const articles = ref<PublicArticleCardVO[]>([])

  /**
   * 置顶文章列表
   */
  const featuredArticles = ref<PublicArticleCardVO[]>([])

  /**
   * 热门文章列表
   */
  const hotArticles = ref<PublicArticleCardVO[]>([])

  /**
   * 分类树
   */
  const categories = ref<PublicCategoryTreeVO[]>([])

  /**
   * 标签列表
   */
  const tags = ref<PublicTagVO[]>([])

  /**
   * 评论列表
   */
  const comments = ref<PublicCommentVO[]>([])

  /**
   * 当前文章详情
   */
  const currentArticle = ref<PublicArticleDetailVO | null>(null)

  /**
   * 当前文章的评论列表
   */
  const articleComments = ref<PublicCommentVO[]>([])

  /**
   * 文章总数
   */
  const total = ref(0)

  /**
   * 当前页
   */
  const current = ref(1)

  /**
   * 每页数量
   */
  const size = ref(9)

  const authorSeries = ref<PublicArticleSeriesVO[]>([])
  const seriesDetail = ref<PublicArticleSeriesDetailVO | null>(null)
  const lobbyMessages = ref<ChatLobbyMessageVO[]>([])
  const lobbyMessageTotal = ref(0)
  const publicChannels = ref<PublicChannelVO[]>([])
  const publicChannelTotal = ref(0)
  const publicChannelDetail = ref<PublicChannelDetailVO | null>(null)
  const seriesLoading = ref(false)
  const lobbyLoading = ref(false)
  const channelLoading = ref(false)

  // ==================== 操作 ====================

  /**
   * 分页查询文章列表
   */
  async function fetchArticles(params?: PublicArticleQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await ContentApi.getArticles(params)
      const data = response.data.data

      articles.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  /**
   * 查询置顶文章
   */
  async function fetchFeaturedArticles(): Promise<void> {
    const response = await ContentApi.getArticles({
      current: 1,
      size: 3,
      sort: 'top',
    })

    featuredArticles.value = response.data.data.records
  }

  /**
   * 查询热门文章
   */
  async function fetchHotArticles(): Promise<void> {
    const response = await ContentApi.getArticles({
      current: 1,
      size: 5,
      sort: 'hot',
    })

    hotArticles.value = response.data.data.records
  }

  /**
   * 查询分类树
   */
  async function fetchCategoryTree(): Promise<void> {
    const response = await ContentApi.getCategoryTree()
    categories.value = response.data.data
  }

  /**
   * 查询标签列表
   */
  async function fetchTags(params?: PublicTagQueryRequest): Promise<void> {
    const response = await ContentApi.getTags(params)
    tags.value = response.data.data
  }

  /**
   * 分页查询评论
   */
  async function fetchComments(params?: PublicCommentQueryRequest): Promise<void> {
    commentLoading.value = true
    try {
      const response = await ContentApi.getComments(params)
      comments.value = response.data.data.records
    } finally {
      commentLoading.value = false
    }
  }

  /**
   * 查询文章详情
   */
  const articleError = ref<number | null>(null)

  async function fetchArticleById(id: number): Promise<PublicArticleDetailVO | null> {
    articleLoading.value = true
    articleError.value = null
    try {
      const response = await ContentApi.getArticleById(id)
      currentArticle.value = response.data.data
      return currentArticle.value
    } catch (e: unknown) {
      currentArticle.value = null
      const err = e as { code?: number; response?: { status?: number } }
      articleError.value = err.response?.status ?? err.code ?? null
      return null
    } finally {
      articleLoading.value = false
    }
  }

  /**
   * 分页查询文章的评论
   */
  async function fetchArticleComments(
    articleId: number,
    params?: Omit<PublicCommentQueryRequest, 'targetType' | 'targetId'>
  ): Promise<void> {
    commentLoading.value = true
    try {
      const response = await ContentApi.getComments({
        ...params,
        targetType: 'article',
        targetId: articleId,
      })
      articleComments.value = response.data.data.records
    } finally {
      commentLoading.value = false
    }
  }

  /**
   * 清空当前文章
   */
  function clearCurrentArticle(): void {
    currentArticle.value = null
    articleComments.value = []
  }

  /**
   * 初始化首页数据（并行请求）
   */
  async function initHome(params?: PublicArticleQueryRequest): Promise<void> {
    initializing.value = true
    try {
      await Promise.all([
        fetchArticles(params),
        fetchFeaturedArticles(),
        fetchHotArticles(),
        fetchCategoryTree(),
        fetchTags(),
        fetchComments({
          current: 1,
          size: 6,
          targetType: 'article',
        }),
      ])
    } finally {
      initializing.value = false
    }
  }

  // ==================== 公开系列 ====================

  async function fetchAuthorSeries(authorId: number): Promise<void> {
    seriesLoading.value = true
    try {
      const response = await ContentApi.getAuthorSeries(authorId)
      authorSeries.value = response.data.data
    } finally {
      seriesLoading.value = false
    }
  }

  async function fetchArticleSeriesDetail(id: number): Promise<PublicArticleSeriesDetailVO | null> {
    seriesLoading.value = true
    try {
      const response = await ContentApi.getArticleSeriesDetail(id)
      seriesDetail.value = response.data.data
      return seriesDetail.value
    } catch {
      return null
    } finally {
      seriesLoading.value = false
    }
  }

  // ==================== 大厅与频道 ====================

  async function fetchLobbyMessages(params?: {
    current?: number
    size?: number
    beforeMessageId?: number
  }): Promise<void> {
    lobbyLoading.value = true
    try {
      const response = await ContentApi.getLobbyMessages(params)
      const data = response.data.data
      lobbyMessages.value = data.records
      lobbyMessageTotal.value = data.total
    } finally {
      lobbyLoading.value = false
    }
  }

  async function fetchPublicChannels(params?: {
    current?: number
    size?: number
    categoryCode?: string
  }): Promise<void> {
    channelLoading.value = true
    try {
      const response = await ContentApi.getPublicChannels(params)
      const data = response.data.data
      publicChannels.value = data.records
      publicChannelTotal.value = data.total
    } finally {
      channelLoading.value = false
    }
  }

  async function fetchPublicChannelDetail(
    conversationId: number,
  ): Promise<PublicChannelDetailVO | null> {
    channelLoading.value = true
    try {
      const response = await ContentApi.getPublicChannelDetail(conversationId)
      publicChannelDetail.value = response.data.data
      return publicChannelDetail.value
    } catch {
      return null
    } finally {
      channelLoading.value = false
    }
  }

  return {
    loading,
    articleLoading,
    commentLoading,
    initializing,
    articles,
    featuredArticles,
    hotArticles,
    categories,
    tags,
    comments,
    currentArticle,
    articleError,
    articleComments,
    total,
    current,
    size,
    authorSeries,
    seriesDetail,
    lobbyMessages,
    lobbyMessageTotal,
    publicChannels,
    publicChannelTotal,
    publicChannelDetail,
    seriesLoading,
    lobbyLoading,
    channelLoading,

    fetchArticles,
    fetchArticleById,
    fetchArticleComments,
    fetchFeaturedArticles,
    fetchHotArticles,
    fetchCategoryTree,
    fetchTags,
    fetchComments,
    clearCurrentArticle,
    initHome,
    fetchAuthorSeries,
    fetchArticleSeriesDetail,
    fetchLobbyMessages,
    fetchPublicChannels,
    fetchPublicChannelDetail,
  }
})
