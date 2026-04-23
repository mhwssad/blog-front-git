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

export const articleApi = {
  getArticles: (params?: ArticleQueryRequest) =>
    http.get<PageResult<ArticleAdminVO>>('/sys/articles', params),

  getArticleById: (id: number) =>
    http.get<ArticleDetailVO>(`/sys/articles/${id}`),

  createArticle: (data: ArticleSaveRequest) =>
    http.post<void>('/sys/articles', data),

  updateArticle: (id: number, data: ArticleSaveRequest) =>
    http.put<void>(`/sys/articles/${id}`, data),

  updateArticleStatus: (id: number, data: StatusUpdateRequest) =>
    http.put<void>(`/sys/articles/${id}/status`, data),

  updateArticleAccess: (id: number, data: ArticleAccessSaveRequest) =>
    http.put<void>(`/sys/articles/${id}/access`, data),

  deleteArticle: (id: number) =>
    http.delete<void>(`/sys/articles/${id}`),
}

export default articleApi
