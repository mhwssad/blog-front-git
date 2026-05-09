/**
 * 友情链接管理 Store（后台）
 * @see docs/api文档/content-api.md - 九、友情链接
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { FriendLinkSysApi } from '@/api/sys/friendLink'
import type { FriendLinkVO, FriendLinkSaveRequest, FriendLinkQueryRequest } from '@/types/api-types'

export const useFriendLinkStore = defineStore('admin-friend-link', () => {
  const links = ref<FriendLinkVO[]>([])
  const total = ref(0)
  const current = ref(1)
  const size = ref(10)
  const loading = ref(false)
  const currentLink = ref<FriendLinkVO | null>(null)

  async function fetchLinks(params?: FriendLinkQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await FriendLinkSysApi.getFriendLinks(params)
      const data = response.data.data
      links.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

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

  function clearLinks(): void {
    links.value = []
    total.value = 0
    current.value = 1
    currentLink.value = null
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
  }
})
