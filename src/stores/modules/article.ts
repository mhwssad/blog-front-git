/**
 * 文章管理 Store
 * 基于 content-api.md 文档 第2节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { usePaginatedState } from '@/stores/composables'
import { ArticleApi } from '@/api/sys/article'
import type {
  ArticleAccessSaveRequest,
  ArticleAdminVO,
  ArticleDetailVO,
  ArticleReviewAdminDetailVO,
  ArticleReviewDecisionRequest,
  ArticleReviewRepairRequest,
  ArticleSaveRequest,
  StatusUpdateRequest,
} from '@/types/api-types'

export const useArticleStore = defineStore('article', () => {
  const {
    items: articles, total, current, size, loading,
    fetch: fetchArticles, clear: clearArticlesRaw,
  } = usePaginatedState<ArticleAdminVO>({
    fetchFn: (params) => ArticleApi.getArticles(params),
  })

  const currentArticle = ref<ArticleDetailVO | null>(null)

  const {
    items: reviewArticles, total: reviewTotal, loading: reviewLoading,
    fetch: fetchArticleReviews, clear: clearReviewsRaw,
  } = usePaginatedState<ArticleAdminVO>({
    fetchFn: (params) => ArticleApi.getArticleReviews(params),
  })

  // ==================== 操作 ====================

  async function fetchArticleById(id: number): Promise<ArticleDetailVO | null> {
    try {
      const response = await ArticleApi.getArticleById(id)
      currentArticle.value = response.data.data
      return currentArticle.value
    } catch {
      return null
    }
  }

  async function createArticle(data: ArticleSaveRequest): Promise<boolean> {
    try {
      await ArticleApi.createArticle(data)
      return true
    } catch {
      return false
    }
  }

  async function updateArticle(id: number, data: ArticleSaveRequest): Promise<boolean> {
    try {
      await ArticleApi.updateArticle(id, data)
      return true
    } catch {
      return false
    }
  }

  async function updateArticleStatus(id: number, data: StatusUpdateRequest): Promise<boolean> {
    try {
      await ArticleApi.updateArticleStatus(id, data)
      return true
    } catch {
      return false
    }
  }

  async function updateArticleAccess(id: number, data: ArticleAccessSaveRequest): Promise<boolean> {
    try {
      await ArticleApi.updateArticleAccess(id, data)
      return true
    } catch {
      return false
    }
  }

  async function deleteArticle(id: number): Promise<boolean> {
    try {
      await ArticleApi.deleteArticle(id)
      return true
    } catch {
      return false
    }
  }

  async function toggleArticleTop(id: number, enabled: boolean): Promise<boolean> {
    try {
      await ArticleApi.toggleArticleTop(id, enabled)
      return true
    } catch {
      return false
    }
  }

  async function toggleArticleRecommend(id: number, enabled: boolean): Promise<boolean> {
    try {
      await ArticleApi.toggleArticleRecommend(id, enabled)
      return true
    } catch {
      return false
    }
  }

  async function fetchArticleReviewDetail(
    id: number,
  ): Promise<ArticleReviewAdminDetailVO | null> {
    try {
      const response = await ArticleApi.getArticleReviewDetail(id)
      return response.data.data
    } catch {
      return null
    }
  }

  async function approveArticleReview(
    id: number,
    data?: ArticleReviewDecisionRequest,
  ): Promise<boolean> {
    try {
      await ArticleApi.approveArticleReview(id, data)
      return true
    } catch {
      return false
    }
  }

  async function rejectArticleReview(
    id: number,
    data: ArticleReviewDecisionRequest,
  ): Promise<boolean> {
    try {
      await ArticleApi.rejectArticleReview(id, data)
      return true
    } catch {
      return false
    }
  }

  async function repairArticleReviewStatus(
    id: number,
    data: ArticleReviewRepairRequest,
  ): Promise<boolean> {
    try {
      await ArticleApi.repairArticleReviewStatus(id, data)
      return true
    } catch {
      return false
    }
  }

  function clearArticles(): void {
    clearArticlesRaw()
    clearReviewsRaw()
    currentArticle.value = null
  }

  const clearState = clearArticles

  return {
    articles,
    total,
    current,
    size,
    loading,
    currentArticle,
    reviewArticles,
    reviewTotal,
    reviewLoading,

    fetchArticles,
    fetchArticleById,
    createArticle,
    updateArticle,
    updateArticleStatus,
    updateArticleAccess,
    deleteArticle,
    toggleArticleTop,
    toggleArticleRecommend,
    fetchArticleReviews,
    fetchArticleReviewDetail,
    approveArticleReview,
    rejectArticleReview,
    repairArticleReviewStatus,
    clearArticles,
    clearState,
  }
})
