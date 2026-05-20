/**
 * 论坛后台管理 Store（多实体聚合）
 * @see docs/api文档/forum-api.md
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { usePaginatedState } from '@/stores/composables'
import { ForumSectionSysApi, ForumPostSysApi, ForumReplySysApi } from '@/api/sys/forum'
import type {
  ForumSectionVO,
  ForumSectionSaveRequest,
  ForumPostAdminVO,
  ForumPostAdminDetailVO,
  ForumReplyAdminVO,
  StatusUpdateRequest,
} from '@/types/api-types'

export const useForumAdminStore = defineStore('admin-forum', () => {
  const {
    items: sections, total: sectionTotal, loading: sectionLoading,
    fetch: fetchSections, clear: clearSectionsRaw,
  } = usePaginatedState<ForumSectionVO>({
    fetchFn: (params) => ForumSectionSysApi.getSections(params),
  })

  const currentSection = ref<ForumSectionVO | null>(null)

  const {
    items: posts, total: postTotal, loading: postLoading,
    fetch: fetchPosts, clear: clearPostsRaw,
  } = usePaginatedState<ForumPostAdminVO>({
    fetchFn: (params) => ForumPostSysApi.getPosts(params),
  })

  const currentPost = ref<ForumPostAdminDetailVO | null>(null)

  const {
    items: replies, total: replyTotal, loading: replyLoading,
    fetch: fetchReplies, clear: clearRepliesRaw,
  } = usePaginatedState<ForumReplyAdminVO>({
    fetchFn: (params) => ForumReplySysApi.getReplies(params),
  })

  // ==================== 版块管理 ====================

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
    clearSectionsRaw()
    clearPostsRaw()
    clearRepliesRaw()
    currentSection.value = null
    currentPost.value = null
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
