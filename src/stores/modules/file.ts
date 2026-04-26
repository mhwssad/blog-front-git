/**
 * 文件管理 Store（后台管理端）
 * 基于 file-api.md 文档
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { SysFileApi } from '@/api/sys/file'
import type {
  FileAdminPageQueryRequest,
  FileAdminVO,
  FileDetailVO,
  FileStatusUpdateRequest,
  FileTaskAdminVO,
  FileTaskPageQueryRequest,
} from '@/api/types'

export const useFileStore = defineStore('admin-file', () => {
  // ==================== 状态 ====================

  /**
   * 文件列表
   */
  const files = ref<FileAdminVO[]>([])

  /**
   * 文件总数
   */
  const fileTotal = ref(0)

  /**
   * 上传任务列表
   */
  const uploadTasks = ref<FileTaskAdminVO[]>([])

  /**
   * 上传任务总数
   */
  const taskTotal = ref(0)

  /**
   * 当前查看的文件详情
   */
  const fileDetail = ref<FileDetailVO | null>(null)

  /**
   * 列表加载状态
   */
  const loading = ref(false)

  /**
   * 详情加载状态
   */
  const detailLoading = ref(false)

  // ==================== 操作 ====================

  /**
   * 分页查询文件列表
   */
  async function fetchFiles(params?: FileAdminPageQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await SysFileApi.getFiles(params)
      const data = response.data.data

      files.value = data.records
      fileTotal.value = data.total
    } finally {
      loading.value = false
    }
  }

  /**
   * 分页查询上传任务列表
   */
  async function fetchUploadTasks(params?: FileTaskPageQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await SysFileApi.getUploadTasks(params)
      const data = response.data.data

      uploadTasks.value = data.records
      taskTotal.value = data.total
    } finally {
      loading.value = false
    }
  }

  /**
   * 查询文件详情
   */
  async function fetchFileDetail(id: number): Promise<FileDetailVO | null> {
    detailLoading.value = true
    try {
      const response = await SysFileApi.getFileById(id)
      fileDetail.value = response.data.data
      return fileDetail.value
    } finally {
      detailLoading.value = false
    }
  }

  /**
   * 更新文件状态
   */
  async function updateFileStatus(id: number, payload: FileStatusUpdateRequest): Promise<boolean> {
    try {
      await SysFileApi.updateFileStatus(id, payload)
      return true
    } catch {
      return false
    }
  }

  /**
   * 删除文件
   */
  async function deleteFile(id: number): Promise<boolean> {
    try {
      await SysFileApi.deleteFile(id)
      return true
    } catch {
      return false
    }
  }

  /**
   * 清空文件详情
   */
  function clearFileDetail(): void {
    fileDetail.value = null
  }

  return {
    // 状态
    files,
    fileTotal,
    uploadTasks,
    taskTotal,
    fileDetail,
    loading,
    detailLoading,

    // 操作
    fetchFiles,
    fetchUploadTasks,
    fetchFileDetail,
    updateFileStatus,
    deleteFile,
    clearFileDetail,
  }
})
