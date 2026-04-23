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

export const contentApi = {
  getArticles: (params?: PublicArticleQueryRequest) =>
    http.get<PageResult<PublicArticleCardVO>>('/articles', params),

  getArticleById: (id: number) => http.get<PublicArticleDetailVO>(`/articles/${id}`),

  getCategoryTree: () => http.get<PublicCategoryTreeVO[]>('/categories/tree'),

  getTags: (params?: PublicTagQueryRequest) => http.get<PublicTagVO[]>('/tags', params),

  getComments: (params?: PublicCommentQueryRequest) =>
    http.get<PageResult<PublicCommentVO>>('/comments', params),
}

export default contentApi
