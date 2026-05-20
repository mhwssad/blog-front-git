/**
 * 系统日志管理 Store
 * 基于 auth-api.md 文档 第8节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { LogApi } from '@/api/sys/log'
import { usePaginatedState } from '../composables/usePaginatedState'
import type {
  LogQueryRequest,
  SysLogAdminVO,
  SysLogCleanRequest,
} from '@/types/api-types'

function normalizeLogRecord(log: SysLogAdminVO | null | undefined): SysLogAdminVO | null {
  if (!log) {
    return null
  }

  return {
    ...log,
    username: log.username || (log.createBy !== undefined ? String(log.createBy) : '-'),
    location: log.location || [log.province, log.city].filter(Boolean).join(' ') || '-',
    description: log.description || log.content || log.action || '-',
    requestUrl: log.requestUrl || log.requestUri || '-',
    requestUri: log.requestUri || '',
    executeTime: log.executeTime ?? log.executionTime ?? 0,
  }
}

export const useLogStore = defineStore('log', () => {
  // ==================== 状态 ====================

  const {
    items: logs,
    total,
    current,
    size,
    loading,
    fetch: fetchLogs,
    clear: clearLogs,
  } = usePaginatedState<SysLogAdminVO>({
    fetchFn: async (params) => {
      const response = await LogApi.getLogs(params)
      const data = response.data.data
      const records = Array.isArray(data.records) ? data.records : []
      response.data.data = {
        records: records.map(normalizeLogRecord).filter((item): item is SysLogAdminVO => item !== null),
        total: data.total ?? records.length,
        current: data.current ?? params?.current ?? 1,
        size: data.size ?? params?.size ?? 10,
      }
      return response
    },
  })

  /**
   * 当前查看的日志
   */
  const currentLog = ref<SysLogAdminVO | null>(null)

  // ==================== 操作 ====================

  /**
   * 查询日志详情
   */
  async function fetchLogById(id: number): Promise<SysLogAdminVO | null> {
    try {
      const response = await LogApi.getLogById(id)
      currentLog.value = normalizeLogRecord(response.data.data)
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

  const clearState = clearLogs

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
