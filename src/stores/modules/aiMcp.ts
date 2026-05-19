/**
 * AI MCP 服务管理 Store（后台）
 * @see docs/api文档/ai-api.md
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { AiSysApi } from '@/api/sys/ai'
import type {
  AiMcpServerVO,
  AiMcpServerSaveRequest,
  AiMcpServerQueryRequest,
  AiMcpDiscoverResultVO,
  AiMcpToolSnapshotVO,
  AiMcpHealthVO,
} from '@/types/api-types'

export const useAiMcpStore = defineStore('admin-ai-mcp', () => {
  const servers = ref<AiMcpServerVO[]>([])
  const serverTotal = ref(0)
  const currentServer = ref<AiMcpServerVO | null>(null)
  const loading = ref(false)

  const toolSnapshots = ref<AiMcpToolSnapshotVO[]>([])
  const toolLoading = ref(false)

  // ==================== 服务管理 ====================

  async function fetchServers(params?: AiMcpServerQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await AiSysApi.getMcpServers(params)
      const data = response.data.data
      servers.value = data.records
      serverTotal.value = data.total
    } finally {
      loading.value = false
    }
  }

  async function fetchServerById(id: number): Promise<AiMcpServerVO | null> {
    try {
      const response = await AiSysApi.getMcpServerById(id)
      currentServer.value = response.data.data
      return currentServer.value
    } catch {
      return null
    }
  }

  async function createServer(data: AiMcpServerSaveRequest): Promise<boolean> {
    try {
      await AiSysApi.createMcpServer(data)
      return true
    } catch {
      return false
    }
  }

  async function updateServer(id: number, data: AiMcpServerSaveRequest): Promise<boolean> {
    try {
      await AiSysApi.updateMcpServer(id, data)
      return true
    } catch {
      return false
    }
  }

  async function updateServerStatus(id: number, enabled: number): Promise<boolean> {
    try {
      await AiSysApi.updateMcpServerStatus(id, enabled)
      return true
    } catch {
      return false
    }
  }

  async function deleteServer(id: number): Promise<boolean> {
    try {
      await AiSysApi.deleteMcpServer(id)
      return true
    } catch {
      return false
    }
  }

  // ==================== 发现与工具 ====================

  async function discoverTools(id: number): Promise<AiMcpDiscoverResultVO | null> {
    try {
      const response = await AiSysApi.discoverMcpTools(id)
      return response.data.data
    } catch {
      return null
    }
  }

  async function getServerTools(id: number): Promise<void> {
    toolLoading.value = true
    try {
      const response = await AiSysApi.getMcpServerTools(id)
      toolSnapshots.value = response.data.data ?? []
    } finally {
      toolLoading.value = false
    }
  }

  async function getServerHealth(id: number): Promise<AiMcpHealthVO | null> {
    try {
      const response = await AiSysApi.getMcpServerHealth(id)
      return response.data.data
    } catch {
      return null
    }
  }

  // ==================== 清理 ====================

  function clearState(): void {
    servers.value = []
    serverTotal.value = 0
    currentServer.value = null
    toolSnapshots.value = []
  }

  return {
    servers,
    serverTotal,
    currentServer,
    loading,
    toolSnapshots,
    toolLoading,
    fetchServers,
    fetchServerById,
    createServer,
    updateServer,
    updateServerStatus,
    deleteServer,
    discoverTools,
    getServerTools,
    getServerHealth,
    clearState,
  }
})
