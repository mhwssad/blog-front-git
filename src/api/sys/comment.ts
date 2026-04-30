/**
 * 评论管理模块 API
 * 基于 content-api.md 文档
 */

import { http } from '../request'
import type {
  CommentQueryRequest,
  CommentVO,
  PageResult,
  StatusUpdateRequest,
} from '@/types/api-types'

/**
 * 评论管理 API
 * 提供评论的查询、状态修改和删除操作
 */
export class CommentApi {
  /**
   * 分页查询评论列表
   * GET /api/sys/comments
   */
  static getComments(params?: CommentQueryRequest) {
    return http.get<PageResult<CommentVO>>('/sys/comments', params)
  }

  /**
   * 查询评论详情
   * GET /api/sys/comments/{id}
   */
  static getCommentById(id: number) {
    return http.get<CommentVO>(`/sys/comments/${id}`)
  }

  /**
   * 修改评论状态
   * PUT /api/sys/comments/{id}/status
   */
  static updateCommentStatus(id: number, data: StatusUpdateRequest) {
    return http.put<void>(`/sys/comments/${id}/status`, data)
  }

  /**
   * 删除评论
   * DELETE /api/sys/comments/{id}
   */
  static deleteComment(id: number) {
    return http.delete<void>(`/sys/comments/${id}`)
  }
}

export default CommentApi
