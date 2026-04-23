import { http } from '../request'
import type { CategoryAdminVO, CategorySaveRequest, StatusUpdateRequest } from '../types'

export const categoryApi = {
  getCategoryTree: () =>
    http.get<CategoryAdminVO[]>('/sys/categories/tree'),

  getCategoryById: (id: number) =>
    http.get<CategoryAdminVO>(`/sys/categories/${id}`),

  createCategory: (data: CategorySaveRequest) =>
    http.post<void>('/sys/categories', data),

  updateCategory: (id: number, data: CategorySaveRequest) =>
    http.put<void>(`/sys/categories/${id}`, data),

  updateCategoryStatus: (id: number, data: StatusUpdateRequest) =>
    http.put<void>(`/sys/categories/${id}/status`, data),

  deleteCategory: (id: number) =>
    http.delete<void>(`/sys/categories/${id}`),
}

export default categoryApi
