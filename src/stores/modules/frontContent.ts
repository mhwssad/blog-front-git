/**
 * 前台内容 Store
 * 提供前台页面所需的公开内容（文章、分类、标签、评论等）
 * 基于 content-api.md 文档
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { usePaginatedState } from '@/stores/composables'
import { ContentApi } from '@/api/content'
import type {
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
  FriendLinkVO,
} from '@/types/api-types'

export const useFrontContentStore = defineStore('frontContent', () => {
  const {
    items: articles, total, current, size, loading,
    fetch: fetchArticles, clear: clearArticlesRaw,
  } = usePaginatedState<PublicArticleCardVO>({
    fetchFn: (params) => ContentApi.getArticles(params),
    defaultSize: 9,
  })

  const articleLoading = ref(false)
  const commentLoading = ref(false)
  const initializing = ref(false)
  const featuredArticles = ref<PublicArticleCardVO[]>([])
  const hotArticles = ref<PublicArticleCardVO[]>([])
  const categories = ref<PublicCategoryTreeVO[]>([])
  const tags = ref<PublicTagVO[]>([])
  const comments = ref<PublicCommentVO[]>([])
  const currentArticle = ref<PublicArticleDetailVO | null>(null)
  const articleComments = ref<PublicCommentVO[]>([])
  const articleError = ref<number | null>(null)

  const authorSeries = ref<PublicArticleSeriesVO[]>([])
  const seriesDetail = ref<PublicArticleSeriesDetailVO | null>(null)
  const seriesLoading = ref(false)

  const {
    items: lobbyMessages, total: lobbyMessageTotal, loading: lobbyLoading,
    fetch: fetchLobbyMessages, clear: clearLobbyRaw,
  } = usePaginatedState<ChatLobbyMessageVO>({
    fetchFn: (params) => ContentApi.getLobbyMessages(params),
  })

  const {
    items: publicChannels, total: publicChannelTotal, loading: channelLoading,
    fetch: fetchPublicChannels, clear: clearChannelsRaw,
  } = usePaginatedState<PublicChannelVO>({
    fetchFn: (params) => ContentApi.getPublicChannels(params),
  })

  const publicChannelDetail = ref<PublicChannelDetailVO | null>(null)
  const friendLinks = ref<FriendLinkVO[]>([])

  // ==================== 操作 ====================

  async function fetchFeaturedArticles(): Promise<void> {
    const response = await ContentApi.getArticles({
      current: 1,
      size: 3,
      sort: 'popular',
    })

    featuredArticles.value = response.data.data.records
  }

  async function fetchHotArticles(): Promise<void> {
    const response = await ContentApi.getArticles({
      current: 1,
      size: 5,
      sort: 'hot',
    })

    hotArticles.value = response.data.data.records
  }

  async function fetchCategoryTree(): Promise<void> {
    const response = await ContentApi.getCategoryTree()
    categories.value = response.data.data
  }

  async function fetchTags(params?: PublicTagQueryRequest): Promise<void> {
    const response = await ContentApi.getTags(params)
    tags.value = response.data.data
  }

  async function fetchComments(params?: PublicCommentQueryRequest): Promise<void> {
    commentLoading.value = true
    try {
      const response = await ContentApi.getComments(params)
      comments.value = response.data.data.records
    } finally {
      commentLoading.value = false
    }
  }

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

  function clearCurrentArticle(): void {
    currentArticle.value = null
    articleComments.value = []
  }

  async function initHome(params?: PublicArticleQueryRequest): Promise<void> {
    initializing.value = true
    try {
      await Promise.all([
        fetchArticles(params),
        fetchFeaturedArticles(),
        fetchHotArticles(),
        fetchCategoryTree(),
        fetchTags(),
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

  // ==================== 频道详情 ====================

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

  async function fetchFriendLinks(): Promise<void> {
    const response = await ContentApi.getFriendLinks()
    friendLinks.value = response.data.data ?? []
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
    friendLinks,

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
    fetchFriendLinks,
  }
})
