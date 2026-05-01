import { ref } from 'vue'
import { defineStore } from 'pinia'
import { aiSysApi } from '@/api/sys/ai'
import type {
  AiChannelConfigVO,
  AiChannelConfigSaveRequest,
  AiChannelStatusRequest,
} from '@/types/api-types'

export const useAiChannelStore = defineStore('aiChannel', () => {
  const channels = ref<AiChannelConfigVO[]>([])
  const total = ref(0)
  const current = ref(1)
  const size = ref(10)
  const loading = ref(false)

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
  }

  return {
    channels,
    total,
    current,
    size,
    loading,
    fetchChannels,
    fetchChannelById,
    createChannel,
    updateChannel,
    updateChannelStatus,
    deleteChannel,
    clearChannels,
  }
})
