/**
 * 互动管理 Store（后台管理端）
 * 基于 content-api.md 文档 第8节
 */

import { defineStore } from 'pinia'
import { InteractionApi } from '@/api/sys/interaction'
import type { InteractionQueryRequest, InteractionVO } from '@/types/api-types'
import { usePaginatedState } from '../composables/usePaginatedState'

export const useInteractionStore = defineStore('interaction', () => {
  // ==================== 状态 ====================

  const {
    items: interactions,
    total,
    current,
    size,
    loading,
    fetch: fetchInteractions,
    clear: clearInteractions,
  } = usePaginatedState<InteractionVO>({
    fetchFn: (params?: InteractionQueryRequest) => InteractionApi.getInteractions(params),
  })

  const clearState = clearInteractions

  // ==================== 操作 ====================

  /**
   * 删除互动
   */
  async function deleteInteraction(id: number): Promise<boolean> {
    try {
      await InteractionApi.deleteInteraction(id)
      return true
    } catch {
      return false
    }
  }

  return {
    // 状态
    interactions,
    total,
    current,
    size,
    loading,

    // 操作
    fetchInteractions,
    deleteInteraction,
    clearInteractions,
    clearState,
  }
})
