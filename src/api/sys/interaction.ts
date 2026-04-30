/**
 * 互动管理模块 API
 * 基于 content-api.md 文档
 */

import { http } from '../request'
import type { InteractionQueryRequest, InteractionVO, PageResult } from '@/types/api-types'

/**
 * 互动管理 API
 * 提供用户互动行为（点赞、收藏等）的查询和删除操作
 */
export class InteractionApi {
  /**
   * 分页查询互动记录列表
   * GET /api/sys/interactions
   */
  static getInteractions(params?: InteractionQueryRequest) {
    return http.get<PageResult<InteractionVO>>('/sys/interactions', params)
  }

  /**
   * 删除互动记录
   * DELETE /api/sys/interactions/{id}
   */
  static deleteInteraction(id: number) {
    return http.delete<void>(`/sys/interactions/${id}`)
  }
}

export default InteractionApi
