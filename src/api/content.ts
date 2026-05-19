/**
 * 公开内容模块 API
 * 基于 content-api.md 文档，提供文章、分类、标签、评论的公开查询接口
 * @see docs/api文档/content-api.md
 */

import { http } from './request'
import type {
  PageResult,
  PublicArticleCardVO,
  PublicArticleDetailVO,
  PublicArticleQueryRequest,
  PublicArticleSeriesVO,
  PublicArticleSeriesDetailVO,
  PublicCategoryTreeVO,
  PublicChannelVO,
  PublicChannelDetailVO,
  PublicCommentQueryRequest,
  PublicCommentVO,
  PublicTagQueryRequest,
  PublicTagVO,
  ChatLobbyMessageVO,
  FriendLinkVO,
} from '@/types/api-types'

/**
 * 公开内容 API
 * 用于前台页面展示，无需登录即可访问
 */
export class ContentApi {
  /**
   * 1.1 分页查询文章列表（公开）
   * GET /api/articles
   */
  static getArticles(params?: PublicArticleQueryRequest) {
    return http.get<PageResult<PublicArticleCardVO>>('/articles', params)
  }

  /**
   * 1.2 查询文章详情（公开）
   * GET /api/articles/{id}
   */
  static getArticleById(id: number) {
    return http.get<PublicArticleDetailVO>(`/articles/${id}`)
  }

  /**
   * 2.1 查询分类树（公开）
   * GET /api/categories/tree
   */
  static getCategoryTree() {
    return http.get<PublicCategoryTreeVO[]>('/categories/tree')
  }

  /**
   * 3.1 分页查询标签列表（公开）
   * GET /api/tags
   */
  static getTags(params?: PublicTagQueryRequest) {
    return http.get<PublicTagVO[]>('/tags', params)
  }

  /**
   * 4.1 分页查询评论列表（公开）
   * GET /api/comments
   */
  static getComments(params?: PublicCommentQueryRequest) {
    return http.get<PageResult<PublicCommentVO>>('/comments', params)
  }

  /**
   * 2.2.1 查询作者系列列表（公开）
   * GET /api/public/authors/{authorId}/series
   */
  static getAuthorSeries(authorId: number) {
    return http.get<PublicArticleSeriesVO[]>(`/public/authors/${authorId}/series`)
  }

  /**
   * 2.2.1 查询公开系列详情
   * GET /api/public/article-series/{id}
   */
  static getArticleSeriesDetail(id: number) {
    return http.get<PublicArticleSeriesDetailVO>(`/public/article-series/${id}`)
  }

  /**
   * 3.1 访客查看大厅消息
   * GET /api/public/chat/lobby/messages
   */
  static getLobbyMessages(params?: { current?: number; size?: number; beforeMessageId?: number }) {
    return http.get<PageResult<ChatLobbyMessageVO>>('/public/chat/lobby/messages', params)
  }

  /**
   * 6.1 分页查询公开主题频道列表
   * GET /api/public/chat/channels
   */
  static getPublicChannels(params?: { current?: number; size?: number; categoryCode?: string }) {
    return http.get<PageResult<PublicChannelVO>>('/public/chat/channels', params)
  }

  /**
   * 6.2 查询主题频道详情
   * GET /api/public/chat/channels/{conversationId}
   */
  static getPublicChannelDetail(conversationId: number) {
    return http.get<PublicChannelDetailVO>(`/public/chat/channels/${conversationId}`)
  }

  /**
   * 代理访问文件（带文章权限校验）
   * GET /api/public/files/{fileId}
   */
  static getPublicFile(fileId: number) {
    return http.get<string>(`/public/files/${fileId}`)
  }

  /**
   * 查询启用的友情链接（公开）
   * GET /api/public/friend-links
   */
  static getFriendLinks() {
    return http.get<FriendLinkVO[]>('/public/friend-links')
  }
}

export default ContentApi