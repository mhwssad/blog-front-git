/**
 * 论坛后台管理 API
 * @see docs/api文档/forum-api.md
 */

import { http } from '../request'
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
  PageResult,
} from '@/types/api-types'

// ==================== 版块管理 ====================

export class ForumSectionSysApi {
  static getSections(params?: ForumSectionQueryRequest) {
    return http.get<PageResult<ForumSectionVO>>('/sys/forum/sections', params)
  }

  static getSectionById(id: number) {
    return http.get<ForumSectionVO>(`/sys/forum/sections/${id}`)
  }

  static createSection(data: ForumSectionSaveRequest) {
    return http.post<ForumSectionVO>('/sys/forum/sections', data)
  }

  static updateSection(id: number, data: ForumSectionSaveRequest) {
    return http.put<ForumSectionVO>(`/sys/forum/sections/${id}`, data)
  }

  static updateSectionStatus(id: number, data: StatusUpdateRequest) {
    return http.put<void>(`/sys/forum/sections/${id}/status`, data)
  }

  static deleteSection(id: number) {
    return http.delete<void>(`/sys/forum/sections/${id}`)
  }
}

// ==================== 帖子管理 ====================

export class ForumPostSysApi {
  static getPosts(params?: ForumPostAdminQueryRequest) {
    return http.get<PageResult<ForumPostAdminVO>>('/sys/forum/posts', params)
  }

  static getPostById(id: number) {
    return http.get<ForumPostAdminDetailVO>(`/sys/forum/posts/${id}`)
  }

  static hidePost(id: number) {
    return http.put<void>(`/sys/forum/posts/${id}/hide`)
  }

  static restorePost(id: number) {
    return http.put<void>(`/sys/forum/posts/${id}/restore`)
  }

  static deletePost(id: number) {
    return http.delete<void>(`/sys/forum/posts/${id}`)
  }

  static togglePostTop(id: number, enabled: boolean) {
    return http.put<void>(`/sys/forum/posts/${id}/top`, undefined, { params: { enabled } })
  }

  static togglePostEssence(id: number, enabled: boolean) {
    return http.put<void>(`/sys/forum/posts/${id}/essence`, undefined, { params: { enabled } })
  }
}

// ==================== 回复管理 ====================

export class ForumReplySysApi {
  static getReplies(params?: ForumReplyAdminQueryRequest) {
    return http.get<PageResult<ForumReplyAdminVO>>('/sys/forum/replies', params)
  }

  static hideReply(id: number) {
    return http.put<void>(`/sys/forum/replies/${id}/hide`)
  }

  static restoreReply(id: number) {
    return http.put<void>(`/sys/forum/replies/${id}/restore`)
  }

  static deleteReply(id: number) {
    return http.delete<void>(`/sys/forum/replies/${id}`)
  }
}
