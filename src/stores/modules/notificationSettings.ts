/**
 * 用户通知设置 Store
 * 基于 auth-api.md 文档 7.1 节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { NotificationSettingsApi } from '@/api/user/notificationSettings'
import type {
  UserNotificationSettingBatchUpdateRequest,
  UserNotificationSettingItemVO,
  UserNotificationSettingStatusUpdateRequest,
} from '@/types/api-types'

export const useNotificationSettingsStore = defineStore('userNotificationSettings', () => {
  const settings = ref<UserNotificationSettingItemVO[]>([])
  const loading = ref(false)

  async function fetchSettings(): Promise<void> {
    loading.value = true
    try {
      const response = await NotificationSettingsApi.getSettings()
      settings.value = response.data.data
    } finally {
      loading.value = false
    }
  }

  async function batchUpdateSettings(
    data: UserNotificationSettingBatchUpdateRequest,
  ): Promise<boolean> {
    try {
      await NotificationSettingsApi.batchUpdateSettings(data)
      return true
    } catch {
      return false
    }
  }

  async function updateSettingByType(
    type: string,
    data: UserNotificationSettingStatusUpdateRequest,
  ): Promise<boolean> {
    try {
      await NotificationSettingsApi.updateSettingByType(type, data)
      return true
    } catch {
      return false
    }
  }

  function clearState(): void {
    settings.value = []
    loading.value = false
  }

  return {
    settings,
    loading,
    fetchSettings,
    batchUpdateSettings,
    updateSettingByType,
    clearState,
  }
})
