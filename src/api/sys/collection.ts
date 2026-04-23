import { http } from '../request'
import type {
  CollectionFolderQueryRequest,
  CollectionFolderVO,
  CollectionVO,
  PageResult,
} from '../types'

export const collectionApi = {
  getCollectionFolders: (params?: CollectionFolderQueryRequest) =>
    http.get<PageResult<CollectionFolderVO>>('/sys/collections/folders', params),

  getCollections: (params?: CollectionFolderQueryRequest) =>
    http.get<PageResult<CollectionVO>>('/sys/collections', params),

  deleteCollection: (id: number) =>
    http.delete<void>(`/sys/collections/${id}`),
}

export default collectionApi
