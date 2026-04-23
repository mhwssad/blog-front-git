/**
 * 配置管理模块 API
 * 基于 auth-api.md 文档 第5节
 */

import { http } from '../request'
import type {
  ConfigQueryRequest,
  SysConfigAdminVO,
  SysConfigSaveRequest,
  PageResult
} from '../types'

/**
 * 配置管理 API
 */
export const configApi = {
  /**
   * 5.1 分页查询配置
   * GET /api/sys/configs
   */
  getConfigs: (params?: ConfigQueryRequest) =>
    http.get<PageResult<SysConfigAdminVO>>('/sys/configs', params),

  /**
   * 5.2 查询配置详情
   * GET /api/sys/configs/{id}
   */
  getConfigById: (id: number) =>
    http.get<SysConfigAdminVO>(`/sys/configs/${id}`),

  /**
   * 5.3 新增配置
   * POST /api/sys/configs
   */
  createConfig: (data: SysConfigSaveRequest) =>
    http.post<void>('/sys/configs', data),

  /**
   * 5.4 修改配置
   * PUT /api/sys/configs/{id}
   */
  updateConfig: (id: number, data: SysConfigSaveRequest) =>
    http.put<void>(`/sys/configs/${id}`, data),

  /**
   * 5.5 删除配置
   * DELETE /api/sys/configs/{id}
   */
  deleteConfig: (id: number) =>
    http.delete<void>(`/sys/configs/${id}`),

  /**
   * 5.6 按配置键查询配置值
   * GET /api/sys/configs/key/{configKey}
   */
  getConfigByKey: (configKey: string) =>
    http.get<string>(`/sys/configs/key/${configKey}`)
}

export default configApi
