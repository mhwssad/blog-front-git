/**
 * 收藏管理模块 API
 * 基于 content-api.md 文档
 */

import { http } from '../request'
import type {
  CollectionFolderQueryRequest,
  CollectionFolderVO,
  CollectionVO,
  PageResult,
} from '@/types/api-types'

/**
 * 收藏管理 API
 * 提供收藏夹和收藏内容的查询、删除操作
 */
export class CollectionApi {
  /**
   * 分页查询收藏文件夹列表
   * GET /api/sys/collections/folders
   */
  static getCollectionFolders(params?: CollectionFolderQueryRequest) {
    return http.get<PageResult<CollectionFolderVO>>('/sys/collections/folders', params)
  }

  /**
   * 分页查询收藏内容列表
   * GET /api/sys/collections
   */
  static getCollections(params?: CollectionFolderQueryRequest) {
    return http.get<PageResult<CollectionVO>>('/sys/collections', params)
  }

  /**
   * 删除收藏
   * DELETE /api/sys/collections/{id}
   */
  static deleteCollection(id: number) {
    return http.delete<void>(`/sys/collections/${id}`)
  }
}

export default CollectionApi
