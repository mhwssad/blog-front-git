import { ref } from 'vue'
import { defineStore } from 'pinia'
import { AiSysApi } from '@/api/sys/ai'
import type {
  AiSessionAdminVO,
  AiUsageLogVO,
  AiUsageStatsVO,
} from '@/types/api-types'

export const useAiUsageStore = defineStore('aiUsage', () => {
  // 使用日志
  const usageLogs = ref<AiUsageLogVO[]>([])
  const usageLogTotal = ref(0)
  const usageLogLoading = ref(false)

  // 统计
  const usageStats = ref<AiUsageStatsVO | null>(null)
  const statsLoading = ref(false)

  // 会话
  const sessions = ref<AiSessionAdminVO[]>([])
  const sessionTotal = ref(0)
  const sessionLoading = ref(false)

  async function fetchUsageLogs(params?: {
    userId?: number
    channelConfigId?: number
    startTime?: string
    endTime?: string
    successStatus?: number
    current?: number
    size?: number
  }): Promise<void> {
    usageLogLoading.value = true
    try {
      const response = await AiSysApi.getUsageLogs(params)
      const data = response.data.data
      usageLogs.value = data.records
      usageLogTotal.value = data.total
    } finally {
      usageLogLoading.value = false
    }
  }

  async function fetchUsageStats(params?: {
    userId?: number
    channelConfigId?: number
    startTime?: string
    endTime?: string
    successStatus?: number
  }): Promise<void> {
    statsLoading.value = true
    try {
      const response = await AiSysApi.getUsageStats(params)
      usageStats.value = response.data.data
    } finally {
      statsLoading.value = false
    }
  }

  async function fetchSessions(params?: {
    userId?: number
    status?: number
    channelConfigId?: number
    startTime?: string
    endTime?: string
    current?: number
    size?: number
  }): Promise<void> {
    sessionLoading.value = true
    try {
      const response = await AiSysApi.getSessions(params)
      const data = response.data.data
      sessions.value = data.records
      sessionTotal.value = data.total
    } finally {
      sessionLoading.value = false
    }
  }

  async function fetchSessionById(id: number): Promise<AiSessionAdminVO | null> {
    try {
      const response = await AiSysApi.getSessionById(id)
      return response.data.data
    } catch {
      return null
    }
  }

  function clearState(): void {
    usageLogs.value = []
    usageLogTotal.value = 0
    usageStats.value = null
    sessions.value = []
    sessionTotal.value = 0
  }

  return {
    usageLogs,
    usageLogTotal,
    usageLogLoading,
    usageStats,
    statsLoading,
    sessions,
    sessionTotal,
    sessionLoading,
    fetchUsageLogs,
    fetchUsageStats,
    fetchSessions,
    fetchSessionById,
    clearState,
  }
})
