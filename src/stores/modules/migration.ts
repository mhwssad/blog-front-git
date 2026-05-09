/**
 * 博客迁移管理 Store（后台）
 * @see docs/api文档/migration-api.md
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { MigrationApi } from '@/api/sys/migration'
import type {
  BlogMigrationTaskVO,
  BlogMigrationRecordVO,
  BlogMigrationPrecheckResultVO,
  MigrationTaskQueryRequest,
  MigrationRecordQueryRequest,
} from '@/types/api-types'

export const useMigrationStore = defineStore('admin-migration', () => {
  const tasks = ref<BlogMigrationTaskVO[]>([])
  const total = ref(0)
  const current = ref(1)
  const size = ref(10)
  const loading = ref(false)
  const currentTask = ref<BlogMigrationTaskVO | null>(null)

  const records = ref<BlogMigrationRecordVO[]>([])
  const recordTotal = ref(0)
  const recordCurrent = ref(1)
  const recordSize = ref(10)
  const recordLoading = ref(false)

  const precheckResult = ref<BlogMigrationPrecheckResultVO | null>(null)

  async function fetchTasks(params?: MigrationTaskQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await MigrationApi.getTasks(params)
      const data = response.data.data
      tasks.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  async function fetchTaskById(id: number): Promise<BlogMigrationTaskVO | null> {
    try {
      const response = await MigrationApi.getTaskDetail(id)
      currentTask.value = response.data.data
      return currentTask.value
    } catch {
      return null
    }
  }

  async function createTask(formData: FormData): Promise<BlogMigrationTaskVO | null> {
    try {
      const response = await MigrationApi.createTask(formData)
      currentTask.value = response.data.data
      return currentTask.value
    } catch {
      return null
    }
  }

  async function precheck(id: number): Promise<BlogMigrationPrecheckResultVO | null> {
    try {
      const response = await MigrationApi.precheck(id)
      precheckResult.value = response.data.data
      return precheckResult.value
    } catch {
      return null
    }
  }

  async function execute(id: number): Promise<BlogMigrationTaskVO | null> {
    try {
      const response = await MigrationApi.execute(id)
      currentTask.value = response.data.data
      return currentTask.value
    } catch {
      return null
    }
  }

  async function fetchRecords(taskId: number, params?: MigrationRecordQueryRequest): Promise<void> {
    recordLoading.value = true
    try {
      const response = await MigrationApi.getRecords(taskId, params)
      const data = response.data.data
      records.value = data.records
      recordTotal.value = data.total
      recordCurrent.value = data.current
      recordSize.value = data.size
    } finally {
      recordLoading.value = false
    }
  }

  async function exportFailures(taskId: number): Promise<Blob | null> {
    try {
      const response = await MigrationApi.exportFailures(taskId)
      return response.data as unknown as Blob
    } catch {
      return null
    }
  }

  function clearState(): void {
    tasks.value = []
    total.value = 0
    current.value = 1
    currentTask.value = null
    records.value = []
    recordTotal.value = 0
    recordCurrent.value = 1
    recordSize.value = 10
    precheckResult.value = null
  }

  return {
    tasks,
    total,
    current,
    size,
    loading,
    currentTask,
    records,
    recordTotal,
    recordCurrent,
    recordSize,
    recordLoading,
    precheckResult,
    fetchTasks,
    fetchTaskById,
    createTask,
    precheck,
    execute,
    fetchRecords,
    exportFailures,
    clearState,
  }
})
