/**
 * AI 工具管理 Store（后台）
 * @see docs/api文档/ai-api.md
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { usePaginatedState } from '@/stores/composables'
import { AiSysApi } from '@/api/sys/ai'
import type {
  AiToolVO,
  AiToolSaveRequest,
  AiToolExecuteRequest,
  AiToolExecuteResultVO,
  AiToolCallLogVO,
  AiToolAuthorizationVO,
  AiToolAuthorizationSaveRequest,
} from '@/types/api-types'

export const useAiToolStore = defineStore('admin-ai-tool', () => {
  const {
    items: tools, total: toolTotal, loading,
    fetch: fetchTools, clear: clearToolsRaw,
  } = usePaginatedState<AiToolVO>({
    fetchFn: (params) => AiSysApi.getTools(params),
  })

  const currentTool = ref<AiToolVO | null>(null)

  const {
    items: callLogs, total: callLogTotal, loading: callLogLoading,
    fetch: fetchCallLogs, clear: clearCallLogsRaw,
  } = usePaginatedState<AiToolCallLogVO>({
    fetchFn: (params) => AiSysApi.getToolCallLogs(params),
  })

  const {
    items: authorizations, total: authTotal, loading: authLoading,
    fetch: fetchAuthorizations, clear: clearAuthsRaw,
  } = usePaginatedState<AiToolAuthorizationVO>({
    fetchFn: (params) => AiSysApi.getToolAuthorizations(params),
  })

  // ==================== 工具管理 ====================

  async function fetchToolById(id: number): Promise<AiToolVO | null> {
    try {
      const response = await AiSysApi.getToolById(id)
      currentTool.value = response.data.data
      return currentTool.value
    } catch {
      return null
    }
  }

  async function createTool(data: AiToolSaveRequest): Promise<boolean> {
    try {
      await AiSysApi.createTool(data)
      return true
    } catch {
      return false
    }
  }

  async function updateTool(id: number, data: AiToolSaveRequest): Promise<boolean> {
    try {
      await AiSysApi.updateTool(id, data)
      return true
    } catch {
      return false
    }
  }

  async function updateToolStatus(id: number, enabled: number): Promise<boolean> {
    try {
      await AiSysApi.updateToolStatus(id, enabled)
      return true
    } catch {
      return false
    }
  }

  async function deleteTool(id: number): Promise<boolean> {
    try {
      await AiSysApi.deleteTool(id)
      return true
    } catch {
      return false
    }
  }

  async function executeTool(id: number, data: AiToolExecuteRequest): Promise<AiToolExecuteResultVO | null> {
    try {
      const response = await AiSysApi.executeTool(id, data)
      return response.data.data
    } catch {
      return null
    }
  }

  // ==================== 工具授权 ====================

  async function createAuthorization(data: AiToolAuthorizationSaveRequest): Promise<boolean> {
    try {
      await AiSysApi.createToolAuthorization(data)
      return true
    } catch {
      return false
    }
  }

  async function updateAuthorization(id: number, data: AiToolAuthorizationSaveRequest): Promise<boolean> {
    try {
      await AiSysApi.updateToolAuthorization(id, data)
      return true
    } catch {
      return false
    }
  }

  async function deleteAuthorization(id: number): Promise<boolean> {
    try {
      await AiSysApi.deleteToolAuthorization(id)
      return true
    } catch {
      return false
    }
  }

  // ==================== 清理 ====================

  function clearState(): void {
    clearToolsRaw()
    clearCallLogsRaw()
    clearAuthsRaw()
    currentTool.value = null
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
