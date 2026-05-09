/**
 * AI 知识库管理 Store（后台）
 * @see docs/api文档/ai-api.md
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { aiSysApi } from '@/api/sys/ai'
import type {
  AiKnowledgeSourceConfigVO,
  AiKnowledgeSourceConfigUpdateRequest,
  AiKnowledgeEntryVO,
  AiKnowledgeEntryQueryRequest,
  AiKnowledgeSyncRequest,
  AiKnowledgeSyncTaskVO,
  AiKnowledgeSyncTaskQueryRequest,
} from '@/types/api-types'

export const useAiKnowledgeStore = defineStore('admin-ai-knowledge', () => {
  const sourceConfigs = ref<AiKnowledgeSourceConfigVO[]>([])
  const sourceConfigLoading = ref(false)

  const entries = ref<AiKnowledgeEntryVO[]>([])
  const entryTotal = ref(0)
  const loading = ref(false)

  const syncTasks = ref<AiKnowledgeSyncTaskVO[]>([])
  const syncTaskTotal = ref(0)
  const syncTaskLoading = ref(false)

  // ==================== 知识源配置 ====================

  async function fetchSourceConfigs(): Promise<void> {
    sourceConfigLoading.value = true
    try {
      const response = await aiSysApi.getKnowledgeSourceConfigs()
      sourceConfigs.value = response.data.data ?? []
    } finally {
      sourceConfigLoading.value = false
    }
  }

  async function updateSourceConfig(id: number, data: AiKnowledgeSourceConfigUpdateRequest): Promise<boolean> {
    try {
      await aiSysApi.updateKnowledgeSourceConfig(id, data)
      return true
    } catch {
      return false
    }
  }

  async function toggleSourceConfig(id: number, enabled: number): Promise<boolean> {
    try {
      await aiSysApi.toggleKnowledgeSourceConfig(id, enabled)
      return true
    } catch {
      return false
    }
  }

  // ==================== 知识条目 ====================

  async function fetchEntries(params?: AiKnowledgeEntryQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await aiSysApi.getKnowledgeEntries(params)
      const data = response.data.data
      entries.value = data.records
      entryTotal.value = data.total
    } finally {
      loading.value = false
    }
  }

  async function fetchEntryById(id: number): Promise<AiKnowledgeEntryVO | null> {
    try {
      const response = await aiSysApi.getKnowledgeEntryById(id)
      return response.data.data
    } catch {
      return null
    }
  }

  async function updateEntryStatus(id: number, status: number): Promise<boolean> {
    try {
      await aiSysApi.updateKnowledgeEntryStatus(id, status)
      return true
    } catch {
      return false
    }
  }

  // ==================== 同步任务 ====================

  async function triggerSync(data: AiKnowledgeSyncRequest): Promise<boolean> {
    try {
      await aiSysApi.triggerKnowledgeSync(data)
      return true
    } catch {
      return false
    }
  }

  async function fetchSyncTasks(params?: AiKnowledgeSyncTaskQueryRequest): Promise<void> {
    syncTaskLoading.value = true
    try {
      const response = await aiSysApi.getKnowledgeSyncTasks(params)
      const data = response.data.data
      syncTasks.value = data.records
      syncTaskTotal.value = data.total
    } finally {
      syncTaskLoading.value = false
    }
  }

  async function fetchSyncTaskById(taskId: number): Promise<AiKnowledgeSyncTaskVO | null> {
    try {
      const response = await aiSysApi.getKnowledgeSyncTaskById(taskId)
      return response.data.data
    } catch {
      return null
    }
  }

  async function retrySyncTask(taskId: number): Promise<boolean> {
    try {
      await aiSysApi.retryKnowledgeSyncTask(taskId)
      return true
    } catch {
      return false
    }
  }

  // ==================== 清理 ====================

  function clearState(): void {
    sourceConfigs.value = []
    entries.value = []
    entryTotal.value = 0
    syncTasks.value = []
    syncTaskTotal.value = 0
  }

  return {
    sourceConfigs,
    sourceConfigLoading,
    entries,
    entryTotal,
    loading,
    syncTasks,
    syncTaskTotal,
    syncTaskLoading,
    fetchSourceConfigs,
    updateSourceConfig,
    toggleSourceConfig,
    fetchEntries,
    fetchEntryById,
    updateEntryStatus,
    triggerSync,
    fetchSyncTasks,
    fetchSyncTaskById,
    retrySyncTask,
    clearState,
  }
})
