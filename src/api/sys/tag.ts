import { http } from '../request'
import type { TagSaveRequest, TagVO } from '../types'

export const tagApi = {
  getTags: () =>
    http.get<TagVO[]>('/sys/tags'),

  getTagById: (id: number) =>
    http.get<TagVO>(`/sys/tags/${id}`),

  createTag: (data: TagSaveRequest) =>
    http.post<void>('/sys/tags', data),

  updateTag: (id: number, data: TagSaveRequest) =>
    http.put<void>(`/sys/tags/${id}`, data),

  deleteTag: (id: number) =>
    http.delete<void>(`/sys/tags/${id}`),
}

export default tagApi
