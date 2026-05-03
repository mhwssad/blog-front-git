/**
 * 配置管理类型
 * @module api-types/config
 * @see docs/api文档/auth-api.md
 */

// ==================== 后台配置管理 ====================

/**
 * 配置查询请求
 * @description 后台分页查询系统配置
 * @interface ConfigQueryRequest
 * @see GET /api/sys/configs - 查询参数
 */
export interface ConfigQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10 */
  size?: number
  /** 配置名称 */
  configName?: string
  /** 配置键 */
  configKey?: string
  /** 创建开始时间，格式yyyy-MM-dd HH:mm:ss */
  createTimeStart?: string
  /** 创建结束时间，格式yyyy-MM-dd HH:mm:ss */
  createTimeEnd?: string
}

/**
 * 后台系统配置视图对象
 * @description 后台配置完整信息
 * @interface SysConfigAdminVO
 * @see GET /api/sys/configs - 响应项
 * @see GET /api/sys/configs/{id} - 响应
 * @see GET /api/sys/configs/key/{configKey} - 响应
 */
export interface SysConfigAdminVO {
  /** 配置ID */
  id: number
  /** 配置名称 */
  configName: string
  /** 配置键 */
  configKey: string
  /** 配置值 */
  configValue: string
  /** 是否系统内置：0-否，1-是 */
  isSystem: number
  /** 备注 */
  remark?: string
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime?: string
}

/**
 * 保存配置请求
 * @description 创建或更新系统配置
 * @interface SysConfigSaveRequest
 * @see POST /api/sys/configs - 请求体
 * @see PUT /api/sys/configs/{id} - 请求体
 */
export interface SysConfigSaveRequest {
  /** 配置名称 */
  configName: string
  /** 配置键 */
  configKey: string
  /** 配置值 */
  configValue: string
  /** 备注 */
  remark?: string
}