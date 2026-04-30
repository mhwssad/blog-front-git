/**
 * 后台作者申请管理 Store
 * 基于 auth-api.md 文档 8.7 节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { AuthorApplicationSysApi } from '@/api/sys/authorApplication'
import type {
  SysAuthorApplicationAdminPageQuery,
  SysAuthorApplicationAdminVO,
  SysAuthorApplicationAdminReviewRequest,
  SysAuthorApplicationRepairRequest,
} from '@/types/api-types'

export const useAuthorApplicationStore = defineStore('admin-author-application', () => {
  const applications = ref<SysAuthorApplicationAdminVO[]>([])
  const total = ref(0)
  const current = ref(1)
  const size = ref(10)
  const loading = ref(false)
  const currentApplication = ref<SysAuthorApplicationAdminVO | null>(null)

  async function fetchApplications(
    params?: SysAuthorApplicationAdminPageQuery,
  ): Promise<void> {
    loading.value = true
    try {
      const response = await AuthorApplicationSysApi.getApplications(params)
      const data = response.data.data
      applications.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  async function fetchApplicationById(
    id: number,
  ): Promise<SysAuthorApplicationAdminVO | null> {
    try {
      const response = await AuthorApplicationSysApi.getApplicationById(id)
      currentApplication.value = response.data.data
      return currentApplication.value
    } catch {
      return null
    }
  }

  async function reviewApplication(
    id: number,
    data: SysAuthorApplicationAdminReviewRequest,
  ): Promise<boolean> {
    try {
      await AuthorApplicationSysApi.reviewApplication(id, data)
      return true
    } catch {
      return false
    }
  }

  async function repairApplication(
    id: number,
    data: SysAuthorApplicationRepairRequest,
  ): Promise<boolean> {
    try {
      await AuthorApplicationSysApi.repairApplication(id, data)
      return true
    } catch {
      return false
    }
  }

  function clearState(): void {
    applications.value = []
    total.value = 0
    current.value = 1
    loading.value = false
    currentApplication.value = null
  }

  return {
    applications,
    total,
    current,
    size,
    loading,
    currentApplication,
    fetchApplications,
    fetchApplicationById,
    reviewApplication,
    repairApplication,
    clearState,
  }
})
