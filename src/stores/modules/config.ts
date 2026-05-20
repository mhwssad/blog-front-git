/**
 * 系统配置管理 Store
 * 基于 auth-api.md 文档 第5节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ConfigApi } from '@/api/sys/config'
import type {
  ConfigQueryRequest,
  SysConfigAdminVO,
  SysConfigSaveRequest,
} from '@/types/api-types'
import { usePaginatedState } from '../composables/usePaginatedState'

export const useConfigStore = defineStore('config', () => {
  // ==================== 状态 ====================

  const {
    items: configs,
    total,
    current,
    size,
    loading,
    fetch: fetchConfigs,
    clear: clearConfigs,
  } = usePaginatedState<SysConfigAdminVO>({
    fetchFn: (params) => ConfigApi.getConfigs(params),
  })

  /**
   * 当前编辑的配置
   */
  const currentConfig = ref<SysConfigAdminVO | null>(null)

  /**
   * 配置缓存（按 key 存储）
   */
  const configCache = ref<Map<string, string>>(new Map())

  // ==================== 操作 ====================

  /**
   * 查询配置详情
   */
  async function fetchConfigById(id: number): Promise<SysConfigAdminVO | null> {
    try {
      const response = await ConfigApi.getConfigById(id)
      currentConfig.value = response.data.data
      return currentConfig.value
    } catch {
      return null
    }
  }

  /**
   * 新增配置
   */
  async function createConfig(data: SysConfigSaveRequest): Promise<boolean> {
    try {
      await ConfigApi.createConfig(data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 修改配置
   */
  async function updateConfig(id: number, data: SysConfigSaveRequest): Promise<boolean> {
    try {
      await ConfigApi.updateConfig(id, data)
      return true
    } catch {
      return false
    }
  }

  /**
   * 删除配置
   */
  async function deleteConfig(id: number): Promise<boolean> {
    try {
      await ConfigApi.deleteConfig(id)
      return true
    } catch {
      return false
    }
  }

  /**
   * 按配置键查询配置值
   */
  async function fetchConfigByKey(configKey: string): Promise<string | null> {
    // 先从缓存读取
    if (configCache.value.has(configKey)) {
      return configCache.value.get(configKey) || null
    }

    try {
      const response = await ConfigApi.getConfigByKey(configKey)
      const value = response.data.data
      // 更新缓存
      configCache.value.set(configKey, value)
      return value
    } catch {
      return null
    }
  }

  /**
   * 从缓存获取配置值
   */
  function getConfigValue(configKey: string): string | null {
    return configCache.value.get(configKey) || null
  }

  /**
   * 设置配置缓存
   */
  function setConfigValue(configKey: string, value: string): void {
    configCache.value.set(configKey, value)
  }

  /**
   * 批量预加载配置
   */
  async function preloadConfigs(configKeys: string[]): Promise<void> {
    for (const key of configKeys) {
      await fetchConfigByKey(key)
    }
  }

  /**
   * 清空配置缓存
   */
  function clearConfigCache(): void {
    configCache.value.clear()
  }

  const clearState = clearConfigs

  return {
    // 状态
    configs,
    total,
    current,
    size,
    loading,
    currentConfig,

    // 操作
    fetchConfigs,
    fetchConfigById,
    createConfig,
    updateConfig,
    deleteConfig,
    fetchConfigByKey,
    getConfigValue,
    setConfigValue,
    preloadConfigs,
    clearConfigCache,
    clearConfigs,
    clearState,
  }
})
