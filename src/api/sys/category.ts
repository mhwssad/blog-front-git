/**
 * 分类管理模块 API
 * 基于 content-api.md 文档
 */

import { http } from '../request'
import type { CategoryAdminVO, CategorySaveRequest, StatusUpdateRequest } from '@/types/api-types'

/**
 * 分类管理 API
 * 提供分类的增删改查操作
 */
export class CategoryApi {
  /**
   * 查询分类树
   * GET /api/sys/categories/tree
   */
  static getCategoryTree() {
    return http.get<CategoryAdminVO[]>('/sys/categories/tree')
  }

  /**
   * 查询分类详情
   * GET /api/sys/categories/{id}
   */
  static getCategoryById(id: number) {
    return http.get<CategoryAdminVO>(`/sys/categories/${id}`)
  }

  /**
   * 新增分类
   * POST /api/sys/categories
   */
  static createCategory(data: CategorySaveRequest) {
    return http.post<void>('/sys/categories', data)
  }

  /**
   * 修改分类
   * PUT /api/sys/categories/{id}
   */
  static updateCategory(id: number, data: CategorySaveRequest) {
    return http.put<void>(`/sys/categories/${id}`, data)
  }

  /**
   * 修改分类状态
   * PUT /api/sys/categories/{id}/status
   */
  static updateCategoryStatus(id: number, data: StatusUpdateRequest) {
    return http.put<void>(`/sys/categories/${id}/status`, data)
  }

  /**
   * 删除分类
   * DELETE /api/sys/categories/{id}
   */
  static deleteCategory(id: number) {
    return http.delete<void>(`/sys/categories/${id}`)
  }
}

export default CategoryApi
