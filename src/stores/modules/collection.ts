/**
 * 收藏管理 Store（后台管理端）
 * 基于 content-api.md 文档 第7节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { CollectionApi } from '@/api/sys/collection'
import type {
  CollectionFolderQueryRequest,
  CollectionFolderVO,
  CollectionVO,
} from '@/api/types'

export const useCollectionStore = defineStore('collection', () => {
  // ==================== 状态 ====================

  /**
   * 收藏夹列表
   */
  const folders = ref<CollectionFolderVO[]>([])

  /**
   * 收藏夹总数
   */
  const folderTotal = ref(0)

  /**
   * 收藏列表
   */
  const collections = ref<CollectionVO[]>([])

  /**
   * 收藏总数
   */
  const collectionTotal = ref(0)

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

  // ==================== 操作 ====================

  /**
   * 分页查询收藏夹
   */
  async function fetchFolders(params?: CollectionFolderQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await CollectionApi.getCollectionFolders(params)
      const data = response.data.data

      folders.value = data.records
      folderTotal.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  /**
   * 分页查询收藏记录
   */
  async function fetchCollections(params?: CollectionFolderQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await CollectionApi.getCollections(params)
      const data = response.data.data

      collections.value = data.records
      collectionTotal.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除收藏记录
   */
  async function deleteCollection(id: number): Promise<boolean> {
    try {
      await CollectionApi.deleteCollection(id)
      return true
    } catch {
      return false
    }
  }

  /**
   * 清空列表
   */
  function clearCollections(): void {
    folders.value = []
    folderTotal.value = 0
    collections.value = []
    collectionTotal.value = 0
    current.value = 1
  }

  return {
    // 状态
    folders,
    folderTotal,
    collections,
    collectionTotal,
    current,
    size,
    loading,

    // 操作
    fetchFolders,
    fetchCollections,
    deleteCollection,
    clearCollections,
  }
})
