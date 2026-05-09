/**
 * 用户论坛 Store
 * @see docs/api文档/forum-api.md
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ForumApi } from '@/api/forum'
import { UserForumApi } from '@/api/user/forum'
import type {
  ForumSectionVO,
  ForumPostVO,
  ForumPostDetailVO,
  ForumPostQueryRequest,
  ForumPostSaveRequest,
  ForumPostUserQueryRequest,
  ForumReplyVO,
  ForumReplySaveRequest,
  ForumCollectionRequest,
  ForumChannelShareRequest,
} from '@/types/api-types'

export const useUserForumStore = defineStore('userForum', () => {
  const sections = ref<ForumSectionVO[]>([])
  const posts = ref<ForumPostVO[]>([])
  const postTotal = ref(0)
  const currentPost = ref<ForumPostDetailVO | null>(null)
  const replies = ref<ForumReplyVO[]>([])
  const replyTotal = ref(0)
  const loading = ref(false)

  // ==================== 浏览 ====================

  async function fetchSections(): Promise<void> {
    const response = await ForumApi.getSections()
    sections.value = response.data.data ?? []
  }

  async function fetchPosts(params?: ForumPostQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await ForumApi.getPosts(params)
      const data = response.data.data
      posts.value = data.records
      postTotal.value = data.total
    } finally {
      loading.value = false
    }
  }

  async function fetchPostById(id: number): Promise<ForumPostDetailVO | null> {
    try {
      const response = await ForumApi.getPostById(id)
      currentPost.value = response.data.data
      return currentPost.value
    } catch {
      return null
    }
  }

  async function fetchReplies(postId: number, params?: { current?: number; size?: number }): Promise<void> {
    loading.value = true
    try {
      const response = await ForumApi.getReplies(postId, params)
      const data = response.data.data
      replies.value = data.records
      replyTotal.value = data.total
    } finally {
      loading.value = false
    }
  }

  // ==================== 发帖 ====================

  async function createPost(data: ForumPostSaveRequest): Promise<boolean> {
    try {
      await UserForumApi.createPost(data)
      return true
    } catch {
      return false
    }
  }

  async function updatePost(id: number, data: ForumPostSaveRequest): Promise<boolean> {
    try {
      await UserForumApi.updatePost(id, data)
      return true
    } catch {
      return false
    }
  }

  async function deletePost(id: number): Promise<boolean> {
    try {
      await UserForumApi.deletePost(id)
      return true
    } catch {
      return false
    }
  }

  async function getMyPosts(params?: ForumPostUserQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await UserForumApi.getMyPosts(params)
      const data = response.data.data
      posts.value = data.records
      postTotal.value = data.total
    } finally {
      loading.value = false
    }
  }

  // ==================== 回复 ====================

  async function createReply(postId: number, data: ForumReplySaveRequest): Promise<boolean> {
    try {
      await UserForumApi.createReply(postId, data)
      return true
    } catch {
      return false
    }
  }

  async function updateReply(replyId: number, data: ForumReplySaveRequest): Promise<boolean> {
    try {
      await UserForumApi.updateReply(replyId, data)
      return true
    } catch {
      return false
    }
  }

  async function deleteReply(replyId: number): Promise<boolean> {
    try {
      await UserForumApi.deleteReply(replyId)
      return true
    } catch {
      return false
    }
  }

  // ==================== 互动 ====================

  async function likePost(postId: number): Promise<boolean> {
    try {
      await UserForumApi.likePost(postId)
      return true
    } catch {
      return false
    }
  }

  async function unlikePost(postId: number): Promise<boolean> {
    try {
      await UserForumApi.unlikePost(postId)
      return true
    } catch {
      return false
    }
  }

  async function collectPost(postId: number, data?: ForumCollectionRequest): Promise<boolean> {
    try {
      await UserForumApi.collectPost(postId, data)
      return true
    } catch {
      return false
    }
  }

  async function uncollectPost(postId: number): Promise<boolean> {
    try {
      await UserForumApi.uncollectPost(postId)
      return true
    } catch {
      return false
    }
  }

  async function channelShare(postId: number, data: ForumChannelShareRequest): Promise<boolean> {
    try {
      await UserForumApi.channelShare(postId, data)
      return true
    } catch {
      return false
    }
  }

  // ==================== 清理 ====================

  function clearState(): void {
    sections.value = []
    posts.value = []
    postTotal.value = 0
    currentPost.value = null
    replies.value = []
    replyTotal.value = 0
  }

  return {
    sections,
    posts,
    postTotal,
    currentPost,
    replies,
    replyTotal,
    loading,
    fetchSections,
    fetchPosts,
    fetchPostById,
    fetchReplies,
    createPost,
    updatePost,
    deletePost,
    getMyPosts,
    createReply,
    updateReply,
    deleteReply,
    likePost,
    unlikePost,
    collectPost,
    uncollectPost,
    channelShare,
    clearState,
  }
})
