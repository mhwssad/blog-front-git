/**
 * 系统日志管理 Store
 * 基于 auth-api.md 文档 第8节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { LogApi } from '@/api/sys/log'
import type {
  LogQueryRequest,
  SysLogAdminVO,
  SysLogCleanRequest,
} from '@/api/types'

export const useLogStore = defineStore('log', () => {
  // ==================== 状态 ====================

  /**
   * 日志列表
   */
  const logs = ref<SysLogAdminVO[]>([])

  /**
   * 日志总数
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
   * 当前查看的日志
   */
  const currentLog = ref<SysLogAdminVO | null>(null)

  // ==================== 操作 ====================

  /**
   * 分页查询日志
   */
  async function fetchLogs(params?: LogQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await LogApi.getLogs(params)
      const data = response.data.data

      logs.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  /**
   * 查询日志详情
   */
  async function fetchLogById(id: number): Promise<SysLogAdminVO | null> {
    try {
      const response = await LogApi.getLogById(id)
      currentLog.value = response.data.data
      return currentLog.value
    } catch {
      return null
    }
  }

  /**
   * 删除日志
   */
  async function deleteLog(id: number): Promise<boolean> {
    try {
      await LogApi.deleteLog(id)
      return true
    } catch {
      return false
    }
  }

  /**
   * 按条件清理日志
   */
  async function cleanLogs(data: SysLogCleanRequest): Promise<number | null> {
    try {
      const response = await LogApi.cleanLogs(data)
      return response.data.data
    } catch {
      return null
    }
  }

  /**
   * 清空列表
   */
  function clearLogs(): void {
    logs.value = []
    total.value = 0
    current.value = 1
  }

  return {
    // 状态
    logs,
    total,
    current,
    size,
    loading,
    currentLog,

    // 操作
    fetchLogs,
    fetchLogById,
    deleteLog,
    cleanLogs,
    clearLogs
  }
})
