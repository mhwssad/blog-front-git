/**
 * 系统通知管理 Store
 * 基于 auth-api.md 文档 第6节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { NoticeApi } from '@/api/sys/notice'
import type {
  NoticeQueryRequest,
  SysNoticeAdminVO,
  SysNoticeSaveRequest,
} from '@/types/api-types'

export const useNoticeStore = defineStore('notice', () => {
  // ==================== 状态 ====================

  /**
   * 通知列表
   */
  const notices = ref<SysNoticeAdminVO[]>([])

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
   * 是否正在加载
   */
  const loading = ref(false)

  /**
   * 当前编辑的通知
   */
  const currentNotice = ref<SysNoticeAdminVO | null>(null)

  // ==================== 操作 ====================

  /**
   * 分页查询通知
   */
  async function fetchNotices(params?: NoticeQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await NoticeApi.getNotices(params)
      const data = response.data.data

      notices.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

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

  /**
   * 清空列表
   */
  function clearNotices(): void {
    notices.value = []
    total.value = 0
    current.value = 1
  }

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
