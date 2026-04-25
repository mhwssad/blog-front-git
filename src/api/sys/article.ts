/**
 * 文章管理模块 API
 * 基于 content-api.md 文档
 */

import { http } from '../request'
import type {
  ArticleAccessSaveRequest,
  ArticleAdminVO,
  ArticleDetailVO,
  ArticleQueryRequest,
  ArticleSaveRequest,
  PageResult,
  StatusUpdateRequest,
} from '../types'

/**
 * 文章管理 API
 * 提供文章的增删改查和状态管理操作
 */
export class ArticleApi {
  /**
   * 分页查询文章列表
   * GET /api/sys/articles
   */
  static getArticles(params?: ArticleQueryRequest) {
    return http.get<PageResult<ArticleAdminVO>>('/sys/articles', params)
  }

  /**
   * 查询文章详情
   * GET /api/sys/articles/{id}
   */
  static getArticleById(id: number) {
    return http.get<ArticleDetailVO>(`/sys/articles/${id}`)
  }

  /**
   * 新增文章
   * POST /api/sys/articles
   */
  static createArticle(data: ArticleSaveRequest) {
    return http.post<void>('/sys/articles', data)
  }

  /**
   * 修改文章
   * PUT /api/sys/articles/{id}
   */
  static updateArticle(id: number, data: ArticleSaveRequest) {
    return http.put<void>(`/sys/articles/${id}`, data)
  }

  /**
   * 修改文章状态
   * PUT /api/sys/articles/{id}/status
   */
  static updateArticleStatus(id: number, data: StatusUpdateRequest) {
    return http.put<void>(`/sys/articles/${id}/status`, data)
  }

  /**
   * 修改文章访问权限
   * PUT /api/sys/articles/{id}/access
   */
  static updateArticleAccess(id: number, data: ArticleAccessSaveRequest) {
    return http.put<void>(`/sys/articles/${id}/access`, data)
  }

  /**
   * 删除文章
   * DELETE /api/sys/articles/{id}
   */
  static deleteArticle(id: number) {
    return http.delete<void>(`/sys/articles/${id}`)
  }
}

export default ArticleApi
