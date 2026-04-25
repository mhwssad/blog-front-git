/**
 * 用户内容行为 API
 * 基于 content-api.md 文档，提供文章/评论的交互操作（点赞、评论、收藏、足迹）
 */

import { http } from '../request'
import type {
  CollectionFolderSaveRequest,
  CollectionFolderVO,
  CollectionSaveRequest,
  CollectionVO,
  CommentSaveRequest,
  CommentVO,
  PageResult,
  UserCollectionQueryRequest,
  UserFootprintQueryRequest,
  UserFootprintVO,
} from '../types'

/**
 * 用户内容行为 API
 * 提供文章点赞、评论、收藏、文件管理、足迹等功能
 */
export class UserContentApi {
  /**
   * 点赞文章
   * POST /api/user/articles/{id}/likes
   */
  static likeArticle(id: number) {
    return http.post<void>(`/user/articles/${id}/likes`)
  }

  /**
   * 取消点赞文章
   * DELETE /api/user/articles/{id}/likes
   */
  static unlikeArticle(id: number) {
    return http.delete<void>(`/user/articles/${id}/likes`)
  }

  /**
   * 点赞评论
   * POST /api/user/comments/{id}/likes
   */
  static likeComment(id: number) {
    return http.post<void>(`/user/comments/${id}/likes`)
  }

  /**
   * 取消点赞评论
   * DELETE /api/user/comments/{id}/likes
   */
  static unlikeComment(id: number) {
    return http.delete<void>(`/user/comments/${id}/likes`)
  }

  /**
   * 发表评论
   * POST /api/user/comments
   */
  static createComment(data: CommentSaveRequest) {
    return http.post<CommentVO>('/user/comments', data)
  }

  /**
   * 删除评论
   * DELETE /api/user/comments/{id}
   */
  static deleteComment(id: number) {
    return http.delete<void>(`/user/comments/${id}`)
  }

  /**
   * 获取收藏文件夹列表
   * GET /api/user/collection-folders
   */
  static getCollectionFolders() {
    return http.get<CollectionFolderVO[]>('/user/collection-folders')
  }

  /**
   * 创建收藏文件夹
   * POST /api/user/collection-folders
   */
  static createCollectionFolder(data: CollectionFolderSaveRequest) {
    return http.post<void>('/user/collection-folders', data)
  }

  /**
   * 更新收藏文件夹
   * PUT /api/user/collection-folders/{id}
   */
  static updateCollectionFolder(id: number, data: CollectionFolderSaveRequest) {
    return http.put<void>(`/user/collection-folders/${id}`, data)
  }

  /**
   * 删除收藏文件夹
   * DELETE /api/user/collection-folders/{id}
   */
  static deleteCollectionFolder(id: number) {
    return http.delete<void>(`/user/collection-folders/${id}`)
  }

  /**
   * 分页查询我的收藏
   * GET /api/user/collections
   */
  static getCollections(params?: UserCollectionQueryRequest) {
    return http.get<PageResult<CollectionVO>>('/user/collections', params)
  }

  /**
   * 添加收藏
   * POST /api/user/collections
   */
  static createCollection(data: CollectionSaveRequest) {
    return http.post<void>('/user/collections', data)
  }

  /**
   * 取消收藏
   * DELETE /api/user/collections/{id}
   */
  static deleteCollection(id: number) {
    return http.delete<void>(`/user/collections/${id}`)
  }

  /**
   * 分页查询我的足迹
   * GET /api/user/footprints
   */
  static getFootprints(params?: UserFootprintQueryRequest) {
    return http.get<PageResult<UserFootprintVO>>('/user/footprints', params)
  }

  /**
   * 删除单条足迹
   * DELETE /api/user/footprints/{id}
   */
  static deleteFootprint(id: number) {
    return http.delete<void>(`/user/footprints/${id}`)
  }

  /**
   * 清空所有足迹
   * DELETE /api/user/footprints
   */
  static clearFootprints() {
    return http.delete<void>('/user/footprints')
  }
}

export default UserContentApi
