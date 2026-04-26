/**
 * 标签管理 Store
 * 基于 content-api.md 文档 第3节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { TagApi } from '@/api/sys/tag'
import type { TagSaveRequest, TagVO } from '@/api/types'

export const useTagStore = defineStore('tag', () => {
  // ==================== 状态 ====================

  /**
   * 标签列表
   */
  const tags = ref<TagVO[]>([])

  /**
   * 是否正在加载
   */
  const loading = ref(false)

  /**
   * 当前编辑的标签
   */
  const currentTag = ref<TagVO | null>(null)

  // ==================== 操作 ====================

  /**
   * 查询所有标签
   */
  async function fetchTags(): Promise<void> {
    loading.value = true
    try {
      const response = await TagApi.getTags()
      tags.value = response.data.data
    } finally {
      loading.value = false
    }
  }

  /**
   * 查询标签详情
   */
  async function fetchTagById(id: number): Promise<TagVO | null> {
    try {
      const response = await TagApi.getTagById(id)
      currentTag.value = response.data.data
      return currentTag.value
    } catch {
      return null
    }
  }

  /**
   * 新增标签
   */
  async function createTag(data: TagSaveRequest): Promise<boolean> {
    try {
      await TagApi.createTag(data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 修改标签
   */
  async function updateTag(id: number, data: TagSaveRequest): Promise<boolean> {
    try {
      await TagApi.updateTag(id, data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 删除标签
   */
  async function deleteTag(id: number): Promise<boolean> {
    try {
      await TagApi.deleteTag(id)
      return true
    } catch {
      return false
    }
  }

  /**
   * 清空标签列表
   */
  function clearTags(): void {
    tags.value = []
    currentTag.value = null
  }

  return {
    // 状态
    tags,
    loading,
    currentTag,

    // 操作
    fetchTags,
    fetchTagById,
    createTag,
    updateTag,
    deleteTag,
    clearTags,
  }
})
