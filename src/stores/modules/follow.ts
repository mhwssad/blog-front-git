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

export const useFollowStore = defineStore('follow', () => {
  // ==================== 状态 ====================

  /**
   * 关注关系列表
   */
  const relations = ref<FollowAdminRelationVO[]>([])

  /**
   * 关系总数
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

  /**
   * 是否正在清理
   */
  const cleaning = ref(false)

  // ==================== 操作 ====================

  /**
   * 分页查询关注关系
   */
  async function fetchFollows(params?: FollowAdminQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await SysFollowApi.getFollows(params)
      const data = response.data.data

      relations.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

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

  /**
   * 清空列表
   */
  function clear(): void {
    relations.value = []
    total.value = 0
    current.value = 1
    size.value = 10
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
  }
})
