import { ref } from 'vue'
import { defineStore } from 'pinia'
import { categoryApi } from '@/api/sys/category'
import type {
  CategoryAdminVO,
  CategorySaveRequest,
  StatusUpdateRequest,
} from '@/api/types'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<CategoryAdminVO[]>([])
  const loading = ref(false)
  const currentCategory = ref<CategoryAdminVO | null>(null)

  async function fetchCategoryTree(): Promise<void> {
    loading.value = true
    try {
      const response = await categoryApi.getCategoryTree()
      categories.value = response.data.data
    } finally {
      loading.value = false
    }
  }

  async function fetchCategoryById(id: number): Promise<CategoryAdminVO | null> {
    try {
      const response = await categoryApi.getCategoryById(id)
      currentCategory.value = response.data.data
      return currentCategory.value
    } catch {
      return null
    }
  }

  async function createCategory(data: CategorySaveRequest): Promise<boolean> {
    try {
      await categoryApi.createCategory(data)
      return true
    } catch {
      return false
    }
  }

  async function updateCategory(id: number, data: CategorySaveRequest): Promise<boolean> {
    try {
      await categoryApi.updateCategory(id, data)
      return true
    } catch {
      return false
    }
  }

  async function updateCategoryStatus(id: number, data: StatusUpdateRequest): Promise<boolean> {
    try {
      await categoryApi.updateCategoryStatus(id, data)
      return true
    } catch {
      return false
    }
  }

  async function deleteCategory(id: number): Promise<boolean> {
    try {
      await categoryApi.deleteCategory(id)
      return true
    } catch {
      return false
    }
  }

  function clearCategories(): void {
    categories.value = []
    currentCategory.value = null
  }

  return {
    categories,
    loading,
    currentCategory,
    fetchCategoryTree,
    fetchCategoryById,
    createCategory,
    updateCategory,
    updateCategoryStatus,
    deleteCategory,
    clearCategories,
  }
})
