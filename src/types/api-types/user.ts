/**
 * 系统用户管理 + 用户等级经验 + 2FA + 经验来源配置 类型
 * @module api-types/user
 * @see docs/api文档/auth-api.md
 */

// ==================== 系统用户管理 ====================

/**
 * 用户查询请求
 * @description 后台分页查询用户列表
 * @interface UserQueryRequest
 * @see GET /api/sys/users - 查询参数
 */
export interface UserQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10 */
  size?: number
  /** 用户名 */
  username?: string
  /** 昵称 */
  nickname?: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
  /** 状态 */
  status?: number
}

/**
 * 后台用户视图对象
 * @description 后台用户完整信息
 * @interface SysUserAdminVO
 * @see GET /api/sys/users - 响应项
 * @see GET /api/sys/users/{id} - 响应
 */
export interface SysUserAdminVO {
  /** 用户ID */
  id: number
  /** 用户名 */
  username: string
  /** 昵称 */
  nickname: string
  /** 邮箱 */
  email: string
  /** 手机号 */
  phone: string
  /** 头像 */
  avatar: string
  /** 性别 */
  gender?: number
  /** 生日 */
  birthday?: string
  /** 状态：0-禁用，1-正常 */
  status: number
  /** 用户等级 */
  userLevel: number
  /** 经验值 */
  experiencePoints: number
  /** 最近一次等级变更时间 */
  levelUpdatedAt?: string
  /** 最后登录时间 */
  lastLoginTime?: string
  /** 最后登录IP */
  lastLoginIp?: string
  /** 备注 */
  remark?: string
  /** 角色ID列表 */
  roleIds?: number[]
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime?: string
}

/**
 * 保存用户请求
 * @description 创建或更新用户
 * @interface SysUserSaveRequest
 * @see POST /api/sys/users - 请求体
 * @see PUT /api/sys/users/{id} - 请求体
 */
export interface SysUserSaveRequest {
  /** 用户名 */
  username: string
  /** 密码，新增时必填 */
  password?: string
  /** 昵称 */
  nickname?: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
  /** 头像 */
  avatar?: string
  /** 性别 */
  gender?: number
  /** 生日 */
  birthday?: string
  /** 状态：0-禁用，1-正常，默认1 */
  status?: number
  /** 备注 */
  remark?: string
}

/**
 * 更新状态请求
 * @description 修改用户状态
 * @interface StatusUpdateRequest
 * @see PUT /api/sys/users/{id}/status - 请求体
 */
export interface StatusUpdateRequest {
  /** 状态：0-禁用，1-正常 */
  status: number
}

/**
 * 重置密码请求
 * @description 后台重置用户密码
 * @interface PasswordResetRequest
 * @see PUT /api/sys/users/{id}/password/reset - 请求体
 */
export interface PasswordResetRequest {
  /** 新密码 */
  password: string
}

/**
 * 分配用户角色请求
 * @description 为用户分配角色
 * @interface UserRoleAssignRequest
 * @see PUT /api/sys/users/{id}/roles - 请求体
 */
export interface UserRoleAssignRequest {
  /** 角色ID列表 */
  roleIds: number[]
}

// ==================== 用户等级与经验 ====================

/**
 * 用户等级信息视图对象
 * @description 用户当前等级详细信息
 * @interface UserLevelInfoVO
 * @see GET /api/user/experience/level - 响应
 */
export interface UserLevelInfoVO {
  /** 当前等级 */
  level: number
  /** 当前经验值 */
  currentExperience: number
  /** 下一级所需经验值 */
  nextLevelExperience: number
  /** 等级称号 */
  levelTitle: string
  /** 升级进度，0.0~1.0 */
  progress: number
  /** 今日经验获取上限 */
  dailyExperienceLimit: number
  /** 今日已获取经验 */
  dailyExperienceUsed: number
  /** 今日剩余可获取经验 */
  dailyExperienceRemaining: number
}

/**
 * 用户经验汇总视图对象
 * @description 后台查看用户经验来源汇总
 * @interface UserExperienceSummaryVO
 * @see GET /api/sys/experience/users/{userId}/summary - 响应
 */
export interface UserExperienceSummaryVO {
  /** 用户ID */
  userId: number
  /** 用户名 */
  username: string
  /** 昵称 */
  nickname: string
  /** 当前等级 */
  level: number
  /** 当前经验值 */
  currentExperience: number
  /** 下一级所需经验值 */
  nextLevelExperience: number
  /** 今日各来源经验汇总 */
  dailySummary: Record<string, unknown>
}

/**
 * 经验日志视图对象
 * @description 经验流水记录
 * @interface ExperienceLogVO
 * @see GET /api/sys/experience/logs - 响应项
 */
export interface ExperienceLogVO {
  /** 日志ID */
  id: number
  /** 用户ID */
  userId: number
  /** 来源类型 */
  sourceType: string
  /** 来源类型标签 */
  sourceTypeLabel: string
  /** 经验变化量 */
  experienceChange: number
  /** 变化前经验值 */
  experienceBefore: number
  /** 变化后经验值 */
  experienceAfter: number
  /** 变化前等级 */
  levelBefore: number
  /** 变化后等级 */
  levelAfter: number
  /** 描述 */
  description: string
  /** 创建时间 */
  createdAt: string
}

/**
 * 调整用户等级或经验请求
 * @description 超级管理员手动调整用户等级或经验
 * @interface UserLevelAdjustRequest
 * @see POST /api/sys/experience/users/{userId}/adjust - 请求体
 */
export interface UserLevelAdjustRequest {
  /** 调整类型：level或experience */
  adjustType: 'level' | 'experience'
  /** 新的等级值或经验值 */
  newValue: number
  /** 调整原因 */
  reason?: string
}

// ==================== 2FA 相关 ====================

/**
 * 2FA验证请求
 * @description 校验2FA验证码
 * @interface MfaVerifyRequest
 * @see POST /api/admin/2fa/verify - 请求体
 */
export interface MfaVerifyRequest {
  /** 6位验证码 */
  code: string
}

/**
 * 2FA验证响应
 * @description 2FA验证成功返回的票据
 * @interface MfaVerifyResponse
 * @see POST /api/admin/2fa/verify - 响应
 */
export interface MfaVerifyResponse {
  /** 2FA票据，用于后续敏感操作，有效期默认30分钟 */
  ticket: string
  /** 票据有效期秒数 */
  expiresIn: number
}

/**
 * 封禁/解封用户请求
 * @description 超级管理员封禁或解封用户
 * @interface BanUserRequest
 * @see POST /api/admin/users/{id}/ban - 请求体
 * @see POST /api/admin/users/{id}/unban - 请求体
 */
export interface BanUserRequest {
  /** 2FA校验通过的票据 */
  mfaTicket: string
  /** 封禁原因 */
  banReason?: string
  /** 解封原因 */
  unbanReason?: string
}

/**
 * 调整用户等级请求
 * @description 超级管理员调整用户等级
 * @interface AdjustLevelRequest
 * @see PUT /api/admin/users/{id}/level - 请求体
 */
export interface AdjustLevelRequest {
  /** 目标等级 */
  level: number
  /** 2FA校验通过的票据 */
  mfaTicket: string
}

/**
 * 调整用户经验请求
 * @description 超级管理员调整用户经验
 * @interface AdjustExperienceRequest
 * @see PUT /api/admin/users/{id}/experience - 请求体
 */
export interface AdjustExperienceRequest {
  /** 目标经验值 */
  experience: number
  /** 2FA校验通过的票据 */
  mfaTicket: string
}

/**
 * 账号接管请求
 * @description 超级管理员请求接管目标用户身份
 * @interface AccountTakeoverRequest
 * @see POST /api/admin/takeover - 请求体
 */
export interface AccountTakeoverRequest {
  /** 目标用户ID */
  targetUserId: number
  /** 2FA校验通过的票据 */
  mfaTicket: string
}

/**
 * 账号接管响应
 * @description 账号接管成功返回的令牌
 * @interface AccountTakeoverResponse
 * @see POST /api/admin/takeover - 响应
 */
export interface AccountTakeoverResponse {
  /** 接管令牌，一次性使用 */
  takeoverToken: string
  /** 接管令牌有效期秒数 */
  expiresIn: number
}

/**
 * 接管令牌登录请求
 * @description 使用接管令牌登录为目标用户身份
 * @interface TakeoverLoginRequest
 * @see POST /api/auth/takeover/login - 请求体
 */
export interface TakeoverLoginRequest {
  /** 接管令牌 */
  takeoverToken: string
}

/**
 * 带审计的角色分配请求
 * @description 超级管理员带审计地分配用户角色
 * @interface UserRoleAuditAssignRequest
 * @see PUT /api/admin/users/{id}/roles - 请求体
 */
export interface UserRoleAuditAssignRequest {
  /** 角色ID列表 */
  roleIds: number[]
  /** 2FA校验通过的票据 */
  mfaTicket: string
}

// ==================== 经验来源配置 ====================

/**
 * 经验来源配置视图对象
 * @description 经验来源配置项
 * @interface ExperienceSourceConfigVO
 * @see GET /api/sys/experience/config - 响应
 */
export interface ExperienceSourceConfigVO {
  /** 配置键 */
  configKey: string
  /** 配置值 */
  configValue: string
}

/**
 * 保存经验来源配置请求
 * @description 更新经验来源配置
 * @interface ExperienceSourceConfigRequest
 * @see PUT /api/sys/experience/config - 请求体
 */
export interface ExperienceSourceConfigRequest {
  /** 配置键 */
  configKey: string
  /** 配置值 */
  configValue: string
}