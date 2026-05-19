/**
 * 标签管理模块 API
 * 基于 content-api.md 文档
 * @see docs/api文档/content-api.md
 */

import { http } from '../request'
import type { TagSaveRequest, TagVO } from '@/types/api-types'

/**
 * 标签管理 API
 * 提供标签的增删改查操作
 */
export class TagApi {
  /**
   * 查询所有标签
   * GET /api/sys/tags
   */
  static getTags() {
    return http.get<TagVO[]>('/sys/tags')
  }

  /**
   * 查询标签详情
   * GET /api/sys/tags/{id}
   */
  static getTagById(id: number) {
    return http.get<TagVO>(`/sys/tags/${id}`)
  }

  /**
   * 新增标签
   * POST /api/sys/tags
   */
  static createTag(data: TagSaveRequest) {
    return http.post<void>('/sys/tags', data)
  }

  /**
   * 修改标签
   * PUT /api/sys/tags/{id}
   */
  static updateTag(id: number, data: TagSaveRequest) {
    return http.put<void>(`/sys/tags/${id}`, data)
  }

  /**
   * 删除标签
   * DELETE /api/sys/tags/{id}
   */
  static deleteTag(id: number) {
    return http.delete<void>(`/sys/tags/${id}`)
  }
}

export default TagApi
