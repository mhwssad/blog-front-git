/**
 * 超管操作 Store
 * 基于 auth-api.md 文档第 10 节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { AdminApi } from '@/api/sys/admin'
import type {
  AccountTakeoverRequest,
  AccountTakeoverResponse,
  AdjustExperienceRequest,
  AdjustLevelRequest,
  BanUserRequest,
  MfaVerifyRequest,
  MfaVerifyResponse,
  UserRoleAuditAssignRequest,
} from '@/types/api-types'

export const useAdminOpsStore = defineStore('admin-ops', () => {
  const mfaTicket = ref<string | null>(null)
  const mfaExpiresAt = ref<number | null>(null)
  const loading = ref(false)

  async function sendMfaCode(): Promise<boolean> {
    loading.value = true
    try {
      await AdminApi.sendMfaCode()
      return true
    } catch {
      return false
    } finally {
      loading.value = false
    }
  }

  async function verifyMfa(data: MfaVerifyRequest): Promise<MfaVerifyResponse | null> {
    loading.value = true
    try {
      const response = await AdminApi.verifyMfa(data)
      const result = response.data.data
      mfaTicket.value = result.ticket
      mfaExpiresAt.value = Date.now() + result.expiresIn * 1000
      return result
    } catch {
      return null
    } finally {
      loading.value = false
    }
  }

  async function banUser(id: number, data: BanUserRequest): Promise<boolean> {
    try {
      await AdminApi.banUser(id, data)
      return true
    } catch {
      return false
    }
  }

  async function unbanUser(id: number, data: BanUserRequest): Promise<boolean> {
    try {
      await AdminApi.unbanUser(id, data)
      return true
    } catch {
      return false
    }
  }

  async function adjustUserLevel(id: number, data: AdjustLevelRequest): Promise<boolean> {
    try {
      await AdminApi.adjustUserLevel(id, data)
      return true
    } catch {
      return false
    }
  }

  async function adjustUserExperience(
    id: number,
    data: AdjustExperienceRequest,
  ): Promise<boolean> {
    try {
      await AdminApi.adjustUserExperience(id, data)
      return true
    } catch {
      return false
    }
  }

  async function takeoverAccount(
    data: AccountTakeoverRequest,
  ): Promise<AccountTakeoverResponse | null> {
    try {
      const response = await AdminApi.takeoverAccount(data)
      return response.data.data
    } catch {
      return null
    }
  }

  async function assignRolesWithAudit(
    id: number,
    data: UserRoleAuditAssignRequest,
  ): Promise<boolean> {
    try {
      await AdminApi.assignRolesWithAudit(id, data)
      return true
    } catch {
      return false
    }
  }

  function clearState(): void {
    mfaTicket.value = null
    mfaExpiresAt.value = null
    loading.value = false
  }

  return {
    mfaTicket,
    mfaExpiresAt,
    loading,
    sendMfaCode,
    verifyMfa,
    banUser,
    unbanUser,
    adjustUserLevel,
    adjustUserExperience,
    takeoverAccount,
    assignRolesWithAudit,
    clearState,
  }
})
