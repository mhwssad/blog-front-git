import { http } from '../request'
import type {
  CommentQueryRequest,
  CommentVO,
  PageResult,
  StatusUpdateRequest,
} from '../types'

export const commentApi = {
  getComments: (params?: CommentQueryRequest) =>
    http.get<PageResult<CommentVO>>('/sys/comments', params),

  getCommentById: (id: number) =>
    http.get<CommentVO>(`/sys/comments/${id}`),

  updateCommentStatus: (id: number, data: StatusUpdateRequest) =>
    http.put<void>(`/sys/comments/${id}/status`, data),

  deleteComment: (id: number) =>
    http.delete<void>(`/sys/comments/${id}`),
}

export default commentApi
