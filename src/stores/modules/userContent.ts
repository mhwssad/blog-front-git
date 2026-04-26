/**
 * 用户内容 Store（登录用户侧）
 * 提供收藏夹、足迹、评论、点赞等用户内容操作
 * 基于 content-api.md 和 follow-api.md 文档
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { UserContentApi } from '@/api/user/content'
import type {
  CollectionFolderSaveRequest,
  CollectionFolderVO,
  CollectionSaveRequest,
  CollectionVO,
  CommentSaveRequest,
  CommentVO,
  PageResult,
  UserCollectionQueryRequest,
  UserFootprintQueryRequest,
  UserFootprintVO,
} from '@/api/types'

export const useUserContentStore = defineStore('userContent', () => {
  // ==================== 状态 ====================

  /**
   * 操作（如点赞、评论）加载状态
   */
  const actionLoading = ref(false)

  /**
   * 收藏夹列表加载状态
   */
  const collectionFolderLoading = ref(false)

  /**
   * 收藏列表加载状态
   */
  const collectionLoading = ref(false)

  /**
   * 足迹列表加载状态
   */
  const footprintLoading = ref(false)

  /**
   * 收藏夹列表
   */
  const collectionFolders = ref<CollectionFolderVO[]>([])

  /**
   * 收藏列表
   */
  const collections = ref<CollectionVO[]>([])

  /**
   * 收藏总数
   */
  const collectionTotal = ref(0)

  /**
   * 收藏当前页
   */
  const collectionCurrent = ref(1)

  /**
   * 收藏每页数量
   */
  const collectionSize = ref(10)

  /**
   * 足迹列表
   */
  const footprints = ref<UserFootprintVO[]>([])

  /**
   * 足迹总数
   */
  const footprintTotal = ref(0)

  /**
   * 足迹当前页
   */
  const footprintCurrent = ref(1)

  /**
   * 足迹每页数量
   */
  const footprintSize = ref(10)

  // ==================== 操作 ====================

  /**
   * 执行操作（通用包装）
   */
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

  /**
   * 赋值收藏分页数据
   */
  function assignCollectionPage(data: PageResult<CollectionVO>): void {
    collections.value = data.records
    collectionTotal.value = data.total
    collectionCurrent.value = data.current
    collectionSize.value = data.size
  }

  /**
   * 赋值足迹分页数据
   */
  function assignFootprintPage(data: PageResult<UserFootprintVO>): void {
    footprints.value = data.records
    footprintTotal.value = data.total
    footprintCurrent.value = data.current
    footprintSize.value = data.size
  }

  /**
   * 点赞文章
   */
  async function likeArticle(id: number): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.likeArticle(id)
    })
  }

  /**
   * 取消点赞文章
   */
  async function unlikeArticle(id: number): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.unlikeArticle(id)
    })
  }

  /**
   * 点赞评论
   */
  async function likeComment(id: number): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.likeComment(id)
    })
  }

  /**
   * 取消点赞评论
   */
  async function unlikeComment(id: number): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.unlikeComment(id)
    })
  }

  /**
   * 发表评论
   */
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

  /**
   * 删除评论
   */
  async function deleteComment(id: number): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.deleteComment(id)
    })
  }

  /**
   * 获取收藏夹列表
   */
  async function fetchCollectionFolders(): Promise<CollectionFolderVO[]> {
    collectionFolderLoading.value = true
    try {
      const response = await UserContentApi.getCollectionFolders()
      collectionFolders.value = response.data.data
      return collectionFolders.value
    } catch {
      collectionFolders.value = []
      return []
    } finally {
      collectionFolderLoading.value = false
    }
  }

  /**
   * 创建收藏夹
   */
  async function createCollectionFolder(data: CollectionFolderSaveRequest): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.createCollectionFolder(data)
    })
  }

  /**
   * 更新收藏夹
   */
  async function updateCollectionFolder(
    id: number,
    data: CollectionFolderSaveRequest
  ): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.updateCollectionFolder(id, data)
    })
  }

  /**
   * 删除收藏夹
   */
  async function deleteCollectionFolder(id: number): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.deleteCollectionFolder(id)
    })
  }

  /**
   * 分页查询收藏记录
   */
  async function fetchCollections(params?: UserCollectionQueryRequest): Promise<void> {
    collectionLoading.value = true
    try {
      const response = await UserContentApi.getCollections(params)
      assignCollectionPage(response.data.data)
    } finally {
      collectionLoading.value = false
    }
  }

  /**
   * 添加收藏
   */
  async function createCollection(data: CollectionSaveRequest): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.createCollection(data)
    })
  }

  /**
   * 删除收藏
   */
  async function deleteCollection(id: number): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.deleteCollection(id)
    })
  }

  /**
   * 分页查询足迹
   */
  async function fetchFootprints(params?: UserFootprintQueryRequest): Promise<void> {
    footprintLoading.value = true
    try {
      const response = await UserContentApi.getFootprints(params)
      assignFootprintPage(response.data.data)
    } finally {
      footprintLoading.value = false
    }
  }

  /**
   * 删除单条足迹
   */
  async function deleteFootprint(id: number): Promise<boolean> {
    return runAction(async () => {
      await UserContentApi.deleteFootprint(id)
    })
  }

  /**
   * 清空所有足迹
   */
  async function clearFootprints(): Promise<boolean> {
    const success = await runAction(async () => {
      await UserContentApi.clearFootprints()
    })

    if (success) {
      footprints.value = []
      footprintTotal.value = 0
      footprintCurrent.value = 1
    }

    return success
  }

  /**
   * 清空收藏相关状态
   */
  function clearCollections(): void {
    collectionFolders.value = []
    collections.value = []
    collectionTotal.value = 0
    collectionCurrent.value = 1
  }

  /**
   * 清空足迹相关状态
   */
  function clearFootprintState(): void {
    footprints.value = []
    footprintTotal.value = 0
    footprintCurrent.value = 1
  }

  /**
   * 清空所有状态
   */
  function clearState(): void {
    clearCollections()
    clearFootprintState()
  }

  return {
    // 状态
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

    // 操作
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
  }
})
