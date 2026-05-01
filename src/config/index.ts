/**
 * 应用配置文件
 * 用于管理应用的各类配置项
 */

/**
 * API 配置
 */
export const apiConfig = {
  // API 基础 URL，从环境变量读取
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',

  // 请求超时时间（毫秒）
  timeout: 15000,

  // 是否启用请求日志
  enableRequestLog: import.meta.env.DEV,

  // 是否启用错误提示
  enableErrorMessage: true
}

/**
 * 应用配置
 */
export const appConfig = {
  name: 'Blog Front',
  version: '1.0.0',
}

/**
 * 日志配置
 */
export const loggerConfig = {
  level: import.meta.env.VITE_LOG_LEVEL || (import.meta.env.DEV ? 'debug' : 'warn'),
  bufferSize: Number.parseInt(import.meta.env.VITE_LOG_BUFFER_SIZE || '200', 10),
  enablePersistence: import.meta.env.VITE_ENABLE_LOG_PERSISTENCE === 'true'
}

/**
 * 认证配置
 */
export const authConfig = {
  // Token 存储的 key
  tokenKey: 'access_token',

  // Refresh Token 存储的 key
  refreshTokenKey: 'refresh_token',

  // Token 过期前多久刷新（毫秒）
  refreshBeforeExpire: 5 * 60 * 1000 // 5分钟
}

/**
 * 文件上传配置
 */
export const uploadConfig = {
  // 上传文件大小限制（字节）
  maxSize: 10 * 1024 * 1024, // 10MB

  // 允许的文件类型
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}

/**
 * 分页配置
 */
export const paginationConfig = {
  // 默认每页条数
  defaultPageSize: 10,

  // 每页条数选项
  pageSizes: [10, 20, 50, 100, 200],

  // 显示的页码按钮数量
  pagerCount: 7
}

/**
 * 表格配置
 */
export const tableConfig = {
  // 是否默认显示边框
  border: false,

  // 是否默认显示斑马纹
  stripe: true,

  // 表格大小
  size: 'default' as const, // large | default | small

  // 是否高亮当前行
  highlightCurrentRow: true
}

/**
 * 导出所有配置
 */
export default {
  api: apiConfig,
  app: appConfig,
  logger: loggerConfig,
  auth: authConfig,
  upload: uploadConfig,
  pagination: paginationConfig,
  table: tableConfig
}
