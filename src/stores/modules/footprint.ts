/**
 * 足迹管理 Store（后台管理端）
 * 基于 content-api.md 文档 第9节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { FootprintApi } from '@/api/sys/footprint'
import type { FootprintQueryRequest, FootprintVO } from '@/types/api-types'
import { usePaginatedState } from '../composables/usePaginatedState'

export const useFootprintStore = defineStore('footprint', () => {
  // ==================== 状态 ====================

  const {
    items: footprints,
    total,
    current,
    size,
    loading,
    fetch: fetchFootprints,
    clear,
  } = usePaginatedState<FootprintVO>({
    fetchFn: (params?: FootprintQueryRequest) => FootprintApi.getFootprints(params),
  })

  const clearState = clear

  /**
   * 是否正在清理
   */
  const clearing = ref(false)

  // ==================== 操作 ====================

  /**
   * 删除单条足迹
   */
  async function deleteFootprint(id: number): Promise<boolean> {
    try {
      await FootprintApi.deleteFootprint(id)
      return true
    } catch {
      return false
    }
  }

  /**
   * 清空足迹
   */
  async function clearFootprints(params?: FootprintQueryRequest): Promise<boolean> {
    clearing.value = true
    try {
      await FootprintApi.clearFootprints(params)
      return true
    } catch {
      return false
    } finally {
      clearing.value = false
    }
  }

  return {
    // 状态
    footprints,
    total,
    current,
    size,
    loading,
    clearing,

    // 操作
    fetchFootprints,
    deleteFootprint,
    clearFootprints,
    clear,
    clearState,
  }
})
