/**
 * 友情链接管理 Store（后台）
 * @see docs/api文档/content-api.md - 九、友情链接
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { FriendLinkSysApi } from '@/api/sys/friendLink'
import type { FriendLinkVO, FriendLinkSaveRequest, FriendLinkQueryRequest } from '@/types/api-types'
import { usePaginatedState } from '../composables/usePaginatedState'

export const useFriendLinkStore = defineStore('admin-friend-link', () => {
  const {
    items: links,
    total,
    current,
    size,
    loading,
    fetch: fetchLinks,
    clear: clearLinksBase,
  } = usePaginatedState<FriendLinkVO>({
    fetchFn: (params?: FriendLinkQueryRequest) => FriendLinkSysApi.getFriendLinks(params),
  })

  const currentLink = ref<FriendLinkVO | null>(null)

  function clearLinks(): void {
    clearLinksBase()
    currentLink.value = null
  }

  const clearState = clearLinks

  async function fetchLinkById(id: number): Promise<FriendLinkVO | null> {
    try {
      const response = await FriendLinkSysApi.getFriendLinkById(id)
      currentLink.value = response.data.data
      return currentLink.value
    } catch {
      return null
    }
  }

  async function createLink(data: FriendLinkSaveRequest): Promise<boolean> {
    try {
      await FriendLinkSysApi.createFriendLink(data)
      return true
    } catch {
      return false
    }
  }

  async function updateLink(id: number, data: FriendLinkSaveRequest): Promise<boolean> {
    try {
      await FriendLinkSysApi.updateFriendLink(id, data)
      return true
    } catch {
      return false
    }
  }

  async function updateLinkStatus(id: number, status: number): Promise<boolean> {
    try {
      await FriendLinkSysApi.updateFriendLinkStatus(id, { status })
      return true
    } catch {
      return false
    }
  }

  async function deleteLink(id: number): Promise<boolean> {
    try {
      await FriendLinkSysApi.deleteFriendLink(id)
      return true
    } catch {
      return false
    }
  }

  return {
    links,
    total,
    current,
    size,
    loading,
    currentLink,
    fetchLinks,
    fetchLinkById,
    createLink,
    updateLink,
    updateLinkStatus,
    deleteLink,
    clearLinks,
    clearState,
  }
})
