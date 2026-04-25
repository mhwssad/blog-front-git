import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ContentApi } from '@/api/content'
import type {
  PageResult,
  PublicArticleCardVO,
  PublicArticleDetailVO,
  PublicArticleQueryRequest,
  PublicCategoryTreeVO,
  PublicCommentQueryRequest,
  PublicCommentVO,
  PublicTagQueryRequest,
  PublicTagVO,
} from '@/api/types'

export const useFrontContentStore = defineStore('frontContent', () => {
  const loading = ref(false)
  const articleLoading = ref(false)
  const commentLoading = ref(false)
  const initializing = ref(false)
  const articles = ref<PublicArticleCardVO[]>([])
  const featuredArticles = ref<PublicArticleCardVO[]>([])
  const hotArticles = ref<PublicArticleCardVO[]>([])
  const categories = ref<PublicCategoryTreeVO[]>([])
  const tags = ref<PublicTagVO[]>([])
  const comments = ref<PublicCommentVO[]>([])
  const currentArticle = ref<PublicArticleDetailVO | null>(null)
  const articleComments = ref<PublicCommentVO[]>([])
  const total = ref(0)
  const current = ref(1)
  const size = ref(9)

  async function fetchArticles(params?: PublicArticleQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await ContentApi.getArticles(params)
      const data = response.data.data as PageResult<PublicArticleCardVO>

      articles.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  async function fetchFeaturedArticles(): Promise<void> {
    const response = await ContentApi.getArticles({
      current: 1,
      size: 3,
      sort: 'top',
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
    try {
      const response = await ContentApi.getArticleById(id)
      currentArticle.value = response.data.data
      return currentArticle.value
    } catch {
      currentArticle.value = null
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
    articleComments,
    total,
    current,
    size,
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
  }
})
