/**
 * 论坛公开 API
 * @see docs/api文档/forum-api.md
 */

import { http } from './request'
import type {
  ForumSectionVO,
  ForumPostVO,
  ForumPostDetailVO,
  ForumPostQueryRequest,
  ForumReplyVO,
  PageResult,
} from '@/types/api-types'

export class ForumApi {
  static getSections() {
    return http.get<ForumSectionVO[]>('/forum/sections')
  }

  static getPosts(params?: ForumPostQueryRequest) {
    return http.get<PageResult<ForumPostVO>>('/forum/posts', params)
  }

  static getPostById(id: number) {
    return http.get<ForumPostDetailVO>(`/forum/posts/${id}`)
  }

  static getReplies(postId: number, params?: { current?: number; size?: number }) {
    return http.get<PageResult<ForumReplyVO>>(`/forum/posts/${postId}/replies`, params)
  }
}
