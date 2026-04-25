/**
 * 用户通知中心 Store
 * 基于 auth-api.md 文档 第7节
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { UserNoticeApi, type UserNoticeQueryRequest } from '@/api/user/notice'
import type { UserNoticeVO, PageResult } from '@/api/types'

export const useUserNoticeStore = defineStore('userNotice', () => {
  // ==================== 状态 ====================

  /**
   * 我的通知列表
   */
  const myNotices = ref<UserNoticeVO[]>([])

  /**
   * 通知总数
   */
  const total = ref(0)

  /**
   * 当前页
   */
  const current = ref(1)

  /**
   * 每页数量
   */
  const size = ref(10)

  /**
   * 未读数量
   */
  const unreadCount = ref(0)

  /**
   * 是否正在加载
   */
  const loading = ref(false)

  /**
   * 当前查看的通知
   */
  const currentNotice = ref<UserNoticeVO | null>(null)

  /**
   * 是否有未读通知
   */
  const hasUnread = computed(() => unreadCount.value > 0)

  // ==================== 操作 ====================

  /**
   * 获取我的通知列表
   */
  async function fetchMyNotices(params?: UserNoticeQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await UserNoticeApi.getMyNotices(params)
      const data = response.data.data as PageResult<UserNoticeVO>

      myNotices.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取通知详情
   */
  async function fetchMyNoticeById(id: number): Promise<UserNoticeVO | null> {
    try {
      const response = await UserNoticeApi.getMyNoticeById(id)
      currentNotice.value = response.data.data
      // 获取详情后刷新未读数
      await fetchUnreadCount()
      return currentNotice.value
    } catch {
      return null
    }
  }

  /**
   * 获取未读数量
   */
  async function fetchUnreadCount(): Promise<void> {
    try {
      const response = await UserNoticeApi.getUnreadCount()
      unreadCount.value = response.data.data
    } catch {
      unreadCount.value = 0
    }
  }

  /**
   * 标记单条为已读
   */
  async function markAsRead(id: number): Promise<boolean> {
    try {
      await UserNoticeApi.markAsRead(id)
      // 更新本地状态
      const notice = myNotices.value.find(n => n.id === id)
      if (notice) {
        notice.isRead = 1
      }
      // 刷新未读数
      await fetchUnreadCount()
      return true
    } catch {
      return false
    }
  }

  /**
   * 标记全部为已读
   */
  async function markAllAsRead(): Promise<boolean> {
    try {
      await UserNoticeApi.markAllAsRead()
      // 更新本地状态
      myNotices.value.forEach(notice => {
        notice.isRead = 1
      })
      // 刷新未读数
      await fetchUnreadCount()
      return true
    } catch {
      return false
    }
  }

  /**
   * 清空列表
   */
  function clearMyNotices(): void {
    myNotices.value = []
    total.value = 0
    current.value = 1
  }

  return {
    // 状态
    myNotices,
    total,
    current,
    size,
    unreadCount,
    hasUnread,
    loading,
    currentNotice,

    // 操作
    fetchMyNotices,
    fetchMyNoticeById,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    clearMyNotices
  }
})
