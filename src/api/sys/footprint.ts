import { http } from '../request'
import type { FootprintQueryRequest, FootprintVO, PageResult } from '../types'

export const footprintApi = {
  getFootprints: (params?: FootprintQueryRequest) =>
    http.get<PageResult<FootprintVO>>('/sys/footprints', params),

  deleteFootprint: (id: number) =>
    http.delete<void>(`/sys/footprints/${id}`),

  clearFootprints: (params?: FootprintQueryRequest) =>
    http.delete<void>('/sys/footprints', params),
}

export default footprintApi
