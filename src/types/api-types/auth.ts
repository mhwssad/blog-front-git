/**
 * 认证模块类型
 * @module api-types/auth
 * @see docs/api文档/auth-api.md
 */

// ==================== 认证接口 ====================

/**
 * 认证令牌
 * @description 登录成功返回的令牌信息
 * @interface AuthenticationToken
 * @see POST /api/auth/login - 响应
 * @see POST /api/auth/register - 响应
 * @see POST /api/auth/email-login - 响应
 * @see POST /api/auth/refresh - 响应
 * @see POST /api/auth/takeover/login - 响应
 */
export interface AuthenticationToken {
  /** 固定为 Bearer */
  tokenType: string
  /** 访问令牌 */
  accessToken: string
  /** 刷新令牌 */
  refreshToken: string
  /** accessToken过期秒数 */
  expiresIn: number
}

/**
 * 登录请求
 * @description 账号密码登录
 * @interface LoginRequest
 * @see POST /api/auth/login - 请求体
 */
export interface LoginRequest {
  /** 支持用户名/邮箱/手机号 */
  username: string
  /** 登录密码 */
  password: string
}

/**
 * 邮箱验证码登录请求
 * @description 先发送验证码，再使用验证码登录
 * @interface EmailLoginRequest
 * @see POST /api/auth/email-login - 请求体
 */
export interface EmailLoginRequest {
  /** 邮箱地址 */
  email: string
  /** 6位验证码 */
  code: string
}

/**
 * 发送邮箱验证码请求
 * @description 邮箱验证码登录前先发送验证码
 * @interface SendEmailCodeRequest
 * @see POST /api/auth/email-code - 请求体
 */
export interface SendEmailCodeRequest {
  /** 邮箱地址 */
  email: string
}

/**
 * 注册请求
 * @description 用户注册
 * @interface RegisterRequest
 * @see POST /api/auth/register - 请求体
 */
export interface RegisterRequest {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 昵称，未传时默认使用用户名 */
  nickname?: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
}

/**
 * 刷新令牌请求
 * @description 刷新访问令牌
 * @interface RefreshTokenRequest
 * @see POST /api/auth/refresh - 请求体
 */
export interface RefreshTokenRequest {
  /** 刷新令牌 */
  refreshToken: string
}

// ==================== 用户信息与菜单 ====================

/**
 * 认证用户信息
 * @description 当前登录用户的基本信息、角色和权限
 * @interface AuthUserInfo
 * @see GET /api/auth/current-user - 响应
 */
export interface AuthUserInfo {
  /** 用户ID */
  id: number
  /** 用户名 */
  username: string
  /** 昵称 */
  nickname: string
  /** 头像 */
  avatar: string
  /** 邮箱 */
  email: string
  /** 手机号 */
  phone: string
  /** 状态：0-禁用，1-正常 */
  status: number
  /** 用户等级，默认1 */
  userLevel: number
  /** 当前经验值，默认0 */
  experiencePoints: number
  /** 角色编码列表 */
  roles: string[]
  /** 权限标识列表 */
  permissions: string[]
}

/**
 * 认证菜单信息
 * @description 后台动态菜单树节点
 * @interface AuthMenuInfo
 * @see GET /api/auth/current-user-menus - 响应
 */
export interface AuthMenuInfo {
  /** 菜单ID */
  id: number
  /** 父菜单ID */
  parentId: number
  /** 路由名称 */
  routeName?: string
  /** 路由路径 */
  routePath?: string
  /** 菜单名称 */
  name: string
  /** 前端组件路径 */
  component?: string | null
  /** 权限标识 */
  perm?: string | null
  /** 重定向路径 */
  redirect?: string | null
  /** 是否始终显示：0-否，1-是 */
  alwaysShow?: number
  /** 是否缓存：0-否，1-是 */
  keepAlive?: number
  /** 图标 */
  icon?: string | null
  /** 菜单类型：C-目录，M-菜单，B-按钮 */
  type: 'C' | 'M' | 'B' | string
  /** 排序 */
  sort: number
  /** 是否显示：0-隐藏，1-显示 */
  visible: number
  /** 额外路由参数 */
  params?: Record<string, string> | null
  /** 子节点 */
  children?: AuthMenuInfo[]
}