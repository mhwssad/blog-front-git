import { defineStore } from 'pinia'
import { usePaginatedState } from '@/stores/composables'
import { AiSysApi } from '@/api/sys/ai'
import type {
  AiChannelConfigVO,
  AiChannelConfigSaveRequest,
  AiChannelStatusRequest,
  AiChannelAccountVO,
  AiChannelAccountSaveRequest,
} from '@/types/api-types'

export const useAiChannelStore = defineStore('aiChannel', () => {
  const {
    items: channels, total, current, size, loading,
    fetch: fetchChannels, clear: clearChannelsRaw,
  } = usePaginatedState<AiChannelConfigVO>({
    fetchFn: (params) => AiSysApi.getChannels(params),
  })

  const {
    items: accounts, total: accountTotal, loading: accountLoading,
    fetch: fetchAccountsRaw, clear: clearAccountsRaw,
  } = usePaginatedState<AiChannelAccountVO>({
    fetchFn: (params) => {
      const { channelId, ...rest } = params ?? {}
      return AiSysApi.getChannelAccounts(channelId, rest)
    },
  })

  // ==================== 渠道 CRUD ====================

  async function fetchChannelById(id: number): Promise<AiChannelConfigVO | null> {
    try {
      const response = await AiSysApi.getChannelById(id)
      return response.data.data
    } catch {
      return null
    }
  }

  async function createChannel(data: AiChannelConfigSaveRequest): Promise<boolean> {
    try {
      await AiSysApi.createChannel(data)
      return true
    } catch {
      return false
    }
  }

  async function updateChannel(id: number, data: AiChannelConfigSaveRequest): Promise<boolean> {
    try {
      await AiSysApi.updateChannel(id, data)
      return true
    } catch {
      return false
    }
  }

  async function updateChannelStatus(id: number, data: AiChannelStatusRequest): Promise<boolean> {
    try {
      await AiSysApi.updateChannelStatus(id, data)
      return true
    } catch {
      return false
    }
  }

  async function deleteChannel(id: number): Promise<boolean> {
    try {
      await AiSysApi.deleteChannel(id)
      return true
    } catch {
      return false
    }
  }

  function clearChannels(): void {
    clearChannelsRaw()
    clearAccountsRaw()
  }

  const clearState = clearChannels

  // ==================== 渠道账号池 ====================

  async function fetchChannelAccounts(channelId: number, params?: { current?: number; size?: number }): Promise<void> {
    await fetchAccountsRaw({ channelId, ...params })
  }

  async function fetchChannelAccountById(channelId: number, id: number): Promise<AiChannelAccountVO | null> {
    try {
      const response = await AiSysApi.getChannelAccountById(channelId, id)
      return response.data.data
    } catch {
      return null
    }
  }

  async function createChannelAccount(channelId: number, data: AiChannelAccountSaveRequest): Promise<boolean> {
    try {
      await AiSysApi.createChannelAccount(channelId, data)
      return true
    } catch {
      return false
    }
  }

  async function updateChannelAccount(channelId: number, id: number, data: AiChannelAccountSaveRequest): Promise<boolean> {
    try {
      await AiSysApi.updateChannelAccount(channelId, id, data)
      return true
    } catch {
      return false
    }
  }

  async function updateChannelAccountStatus(channelId: number, id: number, data: { status: number }): Promise<boolean> {
    try {
      await AiSysApi.updateChannelAccountStatus(channelId, id, data)
      return true
    } catch {
      return false
    }
  }

  async function deleteChannelAccount(channelId: number, id: number): Promise<boolean> {
    try {
      await AiSysApi.deleteChannelAccount(channelId, id)
      return true
    } catch {
      return false
    }
  }

  return {
    channels,
    total,
    current,
    size,
    loading,
    accounts,
    accountTotal,
    accountLoading,

    fetchChannels,
    fetchChannelById,
    createChannel,
    updateChannel,
    updateChannelStatus,
    deleteChannel,
    clearChannels,
    clearState,
    fetchChannelAccounts,
    fetchChannelAccountById,
    createChannelAccount,
    updateChannelAccount,
    updateChannelAccountStatus,
    deleteChannelAccount,
  }
})
