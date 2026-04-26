/**
 * 评论管理 Store（后台管理端）
 * 基于 content-api.md 文档 第5节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { CommentApi } from '@/api/sys/comment'
import type {
  CommentQueryRequest,
  CommentVO,
  StatusUpdateRequest,
} from '@/api/types'

export const useCommentStore = defineStore('comment', () => {
  // ==================== 状态 ====================

  /**
   * 评论列表
   */
  const comments = ref<CommentVO[]>([])

  /**
   * 评论总数
   */
  const total = ref(0)

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

  /**
   * 当前查看的评论
   */
  const currentComment = ref<CommentVO | null>(null)

  // ==================== 操作 ====================

  /**
   * 分页查询评论
   */
  async function fetchComments(params?: CommentQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await CommentApi.getComments(params)
      const data = response.data.data

      comments.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

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
   * 清空列表
   */
  function clearComments(): void {
    comments.value = []
    total.value = 0
    current.value = 1
    currentComment.value = null
  }

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
