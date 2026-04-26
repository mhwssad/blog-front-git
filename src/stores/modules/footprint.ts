/**
 * 足迹管理 Store（后台管理端）
 * 基于 content-api.md 文档 第9节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { FootprintApi } from '@/api/sys/footprint'
import type { FootprintQueryRequest, FootprintVO } from '@/api/types'

export const useFootprintStore = defineStore('footprint', () => {
  // ==================== 状态 ====================

  /**
   * 足迹列表
   */
  const footprints = ref<FootprintVO[]>([])

  /**
   * 足迹总数
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
  const clearing = ref(false)

  // ==================== 操作 ====================

  /**
   * 分页查询足迹
   */
  async function fetchFootprints(params?: FootprintQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await FootprintApi.getFootprints(params)
      const data = response.data.data

      footprints.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

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

  /**
   * 清空列表
   */
  function clear(): void {
    footprints.value = []
    total.value = 0
    current.value = 1
    size.value = 10
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
  }
})
