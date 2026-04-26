/**
 * 文章管理 Store
 * 基于 content-api.md 文档 第2节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ArticleApi } from '@/api/sys/article'
import type {
  ArticleAccessSaveRequest,
  ArticleAdminVO,
  ArticleDetailVO,
  ArticleQueryRequest,
  ArticleSaveRequest,
  StatusUpdateRequest,
} from '@/api/types'

export const useArticleStore = defineStore('article', () => {
  // ==================== 状态 ====================

  /**
   * 文章列表
   */
  const articles = ref<ArticleAdminVO[]>([])

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
  const size = ref(10)

  /**
   * 是否正在加载
   */
  const loading = ref(false)

  /**
   * 当前查看的文章
   */
  const currentArticle = ref<ArticleDetailVO | null>(null)

  // ==================== 操作 ====================

  /**
   * 分页查询文章
   */
  async function fetchArticles(params?: ArticleQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await ArticleApi.getArticles(params)
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
   * 查询文章详情
   */
  async function fetchArticleById(id: number): Promise<ArticleDetailVO | null> {
    try {
      const response = await ArticleApi.getArticleById(id)
      currentArticle.value = response.data.data
      return currentArticle.value
    } catch {
      return null
    }
  }

  /**
   * 新增文章
   */
  async function createArticle(data: ArticleSaveRequest): Promise<boolean> {
    try {
      await ArticleApi.createArticle(data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 修改文章
   */
  async function updateArticle(id: number, data: ArticleSaveRequest): Promise<boolean> {
    try {
      await ArticleApi.updateArticle(id, data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 修改文章状态
   */
  async function updateArticleStatus(id: number, data: StatusUpdateRequest): Promise<boolean> {
    try {
      await ArticleApi.updateArticleStatus(id, data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 修改文章访问权限
   */
  async function updateArticleAccess(id: number, data: ArticleAccessSaveRequest): Promise<boolean> {
    try {
      await ArticleApi.updateArticleAccess(id, data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 删除文章
   */
  async function deleteArticle(id: number): Promise<boolean> {
    try {
      await ArticleApi.deleteArticle(id)
      return true
    } catch {
      return false
    }
  }

  /**
   * 清空列表
   */
  function clearArticles(): void {
    articles.value = []
    total.value = 0
    current.value = 1
    currentArticle.value = null
  }

  return {
    // 状态
    articles,
    total,
    current,
    size,
    loading,
    currentArticle,

    // 操作
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
