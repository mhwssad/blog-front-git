import { ref } from 'vue'
import { defineStore } from 'pinia'
import { UserFileApi } from '@/api/user/file'
import type {
  FileUploadInitRequest,
  FileUploadInitVO,
  FileUploadResultVO,
  PageResult,
  UserFilePageQueryRequest,
  UserFileTaskPageQueryRequest,
  UserFileTaskVO,
  UserFileVO,
} from '@/types/api-types'

export const useUserFileStore = defineStore('userFile', () => {
  const files = ref<UserFileVO[]>([])
  const uploadTasks = ref<UserFileTaskVO[]>([])
  const loading = ref(false)

  const fileTotal = ref(0)
  const fileCurrent = ref(1)
  const fileSize = ref(10)

  const taskTotal = ref(0)
  const taskCurrent = ref(1)
  const taskSize = ref(10)

  function assignFiles(data: PageResult<UserFileVO>): void {
    files.value = data.records
    fileTotal.value = data.total
    fileCurrent.value = data.current
    fileSize.value = data.size
  }

  function assignTasks(data: PageResult<UserFileTaskVO>): void {
    uploadTasks.value = data.records
    taskTotal.value = data.total
    taskCurrent.value = data.current
    taskSize.value = data.size
  }

  async function fetchFiles(params?: UserFilePageQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await UserFileApi.getMyFiles(params)
      assignFiles(response.data.data)
    } finally {
      loading.value = false
    }
  }

  async function fetchUploadTasks(params?: UserFileTaskPageQueryRequest): Promise<void> {
    try {
      const response = await UserFileApi.getMyUploadTasks(params)
      assignTasks(response.data.data)
    } catch {
      // keep existing
    }
  }

  async function initUpload(data: FileUploadInitRequest): Promise<FileUploadInitVO | null> {
    try {
      const response = await UserFileApi.initUploadTask(data)
      return response.data.data
    } catch {
      return null
    }
  }

  async function uploadFile(uploadId: string, formData: FormData): Promise<FileUploadResultVO | null> {
    try {
      const response = await UserFileApi.uploadFile(uploadId, formData)
      return response.data.data
    } catch {
      return null
    }
  }

  async function completeUpload(uploadId: string): Promise<FileUploadResultVO | null> {
    try {
      const response = await UserFileApi.completeUploadTask(uploadId)
      return response.data.data
    } catch {
      return null
    }
  }

  async function deleteFile(businessId: number): Promise<boolean> {
    try {
      await UserFileApi.deleteMyFile(businessId)
      return true
    } catch {
      return false
    }
  }

  function clearState(): void {
    files.value = []
    uploadTasks.value = []
    fileTotal.value = 0
    fileCurrent.value = 1
    taskTotal.value = 0
    taskCurrent.value = 1
  }

  return {
    files,
    uploadTasks,
    loading,
    fileTotal,
    fileCurrent,
    fileSize,
    taskTotal,
    taskCurrent,
    taskSize,
    fetchFiles,
    fetchUploadTasks,
    initUpload,
    uploadFile,
    completeUpload,
    deleteFile,
    clearState,
  }
})
