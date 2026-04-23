import { ref } from 'vue'
import { defineStore } from 'pinia'
import { userContentApi } from '@/api/user/content'
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
  const actionLoading = ref(false)
  const collectionFolderLoading = ref(false)
  const collectionLoading = ref(false)
  const footprintLoading = ref(false)
  const collectionFolders = ref<CollectionFolderVO[]>([])
  const collections = ref<CollectionVO[]>([])
  const collectionTotal = ref(0)
  const collectionCurrent = ref(1)
  const collectionSize = ref(10)
  const footprints = ref<UserFootprintVO[]>([])
  const footprintTotal = ref(0)
  const footprintCurrent = ref(1)
  const footprintSize = ref(10)

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

  function assignCollectionPage(data: PageResult<CollectionVO>): void {
    collections.value = data.records
    collectionTotal.value = data.total
    collectionCurrent.value = data.current
    collectionSize.value = data.size
  }

  function assignFootprintPage(data: PageResult<UserFootprintVO>): void {
    footprints.value = data.records
    footprintTotal.value = data.total
    footprintCurrent.value = data.current
    footprintSize.value = data.size
  }

  async function likeArticle(id: number): Promise<boolean> {
    return runAction(async () => {
      await userContentApi.likeArticle(id)
    })
  }

  async function unlikeArticle(id: number): Promise<boolean> {
    return runAction(async () => {
      await userContentApi.unlikeArticle(id)
    })
  }

  async function likeComment(id: number): Promise<boolean> {
    return runAction(async () => {
      await userContentApi.likeComment(id)
    })
  }

  async function unlikeComment(id: number): Promise<boolean> {
    return runAction(async () => {
      await userContentApi.unlikeComment(id)
    })
  }

  async function createComment(data: CommentSaveRequest): Promise<CommentVO | null> {
    actionLoading.value = true
    try {
      const response = await userContentApi.createComment(data)
      return response.data.data
    } catch {
      return null
    } finally {
      actionLoading.value = false
    }
  }

  async function deleteComment(id: number): Promise<boolean> {
    return runAction(async () => {
      await userContentApi.deleteComment(id)
    })
  }

  async function fetchCollectionFolders(): Promise<CollectionFolderVO[]> {
    collectionFolderLoading.value = true
    try {
      const response = await userContentApi.getCollectionFolders()
      collectionFolders.value = response.data.data
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
      await userContentApi.createCollectionFolder(data)
    })
  }

  async function updateCollectionFolder(
    id: number,
    data: CollectionFolderSaveRequest
  ): Promise<boolean> {
    return runAction(async () => {
      await userContentApi.updateCollectionFolder(id, data)
    })
  }

  async function deleteCollectionFolder(id: number): Promise<boolean> {
    return runAction(async () => {
      await userContentApi.deleteCollectionFolder(id)
    })
  }

  async function fetchCollections(params?: UserCollectionQueryRequest): Promise<void> {
    collectionLoading.value = true
    try {
      const response = await userContentApi.getCollections(params)
      assignCollectionPage(response.data.data)
    } finally {
      collectionLoading.value = false
    }
  }

  async function createCollection(data: CollectionSaveRequest): Promise<boolean> {
    return runAction(async () => {
      await userContentApi.createCollection(data)
    })
  }

  async function deleteCollection(id: number): Promise<boolean> {
    return runAction(async () => {
      await userContentApi.deleteCollection(id)
    })
  }

  async function fetchFootprints(params?: UserFootprintQueryRequest): Promise<void> {
    footprintLoading.value = true
    try {
      const response = await userContentApi.getFootprints(params)
      assignFootprintPage(response.data.data)
    } finally {
      footprintLoading.value = false
    }
  }

  async function deleteFootprint(id: number): Promise<boolean> {
    return runAction(async () => {
      await userContentApi.deleteFootprint(id)
    })
  }

  async function clearFootprints(): Promise<boolean> {
    const success = await runAction(async () => {
      await userContentApi.clearFootprints()
    })

    if (success) {
      footprints.value = []
      footprintTotal.value = 0
      footprintCurrent.value = 1
    }

    return success
  }

  function clearCollections(): void {
    collectionFolders.value = []
    collections.value = []
    collectionTotal.value = 0
    collectionCurrent.value = 1
  }

  function clearFootprintState(): void {
    footprints.value = []
    footprintTotal.value = 0
    footprintCurrent.value = 1
  }

  function clearState(): void {
    clearCollections()
    clearFootprintState()
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
