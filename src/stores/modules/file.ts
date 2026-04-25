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
  PageResult,
} from '@/api/types'

export const useFileStore = defineStore('admin-file', () => {
  const files = ref<FileAdminVO[]>([])
  const fileTotal = ref(0)
  const uploadTasks = ref<FileTaskAdminVO[]>([])
  const taskTotal = ref(0)
  const fileDetail = ref<FileDetailVO | null>(null)
  const loading = ref(false)
  const detailLoading = ref(false)

  async function fetchFiles(params?: FileAdminPageQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await SysFileApi.getFiles(params)
      const data = response.data.data as PageResult<FileAdminVO>

      files.value = data.records
      fileTotal.value = data.total
    } finally {
      loading.value = false
    }
  }

  async function fetchUploadTasks(params?: FileTaskPageQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await SysFileApi.getUploadTasks(params)
      const data = response.data.data as PageResult<FileTaskAdminVO>

      uploadTasks.value = data.records
      taskTotal.value = data.total
    } finally {
      loading.value = false
    }
  }

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

  async function updateFileStatus(id: number, payload: FileStatusUpdateRequest): Promise<boolean> {
    try {
      await SysFileApi.updateFileStatus(id, payload)
      return true
    } catch {
      return false
    }
  }

  async function deleteFile(id: number): Promise<boolean> {
    try {
      await SysFileApi.deleteFile(id)
      return true
    } catch {
      return false
    }
  }

  function clearFileDetail(): void {
    fileDetail.value = null
  }

  return {
    files,
    fileTotal,
    uploadTasks,
    taskTotal,
    fileDetail,
    loading,
    detailLoading,
    fetchFiles,
    fetchUploadTasks,
    fetchFileDetail,
    updateFileStatus,
    deleteFile,
    clearFileDetail,
  }
})
