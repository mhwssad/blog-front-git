import { ref } from 'vue'
import { defineStore } from 'pinia'
import { CommentApi } from '@/api/sys/comment'
import type {
  CommentQueryRequest,
  CommentVO,
  PageResult,
  StatusUpdateRequest,
} from '@/api/types'

export const useCommentStore = defineStore('comment', () => {
  const comments = ref<CommentVO[]>([])
  const total = ref(0)
  const current = ref(1)
  const size = ref(10)
  const loading = ref(false)
  const currentComment = ref<CommentVO | null>(null)

  async function fetchComments(params?: CommentQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await CommentApi.getComments(params)
      const data = response.data.data as PageResult<CommentVO>

      comments.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  async function fetchCommentById(id: number): Promise<CommentVO | null> {
    try {
      const response = await CommentApi.getCommentById(id)
      currentComment.value = response.data.data
      return currentComment.value
    } catch {
      return null
    }
  }

  async function updateCommentStatus(id: number, data: StatusUpdateRequest): Promise<boolean> {
    try {
      await CommentApi.updateCommentStatus(id, data)
      return true
    } catch {
      return false
    }
  }

  async function deleteComment(id: number): Promise<boolean> {
    try {
      await CommentApi.deleteComment(id)
      return true
    } catch {
      return false
    }
  }

  function clearComments(): void {
    comments.value = []
    total.value = 0
    current.value = 1
    currentComment.value = null
  }

  return {
    comments,
    total,
    current,
    size,
    loading,
    currentComment,
    fetchComments,
    fetchCommentById,
    updateCommentStatus,
    deleteComment,
    clearComments,
  }
})
