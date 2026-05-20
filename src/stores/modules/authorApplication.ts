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
import { usePaginatedState } from '../composables/usePaginatedState'

export const useAuthorApplicationStore = defineStore('admin-author-application', () => {
  const {
    items: applications,
    total,
    current,
    size,
    loading,
    fetch: fetchApplications,
    clear: clearApplications,
  } = usePaginatedState<SysAuthorApplicationAdminVO>({
    fetchFn: (params) => AuthorApplicationSysApi.getApplications(params),
  })

  const currentApplication = ref<SysAuthorApplicationAdminVO | null>(null)

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
    clearApplications()
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
