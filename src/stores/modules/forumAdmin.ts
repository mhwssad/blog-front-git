/**
 * 论坛后台管理 Store（多实体聚合）
 * @see docs/api文档/forum-api.md
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ForumSectionSysApi, ForumPostSysApi, ForumReplySysApi } from '@/api/sys/forum'
import type {
  ForumSectionVO,
  ForumSectionSaveRequest,
  ForumSectionQueryRequest,
  ForumPostAdminVO,
  ForumPostAdminDetailVO,
  ForumPostAdminQueryRequest,
  ForumReplyAdminVO,
  ForumReplyAdminQueryRequest,
  StatusUpdateRequest,
} from '@/types/api-types'

export const useForumAdminStore = defineStore('admin-forum', () => {
  // ==================== 版块状态 ====================
  const sections = ref<ForumSectionVO[]>([])
  const sectionTotal = ref(0)
  const currentSection = ref<ForumSectionVO | null>(null)
  const sectionLoading = ref(false)

  // ==================== 帖子状态 ====================
  const posts = ref<ForumPostAdminVO[]>([])
  const postTotal = ref(0)
  const currentPost = ref<ForumPostAdminDetailVO | null>(null)
  const postLoading = ref(false)

  // ==================== 回复状态 ====================
  const replies = ref<ForumReplyAdminVO[]>([])
  const replyTotal = ref(0)
  const replyLoading = ref(false)

  // ==================== 版块管理 ====================

  async function fetchSections(params?: ForumSectionQueryRequest): Promise<void> {
    sectionLoading.value = true
    try {
      const response = await ForumSectionSysApi.getSections(params)
      const data = response.data.data
      sections.value = data.records
      sectionTotal.value = data.total
    } finally {
      sectionLoading.value = false
    }
  }

  async function fetchSectionById(id: number): Promise<ForumSectionVO | null> {
    try {
      const response = await ForumSectionSysApi.getSectionById(id)
      currentSection.value = response.data.data
      return currentSection.value
    } catch {
      return null
    }
  }

  async function createSection(data: ForumSectionSaveRequest): Promise<boolean> {
    try {
      await ForumSectionSysApi.createSection(data)
      return true
    } catch {
      return false
    }
  }

  async function updateSection(id: number, data: ForumSectionSaveRequest): Promise<boolean> {
    try {
      await ForumSectionSysApi.updateSection(id, data)
      return true
    } catch {
      return false
    }
  }

  async function updateSectionStatus(id: number, data: StatusUpdateRequest): Promise<boolean> {
    try {
      await ForumSectionSysApi.updateSectionStatus(id, data)
      return true
    } catch {
      return false
    }
  }

  async function deleteSection(id: number): Promise<boolean> {
    try {
      await ForumSectionSysApi.deleteSection(id)
      return true
    } catch {
      return false
    }
  }

  // ==================== 帖子管理 ====================

  async function fetchPosts(params?: ForumPostAdminQueryRequest): Promise<void> {
    postLoading.value = true
    try {
      const response = await ForumPostSysApi.getPosts(params)
      const data = response.data.data
      posts.value = data.records
      postTotal.value = data.total
    } finally {
      postLoading.value = false
    }
  }

  async function fetchPostById(id: number): Promise<ForumPostAdminDetailVO | null> {
    try {
      const response = await ForumPostSysApi.getPostById(id)
      currentPost.value = response.data.data
      return currentPost.value
    } catch {
      return null
    }
  }

  async function hidePost(id: number): Promise<boolean> {
    try {
      await ForumPostSysApi.hidePost(id)
      return true
    } catch {
      return false
    }
  }

  async function restorePost(id: number): Promise<boolean> {
    try {
      await ForumPostSysApi.restorePost(id)
      return true
    } catch {
      return false
    }
  }

  async function deletePost(id: number): Promise<boolean> {
    try {
      await ForumPostSysApi.deletePost(id)
      return true
    } catch {
      return false
    }
  }

  async function togglePostTop(id: number, enabled: boolean): Promise<boolean> {
    try {
      await ForumPostSysApi.togglePostTop(id, enabled)
      return true
    } catch {
      return false
    }
  }

  async function togglePostEssence(id: number, enabled: boolean): Promise<boolean> {
    try {
      await ForumPostSysApi.togglePostEssence(id, enabled)
      return true
    } catch {
      return false
    }
  }

  // ==================== 回复管理 ====================

  async function fetchReplies(params?: ForumReplyAdminQueryRequest): Promise<void> {
    replyLoading.value = true
    try {
      const response = await ForumReplySysApi.getReplies(params)
      const data = response.data.data
      replies.value = data.records
      replyTotal.value = data.total
    } finally {
      replyLoading.value = false
    }
  }

  async function hideReply(id: number): Promise<boolean> {
    try {
      await ForumReplySysApi.hideReply(id)
      return true
    } catch {
      return false
    }
  }

  async function restoreReply(id: number): Promise<boolean> {
    try {
      await ForumReplySysApi.restoreReply(id)
      return true
    } catch {
      return false
    }
  }

  async function deleteReply(id: number): Promise<boolean> {
    try {
      await ForumReplySysApi.deleteReply(id)
      return true
    } catch {
      return false
    }
  }

  // ==================== 清理 ====================

  function clearState(): void {
    sections.value = []
    sectionTotal.value = 0
    currentSection.value = null
    posts.value = []
    postTotal.value = 0
    currentPost.value = null
    replies.value = []
    replyTotal.value = 0
  }

  return {
    sections,
    sectionTotal,
    currentSection,
    sectionLoading,
    posts,
    postTotal,
    currentPost,
    postLoading,
    replies,
    replyTotal,
    replyLoading,

    fetchSections,
    fetchSectionById,
    createSection,
    updateSection,
    updateSectionStatus,
    deleteSection,
    fetchPosts,
    fetchPostById,
    hidePost,
    restorePost,
    deletePost,
    togglePostTop,
    togglePostEssence,
    fetchReplies,
    hideReply,
    restoreReply,
    deleteReply,
    clearState,
  }
})
