/**
 * 分类管理 Store
 * 基于 content-api.md 文档 第1节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { CategoryApi } from '@/api/sys/category'
import type {
  CategoryAdminVO,
  CategorySaveRequest,
  StatusUpdateRequest,
} from '@/types/api-types'

export const useCategoryStore = defineStore('category', () => {
  // ==================== 状态 ====================

  /**
   * 分类树
   */
  const categories = ref<CategoryAdminVO[]>([])

  /**
   * 是否正在加载
   */
  const loading = ref(false)

  /**
   * 当前编辑的分类
   */
  const currentCategory = ref<CategoryAdminVO | null>(null)

  // ==================== 操作 ====================

  /**
   * 查询分类树
   */
  async function fetchCategoryTree(): Promise<void> {
    loading.value = true
    try {
      const response = await CategoryApi.getCategoryTree()
      categories.value = response.data.data
    } finally {
      loading.value = false
    }
  }

  /**
   * 查询分类详情
   */
  async function fetchCategoryById(id: number): Promise<CategoryAdminVO | null> {
    try {
      const response = await CategoryApi.getCategoryById(id)
      currentCategory.value = response.data.data
      return currentCategory.value
    } catch {
      return null
    }
  }

  /**
   * 新增分类
   */
  async function createCategory(data: CategorySaveRequest): Promise<boolean> {
    try {
      await CategoryApi.createCategory(data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 修改分类
   */
  async function updateCategory(id: number, data: CategorySaveRequest): Promise<boolean> {
    try {
      await CategoryApi.updateCategory(id, data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 修改分类状态
   */
  async function updateCategoryStatus(id: number, data: StatusUpdateRequest): Promise<boolean> {
    try {
      await CategoryApi.updateCategoryStatus(id, data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 删除分类
   */
  async function deleteCategory(id: number): Promise<boolean> {
    try {
      await CategoryApi.deleteCategory(id)
      return true
    } catch {
      return false
    }
  }

  /**
   * 清空分类列表
   */
  function clearCategories(): void {
    categories.value = []
    currentCategory.value = null
  }

  return {
    // 状态
    categories,
    loading,
    currentCategory,

    // 操作
    fetchCategoryTree,
    fetchCategoryById,
    createCategory,
    updateCategory,
    updateCategoryStatus,
    deleteCategory,
    clearCategories,
  }
})
