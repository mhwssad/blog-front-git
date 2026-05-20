/**
 * 评论管理 Store（后台管理端）
 * 基于 content-api.md 文档 第5节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { CommentApi } from '@/api/sys/comment'
import { usePaginatedState } from '../composables/usePaginatedState'
import type {
  CommentQueryRequest,
  CommentVO,
  StatusUpdateRequest,
} from '@/types/api-types'

export const useCommentStore = defineStore('comment', () => {
  // ==================== 状态 ====================

  const {
    items: comments,
    total,
    current,
    size,
    loading,
    fetch: fetchComments,
    clear: _clearList,
  } = usePaginatedState<CommentVO>({
    fetchFn: (params) => CommentApi.getComments(params),
  })

  /**
   * 当前查看的评论
   */
  const currentComment = ref<CommentVO | null>(null)

  // ==================== 操作 ====================

  /**
   * 查询评论详情
   */
  async function fetchCommentById(id: number): Promise<CommentVO | null> {
    try {
      const response = await CommentApi.getCommentById(id)
      currentComment.value = response.data.data
      return currentComment.value
    } catch {
      return null
    }
  }

  /**
   * 修改评论状态
   */
  async function updateCommentStatus(id: number, data: StatusUpdateRequest): Promise<boolean> {
    try {
      await CommentApi.updateCommentStatus(id, data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 删除评论
   */
  async function deleteComment(id: number): Promise<boolean> {
    try {
      await CommentApi.deleteComment(id)
      return true
    } catch {
      return false
    }
  }

  /**
   * 清空列表及详情
   */
  function clearComments(): void {
    _clearList()
    currentComment.value = null
  }

  const clearState = clearComments

  return {
    // 状态
    comments,
    total,
    current,
    size,
    loading,
    currentComment,

    // 操作
    fetchComments,
    fetchCommentById,
    updateCommentStatus,
    deleteComment,
    clearComments,
  }
})
