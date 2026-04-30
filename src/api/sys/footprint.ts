/**
 * 足迹管理模块 API
 * 基于 content-api.md 文档
 */

import { http } from '../request'
import type { FootprintQueryRequest, FootprintVO, PageResult } from '@/types/api-types'

/**
 * 足迹管理 API
 * 提供用户足迹记录的查询、删除和清空操作
 */
export class FootprintApi {
  /**
   * 分页查询足迹列表
   * GET /api/sys/footprints
   */
  static getFootprints(params?: FootprintQueryRequest) {
    return http.get<PageResult<FootprintVO>>('/sys/footprints', params)
  }

  /**
   * 删除单条足迹
   * DELETE /api/sys/footprints/{id}
   */
  static deleteFootprint(id: number) {
    return http.delete<void>(`/sys/footprints/${id}`)
  }

  /**
   * 清空足迹记录
   * DELETE /api/sys/footprints
   */
  static clearFootprints(params?: FootprintQueryRequest) {
    return http.delete<void>('/sys/footprints', params)
  }
}

export default FootprintApi
