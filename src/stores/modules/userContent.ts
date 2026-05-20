/**
 * 用户内容 Store（登录用户侧）
 * 提供收藏夹、足迹、评论、点赞等用户内容操作
 * 基于 content-api.md 和 follow-api.md 文档
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { usePaginatedState } from '@/stores/composables'
import { UserContentApi } from '@/api/user/content'
import type {
  ArticleAccessAssignRequest,
  ArticleReviewLogVO,
  ArticleReviewSubmitRequest,
  ArticleSeriesArticleRequest,
  ArticleSeriesSaveRequest,
  ArticleSeriesSortRequest,
  CollectionFolderSaveRequest,
  CollectionFolderVO,
  CollectionSaveRequest,
  CollectionVO,
  CommentSaveRequest,
  CommentVO,
  PublicArticleSeriesDetailVO,
  UserArticleDetailVO,
  UserArticleVO,
  UserArticleSeriesVO,
  UserFootprintVO,
} from '@/types/api-types'

export const useUserContentStore = defineStore('userContent', () => {
  const actionLoading = ref(false)
  const collectionFolderLoading = ref(false)

  const {
    items: collections, total: collectionTotal, current: collectionCurrent, size: collectionSize, loading: collectionLoading,
    fetch: fetchCollections, clear: clearCollectionsRaw,
  } = usePaginatedState<CollectionVO>({
    fetchFn: (params) => UserContentApi.getCollections(params),
  })

  const collectionFolders = ref<CollectionFolderVO[]>([])

  const {
    items: footprints, total: footprintTotal, current: footprintCurrent, size: footprintSize, loading: footprintLoading,
    fetch: fetchFootprints, clear: clearFootprintsRaw,
  } = usePaginatedState<UserFootprintVO>({
    fetchFn: (params) => UserContentApi.getFootprints(params),
  })

  const {
    items: myArticles, total: myArticleTotal, current: myArticleCurrent, size: myArticleSize, loading: myArticleLoading,
    fetch: fetchMyArticles, clear: clearMyArticlesRaw,
  } = usePaginatedState<UserArticleVO>({
    fetchFn: (params) => UserContentApi.getMyArticles(params),
  })

  const currentMyArticle = ref<UserArticleDetailVO | null>(null)
  const seriesList = ref<UserArticleSeriesVO[]>([])
  const currentSeries = ref<PublicArticleSeriesDetailVO | null>(null)
  const seriesLoading = ref(false)

  // ==================== 操作 ====================

  async function runAction(action: () => Promise<void>): Promise<boolean> {
    actionLoading.value = true
    try {
      await action()
      return true
    } catch {
      return false
    } finally {
      actionLoading.value = false
    }
  }

  async function likeArticle(id: number): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.likeArticle(id)
    })
  }

  async function unlikeArticle(id: number): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.unlikeArticle(id)
    })
  }

  async function likeComment(id: number): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.likeComment(id)
    })
  }

  async function unlikeComment(id: number): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.unlikeComment(id)
    })
  }

  async function createComment(data: CommentSaveRequest): Promise<CommentVO | null> {
    actionLoading.value = true
    try {
      const response = await UserContentApi.createComment(data)
      return response.data.data
    } catch {
      return null
    } finally {
      actionLoading.value = false
    }
  }

  async function deleteComment(id: number): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.deleteComment(id)
    })
  }

  // ==================== 收藏夹 ====================

  async function fetchCollectionFolders(): Promise<CollectionFolderVO[]> {
    collectionFolderLoading.value = true
    try {
      const response = await UserContentApi.getCollectionFolders()
      collectionFolders.value = response.data.data.records
      return collectionFolders.value
    } catch {
      collectionFolders.value = []
      return []
    } finally {
      collectionFolderLoading.value = false
    }
  }

  async function createCollectionFolder(data: CollectionFolderSaveRequest): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.createCollectionFolder(data)
    })
  }

  async function updateCollectionFolder(
    id: number,
    data: CollectionFolderSaveRequest
  ): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.updateCollectionFolder(id, data)
    })
  }

  async function deleteCollectionFolder(id: number): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.deleteCollectionFolder(id)
    })
  }

  // ==================== 收藏 ====================

  async function createCollection(data: CollectionSaveRequest): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.createCollection(data)
    })
  }

  async function deleteCollection(id: number): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.deleteCollection(id)
    })
  }

  // ==================== 足迹 ====================

  async function deleteFootprint(id: number): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.deleteFootprint(id)
    })
  }

  async function clearFootprints(): Promise<boolean> {
    const success = await runAction(async () => {
      await UserContentApi.clearFootprints()
    })

    if (success) {
      clearFootprintsRaw()
    }

    return success
  }

  // ==================== 清理 ====================

  function clearCollections(): void {
    clearCollectionsRaw()
    collectionFolders.value = []
  }

  function clearFootprintState(): void {
    clearFootprintsRaw()
  }

  function clearState(): void {
    clearCollections()
    clearFootprintState()
    clearMyArticlesRaw()
    currentMyArticle.value = null
    seriesList.value = []
    currentSeries.value = null
    seriesLoading.value = false
  }

  // ==================== 我的文章 ====================

  async function fetchMyArticleById(id: number): Promise<UserArticleDetailVO | null> {
    try {
      const response = await UserContentApi.getMyArticleById(id)
      currentMyArticle.value = response.data.data
      return currentMyArticle.value
    } catch {
      return null
    }
  }

  async function updateMyArticleAccess(
    id: number,
    data: ArticleAccessAssignRequest,
  ): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.updateMyArticleAccess(id, data)
    })
  }

  async function submitArticleReview(
    id: number,
    data?: ArticleReviewSubmitRequest,
  ): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.submitArticleReview(id, data)
    })
  }

  async function fetchArticleReviewLog(id: number): Promise<ArticleReviewLogVO[]> {
    try {
      const response = await UserContentApi.getArticleReviewLog(id)
      return response.data.data
    } catch {
      return []
    }
  }

  // ==================== 系列管理 ====================

  async function fetchMySeriesList(): Promise<void> {
    seriesLoading.value = true
    try {
      const response = await UserContentApi.getMySeriesList()
      seriesList.value = response.data.data
    } finally {
      seriesLoading.value = false
    }
  }

  async function fetchMySeriesDetail(
    id: number,
  ): Promise<PublicArticleSeriesDetailVO | null> {
    seriesLoading.value = true
    try {
      const response = await UserContentApi.getMySeriesDetail(id)
      currentSeries.value = response.data.data
      return currentSeries.value
    } catch {
      return null
    } finally {
      seriesLoading.value = false
    }
  }

  async function createSeries(data: ArticleSeriesSaveRequest): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.createSeries(data)
    })
  }

  async function updateSeries(id: number, data: ArticleSeriesSaveRequest): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.updateSeries(id, data)
    })
  }

  async function deleteSeries(id: number): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.deleteSeries(id)
    })
  }

  async function addArticleToSeries(
    id: number,
    data: ArticleSeriesArticleRequest,
  ): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.addArticleToSeries(id, data)
    })
  }

  async function removeArticleFromSeries(
    id: number,
    articleId: number,
  ): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.removeArticleFromSeries(id, articleId)
    })
  }

  async function sortSeriesArticles(
    id: number,
    data: ArticleSeriesSortRequest,
  ): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.sortSeriesArticles(id, data)
    })
  }

  return {
    actionLoading,
    collectionFolderLoading,
    collectionLoading,
    footprintLoading,
    collectionFolders,
    collections,
    collectionTotal,
    collectionCurrent,
    collectionSize,
    footprints,
    footprintTotal,
    footprintCurrent,
    footprintSize,
    myArticles,
    myArticleTotal,
    myArticleCurrent,
    myArticleSize,
    myArticleLoading,
    currentMyArticle,
    seriesList,
    currentSeries,
    seriesLoading,

    likeArticle,
    unlikeArticle,
    likeComment,
    unlikeComment,
    createComment,
    deleteComment,
    fetchCollectionFolders,
    createCollectionFolder,
    updateCollectionFolder,
    deleteCollectionFolder,
    fetchCollections,
    createCollection,
    deleteCollection,
    fetchFootprints,
    deleteFootprint,
    clearFootprints,
    clearCollections,
    clearFootprintState,
    clearState,
    fetchMyArticles,
    fetchMyArticleById,
    updateMyArticleAccess,
    submitArticleReview,
    fetchArticleReviewLog,
    fetchMySeriesList,
    fetchMySeriesDetail,
    createSeries,
    updateSeries,
    deleteSeries,
    addArticleToSeries,
    removeArticleFromSeries,
    sortSeriesArticles,
  }
})
