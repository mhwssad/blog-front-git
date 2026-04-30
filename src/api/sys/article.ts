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
  ArticleReviewAdminDetailVO,
  ArticleReviewDecisionRequest,
  ArticleReviewRepairRequest,
  ArticleSaveRequest,
  PageResult,
  StatusUpdateRequest,
} from '@/types/api-types'

/**
 * 文章管理 API
 * 提供文章的增删改查、状态管理、审核操作
 */
export class ArticleApi {
  // ==================== 文章管理 ====================

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
   * 切换文章置顶
   * PUT /api/sys/articles/{id}/top
   */
  static toggleArticleTop(id: number) {
    return http.put<void>(`/sys/articles/${id}/top`)
  }

  /**
   * 切换文章推荐
   * PUT /api/sys/articles/{id}/recommend
   */
  static toggleArticleRecommend(id: number) {
    return http.put<void>(`/sys/articles/${id}/recommend`)
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

  // ==================== 文章审核 ====================

  /**
   * 分页查询审核文章
   * GET /api/sys/article-reviews
   */
  static getArticleReviews(params?: {
    current?: number
    size?: number
    keyword?: string
    authorId?: number
    reviewStatus?: number
  }) {
    return http.get<PageResult<ArticleAdminVO>>('/sys/article-reviews', params)
  }

  /**
   * 查询审核详情
   * GET /api/sys/article-reviews/{id}
   */
  static getArticleReviewDetail(id: number) {
    return http.get<ArticleReviewAdminDetailVO>(`/sys/article-reviews/${id}`)
  }

  /**
   * 审核通过
   * PUT /api/sys/article-reviews/{id}/approve
   */
  static approveArticleReview(id: number, data?: ArticleReviewDecisionRequest) {
    return http.put<void>(`/sys/article-reviews/${id}/approve`, data)
  }

  /**
   * 审核拒绝
   * PUT /api/sys/article-reviews/{id}/reject
   */
  static rejectArticleReview(id: number, data: ArticleReviewDecisionRequest) {
    return http.put<void>(`/sys/article-reviews/${id}/reject`, data)
  }

  /**
   * 修正审核状态
   * PUT /api/sys/article-reviews/{id}/repair-status
   */
  static repairArticleReviewStatus(id: number, data: ArticleReviewRepairRequest) {
    return http.put<void>(`/sys/article-reviews/${id}/repair-status`, data)
  }
}

export default ArticleApi
