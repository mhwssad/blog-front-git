/**
 * 配置管理模块 API
 * 基于 auth-api.md 文档 8.4 节
 */

import { http } from '../request'
import type { ConfigQueryRequest, SysConfigAdminVO, SysConfigSaveRequest, PageResult } from '@/types/api-types'

/**
 * 配置管理 API
 * 提供系统配置的增删改查操作
 */
export class ConfigApi {
  /**
   * 5.1 分页查询配置列表
   * GET /api/sys/configs
   */
  static getConfigs(params?: ConfigQueryRequest) {
    return http.get<PageResult<SysConfigAdminVO>>('/sys/configs', params)
  }

  /**
   * 5.2 查询配置详情
   * GET /api/sys/configs/{id}
   */
  static getConfigById(id: number) {
    return http.get<SysConfigAdminVO>(`/sys/configs/${id}`)
  }

  /**
   * 5.3 新增配置
   * POST /api/sys/configs
   */
  static createConfig(data: SysConfigSaveRequest) {
    return http.post<void>('/sys/configs', data)
  }

  /**
   * 5.4 修改配置
   * PUT /api/sys/configs/{id}
   */
  static updateConfig(id: number, data: SysConfigSaveRequest) {
    return http.put<void>(`/sys/configs/${id}`, data)
  }

  /**
   * 5.5 删除配置
   * DELETE /api/sys/configs/{id}
   */
  static deleteConfig(id: number) {
    return http.delete<void>(`/sys/configs/${id}`)
  }

  /**
   * 5.6 按配置键查询配置值
   * GET /api/sys/configs/key/{configKey}
   */
  static getConfigByKey(configKey: string) {
    return http.get<string>(`/sys/configs/key/${configKey}`)
  }
}

export default ConfigApi
