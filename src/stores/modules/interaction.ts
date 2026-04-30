/**
 * 互动管理 Store（后台管理端）
 * 基于 content-api.md 文档 第8节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { InteractionApi } from '@/api/sys/interaction'
import type { InteractionQueryRequest, InteractionVO } from '@/types/api-types'

export const useInteractionStore = defineStore('interaction', () => {
  // ==================== 状态 ====================

  /**
   * 互动列表
   */
  const interactions = ref<InteractionVO[]>([])

  /**
   * 互动总数
   */
  const total = ref(0)

  /**
   * 当前页
   */
  const current = ref(1)

  /**
   * 每页数量
   */
  const size = ref(10)

  /**
   * 是否正在加载
   */
  const loading = ref(false)

  // ==================== 操作 ====================

  /**
   * 分页查询互动
   */
  async function fetchInteractions(params?: InteractionQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await InteractionApi.getInteractions(params)
      const data = response.data.data

      interactions.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

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

  /**
   * 清空列表
   */
  function clearInteractions(): void {
    interactions.value = []
    total.value = 0
    current.value = 1
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
  }
})
