/**
 * 系统通知管理 Store
 * 基于 auth-api.md 文档 第6节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { NoticeApi } from '@/api/sys/notice'
import { usePaginatedState } from '../composables/usePaginatedState'
import type {
  NoticeQueryRequest,
  SysNoticeAdminVO,
  SysNoticeSaveRequest,
} from '@/types/api-types'

export const useNoticeStore = defineStore('notice', () => {
  // ==================== 状态 ====================

  const {
    items: notices,
    total,
    current,
    size,
    loading,
    fetch: fetchNotices,
    clear: clearNotices,
  } = usePaginatedState<SysNoticeAdminVO>({
    fetchFn: (params) => NoticeApi.getNotices(params),
  })

  /**
   * 当前编辑的通知
   */
  const currentNotice = ref<SysNoticeAdminVO | null>(null)

  // ==================== 操作 ====================

  /**
   * 查询通知详情
   */
  async function fetchNoticeById(id: number): Promise<SysNoticeAdminVO | null> {
    try {
      const response = await NoticeApi.getNoticeById(id)
      currentNotice.value = response.data.data
      return currentNotice.value
    } catch {
      return null
    }
  }

  /**
   * 新增通知
   */
  async function createNotice(data: SysNoticeSaveRequest): Promise<boolean> {
    try {
      await NoticeApi.createNotice(data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 修改通知
   */
  async function updateNotice(id: number, data: SysNoticeSaveRequest): Promise<boolean> {
    try {
      await NoticeApi.updateNotice(id, data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 发布通知
   */
  async function publishNotice(id: number): Promise<boolean> {
    try {
      await NoticeApi.publishNotice(id)
      return true
    } catch {
      return false
    }
  }

  /**
   * 撤回通知
   */
  async function revokeNotice(id: number): Promise<boolean> {
    try {
      await NoticeApi.revokeNotice(id)
      return true
    } catch {
      return false
    }
  }

  /**
   * 删除通知
   */
  async function deleteNotice(id: number): Promise<boolean> {
    try {
      await NoticeApi.deleteNotice(id)
      return true
    } catch {
      return false
    }
  }

  const clearState = clearNotices

  return {
    // 状态
    notices,
    total,
    current,
    size,
    loading,
    currentNotice,

    // 操作
    fetchNotices,
    fetchNoticeById,
    createNotice,
    updateNotice,
    publishNotice,
    revokeNotice,
    deleteNotice,
    clearNotices
  }
})
