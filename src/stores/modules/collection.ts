import { ref } from 'vue'
import { defineStore } from 'pinia'
import { CollectionApi } from '@/api/sys/collection'
import type {
  CollectionFolderQueryRequest,
  CollectionFolderVO,
  CollectionVO,
  PageResult,
} from '@/api/types'

export const useCollectionStore = defineStore('collection', () => {
  const folders = ref<CollectionFolderVO[]>([])
  const folderTotal = ref(0)
  const collections = ref<CollectionVO[]>([])
  const collectionTotal = ref(0)
  const current = ref(1)
  const size = ref(10)
  const loading = ref(false)

  async function fetchFolders(params?: CollectionFolderQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await CollectionApi.getCollectionFolders(params)
      const data = response.data.data as PageResult<CollectionFolderVO>

      folders.value = data.records
      folderTotal.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  async function fetchCollections(params?: CollectionFolderQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await CollectionApi.getCollections(params)
      const data = response.data.data as PageResult<CollectionVO>

      collections.value = data.records
      collectionTotal.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  async function deleteCollection(id: number): Promise<boolean> {
    try {
      await CollectionApi.deleteCollection(id)
      return true
    } catch {
      return false
    }
  }

  function clearCollections(): void {
    folders.value = []
    folderTotal.value = 0
    collections.value = []
    collectionTotal.value = 0
    current.value = 1
  }

  return {
    folders,
    folderTotal,
    collections,
    collectionTotal,
    current,
    size,
    loading,
    fetchFolders,
    fetchCollections,
    deleteCollection,
    clearCollections,
  }
})
