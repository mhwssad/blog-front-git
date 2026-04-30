/**
 * 用户内容行为 API
 * 基于 content-api.md 文档，提供文章/评论的交互操作（点赞、评论、收藏、足迹、系列管理、审核）
 */

import { http } from '../request'
import type {
  ArticleAccessAssignRequest,
  ArticleReviewLogVO,
  ArticleReviewSubmitRequest,
  ArticleSeriesArticleRequest,
  ArticleSeriesSaveRequest,
  ArticleSeriesSortRequest,
  CollectionFolderSaveRequest,
  CollectionFolderVO,
  CollectionSaveRequest,
  CollectionVO,
  CommentSaveRequest,
  CommentVO,
  PageResult,
  PublicArticleSeriesDetailVO,
  UserArticleSeriesVO,
  UserArticleDetailVO,
  UserArticleQueryRequest,
  UserArticleVO,
  UserCollectionQueryRequest,
  UserFootprintQueryRequest,
  UserFootprintVO,
} from '@/types/api-types'

/**
 * 用户内容行为 API
 * 提供文章点赞、评论、收藏、文件管理、足迹、系列管理等功能
 */
export class UserContentApi {
  // ==================== 文章互动 ====================

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

  // ==================== 我的文章 ====================

  /**
   * 我的文章分页
   * GET /api/user/articles
   */
  static getMyArticles(params?: UserArticleQueryRequest) {
    return http.get<PageResult<UserArticleVO>>('/user/articles', params)
  }

  /**
   * 我的文章详情
   * GET /api/user/articles/{id}
   */
  static getMyArticleById(id: number) {
    return http.get<UserArticleDetailVO>(`/user/articles/${id}`)
  }

  /**
   * 配置我的文章访问名单
   * PUT /api/user/articles/{id}/access
   */
  static updateMyArticleAccess(id: number, data: ArticleAccessAssignRequest) {
    return http.put<void>(`/user/articles/${id}/access`, data)
  }

  /**
   * 提交文章审核
   * POST /api/user/articles/{id}/submit-review
   */
  static submitArticleReview(id: number, data?: ArticleReviewSubmitRequest) {
    return http.post<void>(`/user/articles/${id}/submit-review`, data)
  }

  /**
   * 查询文章审核日志
   * GET /api/user/articles/{id}/review-log
   */
  static getArticleReviewLog(id: number) {
    return http.get<ArticleReviewLogVO[]>(`/user/articles/${id}/review-log`)
  }

  // ==================== 评论 ====================

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

  // ==================== 收藏夹与收藏 ====================

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

  // ==================== 足迹 ====================

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

  // ==================== 系列管理 ====================

  /**
   * 查询我的系列列表
   * GET /api/user/article-series
   */
  static getMySeriesList() {
    return http.get<UserArticleSeriesVO[]>('/user/article-series')
  }

  /**
   * 查询我的系列详情
   * GET /api/user/article-series/{id}
   */
  static getMySeriesDetail(id: number) {
    return http.get<PublicArticleSeriesDetailVO>(`/user/article-series/${id}`)
  }

  /**
   * 创建系列
   * POST /api/user/article-series
   */
  static createSeries(data: ArticleSeriesSaveRequest) {
    return http.post<void>('/user/article-series', data)
  }

  /**
   * 修改系列
   * PUT /api/user/article-series/{id}
   */
  static updateSeries(id: number, data: ArticleSeriesSaveRequest) {
    return http.put<void>(`/user/article-series/${id}`, data)
  }

  /**
   * 删除系列
   * DELETE /api/user/article-series/{id}
   */
  static deleteSeries(id: number) {
    return http.delete<void>(`/user/article-series/${id}`)
  }

  /**
   * 向系列加入文章
   * POST /api/user/article-series/{id}/articles
   */
  static addArticleToSeries(id: number, data: ArticleSeriesArticleRequest) {
    return http.post<void>(`/user/article-series/${id}/articles`, data)
  }

  /**
   * 从系列移出文章
   * DELETE /api/user/article-series/{id}/articles/{articleId}
   */
  static removeArticleFromSeries(id: number, articleId: number) {
    return http.delete<void>(`/user/article-series/${id}/articles/${articleId}`)
  }

  /**
   * 调整系列文章顺序
   * PUT /api/user/article-series/{id}/articles/sort
   */
  static sortSeriesArticles(id: number, data: ArticleSeriesSortRequest) {
    return http.put<void>(`/user/article-series/${id}/articles/sort`, data)
  }
}

export default UserContentApi
