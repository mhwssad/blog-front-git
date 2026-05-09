/**
 * AI 工具管理 Store（后台）
 * @see docs/api文档/ai-api.md
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { aiSysApi } from '@/api/sys/ai'
import type {
  AiToolVO,
  AiToolSaveRequest,
  AiToolQueryRequest,
  AiToolExecuteRequest,
  AiToolExecuteResultVO,
  AiToolCallLogVO,
  AiToolCallLogQueryRequest,
  AiToolAuthorizationVO,
  AiToolAuthorizationSaveRequest,
  AiToolAuthorizationQueryRequest,
} from '@/types/api-types'

export const useAiToolStore = defineStore('admin-ai-tool', () => {
  const tools = ref<AiToolVO[]>([])
  const toolTotal = ref(0)
  const currentTool = ref<AiToolVO | null>(null)
  const loading = ref(false)

  const callLogs = ref<AiToolCallLogVO[]>([])
  const callLogTotal = ref(0)
  const callLogLoading = ref(false)

  const authorizations = ref<AiToolAuthorizationVO[]>([])
  const authTotal = ref(0)
  const authLoading = ref(false)

  // ==================== 工具管理 ====================

  async function fetchTools(params?: AiToolQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await aiSysApi.getTools(params)
      const data = response.data.data
      tools.value = data.records
      toolTotal.value = data.total
    } finally {
      loading.value = false
    }
  }

  async function fetchToolById(id: number): Promise<AiToolVO | null> {
    try {
      const response = await aiSysApi.getToolById(id)
      currentTool.value = response.data.data
      return currentTool.value
    } catch {
      return null
    }
  }

  async function createTool(data: AiToolSaveRequest): Promise<boolean> {
    try {
      await aiSysApi.createTool(data)
      return true
    } catch {
      return false
    }
  }

  async function updateTool(id: number, data: AiToolSaveRequest): Promise<boolean> {
    try {
      await aiSysApi.updateTool(id, data)
      return true
    } catch {
      return false
    }
  }

  async function updateToolStatus(id: number, enabled: number): Promise<boolean> {
    try {
      await aiSysApi.updateToolStatus(id, enabled)
      return true
    } catch {
      return false
    }
  }

  async function deleteTool(id: number): Promise<boolean> {
    try {
      await aiSysApi.deleteTool(id)
      return true
    } catch {
      return false
    }
  }

  async function executeTool(id: number, data: AiToolExecuteRequest): Promise<AiToolExecuteResultVO | null> {
    try {
      const response = await aiSysApi.executeTool(id, data)
      return response.data.data
    } catch {
      return null
    }
  }

  // ==================== 调用日志 ====================

  async function fetchCallLogs(params?: AiToolCallLogQueryRequest): Promise<void> {
    callLogLoading.value = true
    try {
      const response = await aiSysApi.getToolCallLogs(params)
      const data = response.data.data
      callLogs.value = data.records
      callLogTotal.value = data.total
    } finally {
      callLogLoading.value = false
    }
  }

  // ==================== 工具授权 ====================

  async function fetchAuthorizations(params?: AiToolAuthorizationQueryRequest): Promise<void> {
    authLoading.value = true
    try {
      const response = await aiSysApi.getToolAuthorizations(params)
      const data = response.data.data
      authorizations.value = data.records
      authTotal.value = data.total
    } finally {
      authLoading.value = false
    }
  }

  async function createAuthorization(data: AiToolAuthorizationSaveRequest): Promise<boolean> {
    try {
      await aiSysApi.createToolAuthorization(data)
      return true
    } catch {
      return false
    }
  }

  async function updateAuthorization(id: number, data: AiToolAuthorizationSaveRequest): Promise<boolean> {
    try {
      await aiSysApi.updateToolAuthorization(id, data)
      return true
    } catch {
      return false
    }
  }

  async function deleteAuthorization(id: number): Promise<boolean> {
    try {
      await aiSysApi.deleteToolAuthorization(id)
      return true
    } catch {
      return false
    }
  }

  // ==================== 清理 ====================

  function clearState(): void {
    tools.value = []
    toolTotal.value = 0
    currentTool.value = null
    callLogs.value = []
    callLogTotal.value = 0
    authorizations.value = []
    authTotal.value = 0
  }

  return {
    tools,
    toolTotal,
    currentTool,
    loading,
    callLogs,
    callLogTotal,
    callLogLoading,
    authorizations,
    authTotal,
    authLoading,
    fetchTools,
    fetchToolById,
    createTool,
    updateTool,
    updateToolStatus,
    deleteTool,
    executeTool,
    fetchCallLogs,
    fetchAuthorizations,
    createAuthorization,
    updateAuthorization,
    deleteAuthorization,
    clearState,
  }
})
