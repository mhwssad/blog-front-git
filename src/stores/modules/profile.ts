/**
 * 用户个人资料 Store
 * @see docs/api文档/auth-api.md - 个人中心
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ProfileApi } from '@/api/user/profile'
import type { UserProfileVO, UserProfileUpdateRequest, PasswordChangeRequest } from '@/types/api-types'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<UserProfileVO | null>(null)
  const loading = ref(false)

  async function fetchProfile(): Promise<void> {
    loading.value = true
    try {
      const response = await ProfileApi.getProfile()
      profile.value = response.data.data
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(data: UserProfileUpdateRequest): Promise<boolean> {
    try {
      const response = await ProfileApi.updateProfile(data)
      profile.value = response.data.data
      return true
    } catch {
      return false
    }
  }

  async function changePassword(data: PasswordChangeRequest): Promise<boolean> {
    try {
      await ProfileApi.changePassword(data)
      return true
    } catch {
      return false
    }
  }

  function clearState(): void {
    profile.value = null
  }

  return {
    profile,
    loading,
    fetchProfile,
    updateProfile,
    changePassword,
    clearState,
  }
})
