/**
 * 后台经验体系管理 Store
 * 基于 auth-api.md 文档 8.8 节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ExperienceSysApi } from '@/api/sys/experience'
import type {
  ExperienceSourceConfigRequest,
  ExperienceSourceConfigVO,
  ExperienceLogVO,
  UserExperienceSummaryVO,
  UserLevelAdjustRequest,
} from '@/types/api-types'

export const useExperienceStore = defineStore('admin-experience', () => {
  const userSummary = ref<UserExperienceSummaryVO | null>(null)
  const logs = ref<ExperienceLogVO[]>([])
  const logTotal = ref(0)
  const logCurrent = ref(1)
  const logSize = ref(10)
  const configs = ref<ExperienceSourceConfigVO[]>([])
  const loading = ref(false)
  const summaryLoading = ref(false)
  const configLoading = ref(false)

  async function fetchUserSummary(userId: number): Promise<void> {
    summaryLoading.value = true
    try {
      const response = await ExperienceSysApi.getUserSummary(userId)
      userSummary.value = response.data.data
    } finally {
      summaryLoading.value = false
    }
  }

  async function fetchLogs(params?: {
    current?: number
    size?: number
    userId?: number
    sourceType?: string
  }): Promise<void> {
    loading.value = true
    try {
      const response = await ExperienceSysApi.getLogs(params)
      const data = response.data.data
      logs.value = data.records
      logTotal.value = data.total
      logCurrent.value = data.current
      logSize.value = data.size
    } finally {
      loading.value = false
    }
  }

  async function adjustUserLevel(
    userId: number,
    data: UserLevelAdjustRequest,
  ): Promise<boolean> {
    try {
      await ExperienceSysApi.adjustUserLevel(userId, data)
      return true
    } catch {
      return false
    }
  }

  async function fetchConfig(): Promise<void> {
    configLoading.value = true
    try {
      const response = await ExperienceSysApi.getConfig()
      configs.value = response.data.data
    } finally {
      configLoading.value = false
    }
  }

  async function updateConfig(data: ExperienceSourceConfigRequest): Promise<boolean> {
    try {
      await ExperienceSysApi.updateConfig(data)
      return true
    } catch {
      return false
    }
  }

  function clearState(): void {
    userSummary.value = null
    logs.value = []
    logTotal.value = 0
    logCurrent.value = 1
    configs.value = []
    loading.value = false
    summaryLoading.value = false
    configLoading.value = false
  }

  return {
    userSummary,
    logs,
    logTotal,
    logCurrent,
    logSize,
    configs,
    loading,
    summaryLoading,
    configLoading,
    fetchUserSummary,
    fetchLogs,
    adjustUserLevel,
    fetchConfig,
    updateConfig,
    clearState,
  }
})
