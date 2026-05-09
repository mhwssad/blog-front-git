import { ref } from 'vue'
import { defineStore } from 'pinia'
import { aiSysApi } from '@/api/sys/ai'
import type {
  AiChannelConfigVO,
  AiChannelConfigSaveRequest,
  AiChannelStatusRequest,
  AiChannelAccountVO,
  AiChannelAccountSaveRequest,
} from '@/types/api-types'

export const useAiChannelStore = defineStore('aiChannel', () => {
  const channels = ref<AiChannelConfigVO[]>([])
  const total = ref(0)
  const current = ref(1)
  const size = ref(10)
  const loading = ref(false)

  const accounts = ref<AiChannelAccountVO[]>([])
  const accountTotal = ref(0)
  const accountLoading = ref(false)

  async function fetchChannels(params?: {
    channelName?: string
    status?: number
    current?: number
    size?: number
  }): Promise<void> {
    loading.value = true
    try {
      const response = await aiSysApi.getChannels(params)
      const data = response.data.data
      channels.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  async function fetchChannelById(id: number): Promise<AiChannelConfigVO | null> {
    try {
      const response = await aiSysApi.getChannelById(id)
      return response.data.data
    } catch {
      return null
    }
  }

  async function createChannel(data: AiChannelConfigSaveRequest): Promise<boolean> {
    try {
      await aiSysApi.createChannel(data)
      return true
    } catch {
      return false
    }
  }

  async function updateChannel(id: number, data: AiChannelConfigSaveRequest): Promise<boolean> {
    try {
      await aiSysApi.updateChannel(id, data)
      return true
    } catch {
      return false
    }
  }

  async function updateChannelStatus(id: number, data: AiChannelStatusRequest): Promise<boolean> {
    try {
      await aiSysApi.updateChannelStatus(id, data)
      return true
    } catch {
      return false
    }
  }

  async function deleteChannel(id: number): Promise<boolean> {
    try {
      await aiSysApi.deleteChannel(id)
      return true
    } catch {
      return false
    }
  }

  function clearChannels(): void {
    channels.value = []
    total.value = 0
    current.value = 1
    accounts.value = []
    accountTotal.value = 0
  }

  // ==================== 渠道账号池 ====================

  async function fetchChannelAccounts(channelId: number, params?: { current?: number; size?: number }): Promise<void> {
    accountLoading.value = true
    try {
      const response = await aiSysApi.getChannelAccounts(channelId, params)
      const data = response.data.data
      accounts.value = data.records
      accountTotal.value = data.total
    } finally {
      accountLoading.value = false
    }
  }

  async function fetchChannelAccountById(channelId: number, id: number): Promise<AiChannelAccountVO | null> {
    try {
      const response = await aiSysApi.getChannelAccountById(channelId, id)
      return response.data.data
    } catch {
      return null
    }
  }

  async function createChannelAccount(channelId: number, data: AiChannelAccountSaveRequest): Promise<boolean> {
    try {
      await aiSysApi.createChannelAccount(channelId, data)
      return true
    } catch {
      return false
    }
  }

  async function updateChannelAccount(channelId: number, id: number, data: AiChannelAccountSaveRequest): Promise<boolean> {
    try {
      await aiSysApi.updateChannelAccount(channelId, id, data)
      return true
    } catch {
      return false
    }
  }

  async function updateChannelAccountStatus(channelId: number, id: number, data: { status: number }): Promise<boolean> {
    try {
      await aiSysApi.updateChannelAccountStatus(channelId, id, data)
      return true
    } catch {
      return false
    }
  }

  async function deleteChannelAccount(channelId: number, id: number): Promise<boolean> {
    try {
      await aiSysApi.deleteChannelAccount(channelId, id)
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
    fetchChannelAccounts,
    fetchChannelAccountById,
    createChannelAccount,
    updateChannelAccount,
    updateChannelAccountStatus,
    deleteChannelAccount,
  }
})
