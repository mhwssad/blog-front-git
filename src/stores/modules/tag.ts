import { ref } from 'vue'
import { defineStore } from 'pinia'
import { tagApi } from '@/api/sys/tag'
import type { TagSaveRequest, TagVO } from '@/api/types'

export const useTagStore = defineStore('tag', () => {
  const tags = ref<TagVO[]>([])
  const loading = ref(false)
  const currentTag = ref<TagVO | null>(null)

  async function fetchTags(): Promise<void> {
    loading.value = true
    try {
      const response = await tagApi.getTags()
      tags.value = response.data.data
    } finally {
      loading.value = false
    }
  }

  async function fetchTagById(id: number): Promise<TagVO | null> {
    try {
      const response = await tagApi.getTagById(id)
      currentTag.value = response.data.data
      return currentTag.value
    } catch {
      return null
    }
  }

  async function createTag(data: TagSaveRequest): Promise<boolean> {
    try {
      await tagApi.createTag(data)
      return true
    } catch {
      return false
    }
  }

  async function updateTag(id: number, data: TagSaveRequest): Promise<boolean> {
    try {
      await tagApi.updateTag(id, data)
      return true
    } catch {
      return false
    }
  }

  async function deleteTag(id: number): Promise<boolean> {
    try {
      await tagApi.deleteTag(id)
      return true
    } catch {
      return false
    }
  }

  function clearTags(): void {
    tags.value = []
    currentTag.value = null
  }

  return {
    tags,
    loading,
    currentTag,
    fetchTags,
    fetchTagById,
    createTag,
    updateTag,
    deleteTag,
    clearTags,
  }
})
