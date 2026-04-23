import { ref } from 'vue'
import { defineStore } from 'pinia'
import { articleApi } from '@/api/sys/article'
import type {
  ArticleAccessSaveRequest,
  ArticleAdminVO,
  ArticleDetailVO,
  ArticleQueryRequest,
  ArticleSaveRequest,
  PageResult,
  StatusUpdateRequest,
} from '@/api/types'

export const useArticleStore = defineStore('article', () => {
  const articles = ref<ArticleAdminVO[]>([])
  const total = ref(0)
  const current = ref(1)
  const size = ref(10)
  const loading = ref(false)
  const currentArticle = ref<ArticleDetailVO | null>(null)

  async function fetchArticles(params?: ArticleQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await articleApi.getArticles(params)
      const data = response.data.data as PageResult<ArticleAdminVO>

      articles.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  async function fetchArticleById(id: number): Promise<ArticleDetailVO | null> {
    try {
      const response = await articleApi.getArticleById(id)
      currentArticle.value = response.data.data
      return currentArticle.value
    } catch {
      return null
    }
  }

  async function createArticle(data: ArticleSaveRequest): Promise<boolean> {
    try {
      await articleApi.createArticle(data)
      return true
    } catch {
      return false
    }
  }

  async function updateArticle(id: number, data: ArticleSaveRequest): Promise<boolean> {
    try {
      await articleApi.updateArticle(id, data)
      return true
    } catch {
      return false
    }
  }

  async function updateArticleStatus(id: number, data: StatusUpdateRequest): Promise<boolean> {
    try {
      await articleApi.updateArticleStatus(id, data)
      return true
    } catch {
      return false
    }
  }

  async function updateArticleAccess(id: number, data: ArticleAccessSaveRequest): Promise<boolean> {
    try {
      await articleApi.updateArticleAccess(id, data)
      return true
    } catch {
      return false
    }
  }

  async function deleteArticle(id: number): Promise<boolean> {
    try {
      await articleApi.deleteArticle(id)
      return true
    } catch {
      return false
    }
  }

  function clearArticles(): void {
    articles.value = []
    total.value = 0
    current.value = 1
    currentArticle.value = null
  }

  return {
    articles,
    total,
    current,
    size,
    loading,
    currentArticle,
    fetchArticles,
    fetchArticleById,
    createArticle,
    updateArticle,
    updateArticleStatus,
    updateArticleAccess,
    deleteArticle,
    clearArticles,
  }
})
