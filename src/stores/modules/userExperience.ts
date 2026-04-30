/**
 * 用户等级经验 Store
 * 基于 auth-api.md 文档 7.2 节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ExperienceUserApi } from '@/api/user/experience'
import type { UserLevelInfoVO } from '@/types/api-types'

export const useUserExperienceStore = defineStore('userExperience', () => {
  const levelInfo = ref<UserLevelInfoVO | null>(null)
  const loading = ref(false)

  async function fetchLevelInfo(): Promise<void> {
    loading.value = true
    try {
      const response = await ExperienceUserApi.getLevelInfo()
      levelInfo.value = response.data.data
    } finally {
      loading.value = false
    }
  }

  function clearState(): void {
    levelInfo.value = null
    loading.value = false
  }

  return {
    levelInfo,
    loading,
    fetchLevelInfo,
    clearState,
  }
})
