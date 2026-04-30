/**
 * 用户作者申请 Store
 * 基于 auth-api.md 文档第 6 节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { AuthorApplicationUserApi } from '@/api/user/authorApplication'
import type {
  PageResult,
  UserAuthorApplicationSubmitRequest,
  UserAuthorApplicationVO,
} from '@/types/api-types'

export const useUserAuthorApplicationStore = defineStore('userAuthorApplication', () => {
  const applications = ref<UserAuthorApplicationVO[]>([])
  const total = ref(0)
  const current = ref(1)
  const size = ref(10)
  const loading = ref(false)
  const latestApplication = ref<UserAuthorApplicationVO | null>(null)

  async function submitApplication(data: UserAuthorApplicationSubmitRequest): Promise<boolean> {
    try {
      await AuthorApplicationUserApi.submitApplication(data)
      return true
    } catch {
      return false
    }
  }

  async function fetchLatestApplication(): Promise<UserAuthorApplicationVO | null> {
    try {
      const response = await AuthorApplicationUserApi.getLatestApplication()
      latestApplication.value = response.data.data
      return latestApplication.value
    } catch {
      return null
    }
  }

  async function fetchApplications(params?: {
    current?: number
    size?: number
  }): Promise<void> {
    loading.value = true
    try {
      const response = await AuthorApplicationUserApi.getApplications(params)
      const data = response.data.data
      applications.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  function clearState(): void {
    applications.value = []
    total.value = 0
    current.value = 1
    loading.value = false
    latestApplication.value = null
  }

  return {
    applications,
    total,
    current,
    size,
    loading,
    latestApplication,
    submitApplication,
    fetchLatestApplication,
    fetchApplications,
    clearState,
  }
})
