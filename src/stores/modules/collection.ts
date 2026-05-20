/**
 * 收藏管理 Store（后台管理端）
 * 基于 content-api.md 文档 第7节
 */

import { defineStore } from 'pinia'
import { CollectionApi } from '@/api/sys/collection'
import type {
  CollectionFolderVO,
  CollectionVO,
} from '@/types/api-types'
import { usePaginatedState } from '../composables/usePaginatedState'

export const useCollectionStore = defineStore('collection', () => {
  // ==================== 状态 ====================

  const {
    items: folders,
    total: folderTotal,
    current,
    size,
    loading,
    fetch: fetchFolders,
    clear: clearFolders,
  } = usePaginatedState<CollectionFolderVO>({
    fetchFn: (params) => CollectionApi.getCollectionFolders(params),
  })

  const {
    items: collections,
    total: collectionTotal,
    fetch: fetchCollections,
    clear: clearCollectionRecords,
  } = usePaginatedState<CollectionVO>({
    fetchFn: (params) => CollectionApi.getCollections(params),
  })

  // ==================== 操作 ====================

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
    clearFolders()
    clearCollectionRecords()
  }

  const clearState = clearCollections

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
    clearState,
  }
})
