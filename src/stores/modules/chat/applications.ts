/**
 * 频道/入群申请子模块
 * @description 管理：频道创建申请、入群申请
 */

import { ref } from 'vue'
import { SysChatApi } from '@/api/sys/chat'
import type {
  GroupJoinApplicationReviewRequest,
  GroupJoinApplicationVO,
  SysChannelApplicationQueryRequest,
  SysChannelApplicationReviewRequest,
  SysChannelApplicationVO,
} from '@/types/api-types'

export function useChatApplications() {
  const channelApplications = ref<SysChannelApplicationVO[]>([])
  const channelAppTotal = ref(0)
  const channelAppDetail = ref<SysChannelApplicationVO | null>(null)
  const channelAppLoading = ref(false)

  const groupJoinApplications = ref<GroupJoinApplicationVO[]>([])
  const groupJoinAppTotal = ref(0)
  const groupJoinAppLoading = ref(false)

  async function fetchChannelApplications(
    params?: SysChannelApplicationQueryRequest,
  ): Promise<void> {
    channelAppLoading.value = true
    try {
      const response = await SysChatApi.getChannelApplications(params)
      const data = response.data.data
      channelApplications.value = data.records
      channelAppTotal.value = data.total
    } finally {
      channelAppLoading.value = false
    }
  }

  async function fetchChannelApplicationById(
    id: number,
  ): Promise<SysChannelApplicationVO | null> {
    try {
      const response = await SysChatApi.getChannelApplicationById(id)
      channelAppDetail.value = response.data.data
      return channelAppDetail.value
    } catch {
      return null
    }
  }

  async function reviewChannelApplication(
    id: number,
    data: SysChannelApplicationReviewRequest,
  ): Promise<boolean> {
    try {
      await SysChatApi.reviewChannelApplication(id, data)
      return true
    } catch {
      return false
    }
  }

  async function fetchGroupJoinApplications(params?: {
    conversationId?: number
    applyStatus?: number
    keyword?: string
    current?: number
    size?: number
  }): Promise<void> {
    groupJoinAppLoading.value = true
    try {
      const response = await SysChatApi.getGroupJoinApplications(params)
      const data = response.data.data
      groupJoinApplications.value = data.records
      groupJoinAppTotal.value = data.total
    } finally {
      groupJoinAppLoading.value = false
    }
  }

  async function reviewGroupJoinApplication(
    applicationId: number,
    data: GroupJoinApplicationReviewRequest,
  ): Promise<boolean> {
    try {
      await SysChatApi.reviewGroupJoinApplication(applicationId, data)
      return true
    } catch {
      return false
    }
  }

  return {
    channelApplications,
    channelAppTotal,
    channelAppDetail,
    channelAppLoading,
    groupJoinApplications,
    groupJoinAppTotal,
    groupJoinAppLoading,
    fetchChannelApplications,
    fetchChannelApplicationById,
    reviewChannelApplication,
    fetchGroupJoinApplications,
    reviewGroupJoinApplication,
  }
}
