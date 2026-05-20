/**
 * AI Agent 管理 Store（后台）
 * @see docs/api文档/ai-api.md
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { usePaginatedState } from '@/stores/composables'
import { AiSysApi } from '@/api/sys/ai'
import type {
  AiAgentDefinitionVO,
  AiAgentDefinitionSaveRequest,
  AiAgentTaskVO,
} from '@/types/api-types'

export const useAiAgentStore = defineStore('admin-ai-agent', () => {
  const {
    items: definitions, total: definitionTotal, loading,
    fetch: fetchDefinitions, clear: clearDefinitionsRaw,
  } = usePaginatedState<AiAgentDefinitionVO>({
    fetchFn: (params) => AiSysApi.getAgentDefinitions(params),
  })

  const currentDefinition = ref<AiAgentDefinitionVO | null>(null)

  const {
    items: tasks, total: taskTotal, loading: taskLoading,
    fetch: fetchTasks, clear: clearTasksRaw,
  } = usePaginatedState<AiAgentTaskVO>({
    fetchFn: (params) => AiSysApi.getAgentTasks(params),
  })

  // ==================== Agent 定义 ====================

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
    clearDefinitionsRaw()
    clearTasksRaw()
    currentDefinition.value = null
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
