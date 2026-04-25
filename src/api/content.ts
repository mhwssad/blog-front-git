/**
 * 公开内容模块 API
 * 基于 content-api.md 文档，提供文章、分类、标签、评论的公开查询接口
 */

import { http } from './request'
import type {
  PageResult,
  PublicArticleCardVO,
  PublicArticleDetailVO,
  PublicArticleQueryRequest,
  PublicCategoryTreeVO,
  PublicCommentQueryRequest,
  PublicCommentVO,
  PublicTagQueryRequest,
  PublicTagVO,
} from './types'

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
}

export default ContentApi