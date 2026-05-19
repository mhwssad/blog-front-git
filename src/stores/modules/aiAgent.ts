/**
 * AI Agent 管理 Store（后台）
 * @see docs/api文档/ai-api.md
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { AiSysApi } from '@/api/sys/ai'
import type {
  AiAgentDefinitionVO,
  AiAgentDefinitionSaveRequest,
  AiAgentDefinitionQueryRequest,
  AiAgentTaskVO,
  AiAgentTaskQueryRequest,
} from '@/types/api-types'

export const useAiAgentStore = defineStore('admin-ai-agent', () => {
  const definitions = ref<AiAgentDefinitionVO[]>([])
  const definitionTotal = ref(0)
  const currentDefinition = ref<AiAgentDefinitionVO | null>(null)
  const loading = ref(false)

  const tasks = ref<AiAgentTaskVO[]>([])
  const taskTotal = ref(0)
  const taskLoading = ref(false)

  // ==================== Agent 定义 ====================

  async function fetchDefinitions(params?: AiAgentDefinitionQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await AiSysApi.getAgentDefinitions(params)
      const data = response.data.data
      definitions.value = data.records
      definitionTotal.value = data.total
    } finally {
      loading.value = false
    }
  }

  async function fetchDefinitionById(id: number): Promise<AiAgentDefinitionVO | null> {
    try {
      const response = await AiSysApi.getAgentDefinitionById(id)
      currentDefinition.value = response.data.data
      return currentDefinition.value
    } catch {
      return null
    }
  }

  async function createDefinition(data: AiAgentDefinitionSaveRequest): Promise<boolean> {
    try {
      await AiSysApi.createAgentDefinition(data)
      return true
    } catch {
      return false
    }
  }

  async function updateDefinition(id: number, data: AiAgentDefinitionSaveRequest): Promise<boolean> {
    try {
      await AiSysApi.updateAgentDefinition(id, data)
      return true
    } catch {
      return false
    }
  }

  async function toggleDefinition(id: number, enabled: number): Promise<boolean> {
    try {
      await AiSysApi.toggleAgentDefinition(id, enabled)
      return true
    } catch {
      return false
    }
  }

  async function deleteDefinition(id: number): Promise<boolean> {
    try {
      await AiSysApi.deleteAgentDefinition(id)
      return true
    } catch {
      return false
    }
  }

  // ==================== Agent 任务 ====================

  async function fetchTasks(params?: AiAgentTaskQueryRequest): Promise<void> {
    taskLoading.value = true
    try {
      const response = await AiSysApi.getAgentTasks(params)
      const data = response.data.data
      tasks.value = data.records
      taskTotal.value = data.total
    } finally {
      taskLoading.value = false
    }
  }

  async function fetchTaskById(id: number): Promise<AiAgentTaskVO | null> {
    try {
      const response = await AiSysApi.getAgentTaskById(id)
      return response.data.data
    } catch {
      return null
    }
  }

  // ==================== 清理 ====================

  function clearState(): void {
    definitions.value = []
    definitionTotal.value = 0
    currentDefinition.value = null
    tasks.value = []
    taskTotal.value = 0
  }

  return {
    definitions,
    definitionTotal,
    currentDefinition,
    loading,
    tasks,
    taskTotal,
    taskLoading,
    fetchDefinitions,
    fetchDefinitionById,
    createDefinition,
    updateDefinition,
    toggleDefinition,
    deleteDefinition,
    fetchTasks,
    fetchTaskById,
    clearState,
  }
})
