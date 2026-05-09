/**
 * 论坛用户 API
 * @see docs/api文档/forum-api.md
 */

import { http } from '../request'
import type {
  ForumPostDetailVO,
  ForumPostSaveRequest,
  ForumPostUserQueryRequest,
  ForumPostVO,
  ForumReplySaveRequest,
  ForumCollectionRequest,
  ForumChannelShareVO,
  ForumChannelShareRequest,
  PageResult,
} from '@/types/api-types'

export class UserForumApi {
  // 帖子
  static createPost(data: ForumPostSaveRequest) {
    return http.post<ForumPostDetailVO>('/user/forum/posts', data)
  }

  static updatePost(id: number, data: ForumPostSaveRequest) {
    return http.put<ForumPostDetailVO>(`/user/forum/posts/${id}`, data)
  }

  static deletePost(id: number) {
    return http.delete<void>(`/user/forum/posts/${id}`)
  }

  static getMyPosts(params?: ForumPostUserQueryRequest) {
    return http.get<PageResult<ForumPostVO>>('/user/forum/posts', params)
  }

  static getMyPostById(id: number) {
    return http.get<ForumPostDetailVO>(`/user/forum/posts/${id}`)
  }

  // 回复
  static createReply(postId: number, data: ForumReplySaveRequest) {
    return http.post<void>(`/user/forum/posts/${postId}/replies`, data)
  }

  static updateReply(replyId: number, data: ForumReplySaveRequest) {
    return http.put<void>(`/user/forum/replies/${replyId}`, data)
  }

  static deleteReply(replyId: number) {
    return http.delete<void>(`/user/forum/replies/${replyId}`)
  }

  // 互动
  static likePost(postId: number) {
    return http.post<void>(`/user/forum/posts/${postId}/likes`)
  }

  static unlikePost(postId: number) {
    return http.delete<void>(`/user/forum/posts/${postId}/likes`)
  }

  static collectPost(postId: number, data?: ForumCollectionRequest) {
    return http.post<void>(`/user/forum/posts/${postId}/collections`, data)
  }

  static uncollectPost(postId: number) {
    return http.delete<void>(`/user/forum/posts/${postId}/collections`)
  }

  // 频道分享
  static channelShare(postId: number, data: ForumChannelShareRequest) {
    return http.post<ForumChannelShareVO>(`/user/forum/posts/${postId}/channel-share`, data)
  }
}
