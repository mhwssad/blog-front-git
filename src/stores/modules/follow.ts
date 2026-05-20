/**
 * 关注管理 Store（后台管理端）
 * 基于 follow-api.md 文档
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { SysFollowApi } from '@/api/sys/follow'
import type {
  FollowAdminQueryRequest,
  FollowAdminRelationVO,
  FollowRelationCleanRequest,
} from '@/types/api-types'
import { usePaginatedState } from '../composables/usePaginatedState'

export const useFollowStore = defineStore('follow', () => {
  // ==================== 状态 ====================

  const {
    items: relations,
    total,
    current,
    size,
    loading,
    fetch: fetchFollows,
    clear,
  } = usePaginatedState<FollowAdminRelationVO>({
    fetchFn: (params?: FollowAdminQueryRequest) => SysFollowApi.getFollows(params),
  })

  const clearState = clear

  /**
   * 是否正在清理
   */
  const cleaning = ref(false)

  // ==================== 操作 ====================

  /**
   * 清理关注关系
   * @returns 被清理的关系数量
   */
  async function cleanFollows(payload: FollowRelationCleanRequest): Promise<number> {
    cleaning.value = true
    try {
      const response = await SysFollowApi.cleanFollows(payload)
      return Number(response.data.data ?? 0)
    } finally {
      cleaning.value = false
    }
  }

  return {
    // 状态
    relations,
    total,
    current,
    size,
    loading,
    cleaning,

    // 操作
    fetchFollows,
    cleanFollows,
    clear,
    clearState,
  }
})
