/**
 * 禁言管理子模块
 * @description 管理：禁言记录的增删查
 */

import { ref } from 'vue'
import { SysChatApi } from '@/api/sys/chat'
import type {
  ChatMuteCreateRequest,
  ChatMuteVO,
  ChatMuteQueryRequest,
} from '@/types/api-types'

export function useChatMutes() {
  const mutes = ref<ChatMuteVO[]>([])
  const muteTotal = ref(0)
  const muteLoading = ref(false)

  async function createMute(data: ChatMuteCreateRequest): Promise<boolean> {
    try {
      await SysChatApi.createMute(data)
      return true
    } catch {
      return false
    }
  }

  async function fetchMutes(params?: ChatMuteQueryRequest): Promise<void> {
    muteLoading.value = true
    try {
      const response = await SysChatApi.getMutes(params)
      const data = response.data.data
      mutes.value = data.records
      muteTotal.value = data.total
    } finally {
      muteLoading.value = false
    }
  }

  async function releaseMute(id: number): Promise<boolean> {
    try {
      await SysChatApi.releaseMute(id)
      return true
    } catch {
      return false
    }
  }

  return {
    mutes,
    muteTotal,
    muteLoading,
    createMute,
    fetchMutes,
    releaseMute,
  }
}
