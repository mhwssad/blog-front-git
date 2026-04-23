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

export const userContentApi = {
  likeArticle: (id: number) =>
    http.post<void>(`/user/articles/${id}/likes`),

  unlikeArticle: (id: number) =>
    http.delete<void>(`/user/articles/${id}/likes`),

  likeComment: (id: number) =>
    http.post<void>(`/user/comments/${id}/likes`),

  unlikeComment: (id: number) =>
    http.delete<void>(`/user/comments/${id}/likes`),

  createComment: (data: CommentSaveRequest) =>
    http.post<CommentVO>('/user/comments', data),

  deleteComment: (id: number) =>
    http.delete<void>(`/user/comments/${id}`),

  getCollectionFolders: () =>
    http.get<CollectionFolderVO[]>('/user/collection-folders'),

  createCollectionFolder: (data: CollectionFolderSaveRequest) =>
    http.post<void>('/user/collection-folders', data),

  updateCollectionFolder: (id: number, data: CollectionFolderSaveRequest) =>
    http.put<void>(`/user/collection-folders/${id}`, data),

  deleteCollectionFolder: (id: number) =>
    http.delete<void>(`/user/collection-folders/${id}`),

  getCollections: (params?: UserCollectionQueryRequest) =>
    http.get<PageResult<CollectionVO>>('/user/collections', params),

  createCollection: (data: CollectionSaveRequest) =>
    http.post<void>('/user/collections', data),

  deleteCollection: (id: number) =>
    http.delete<void>(`/user/collections/${id}`),

  getFootprints: (params?: UserFootprintQueryRequest) =>
    http.get<PageResult<UserFootprintVO>>('/user/footprints', params),

  deleteFootprint: (id: number) =>
    http.delete<void>(`/user/footprints/${id}`),

  clearFootprints: () =>
    http.delete<void>('/user/footprints'),
}

export default userContentApi
