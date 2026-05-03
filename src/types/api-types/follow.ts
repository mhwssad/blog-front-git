/**
 * 关注关系类型（用户侧 + 前台公开 + 后台管理）
 * @module api-types/follow
 * @see docs/api文档/follow-api.md
 */

// ==================== 用户侧关注 ====================

/**
 * 用户关注列表查询请求
 * @description 用户分页查询自己的关注列表
 * @interface UserFollowPageQueryRequest
 * @see GET /api/user/follows - 查询参数
 */
export interface UserFollowPageQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10，最大100 */
  size?: number
  /** true时仅返回特别关注 */
  specialOnly?: boolean
}

/**
 * 用户关注视图对象
 * @description 用户查看自己的关注列表/粉丝列表项
 * @interface UserFollowUserVO
 * @see GET /api/user/follows - 响应项
 * @see GET /api/user/fans - 响应项
 */
export interface UserFollowUserVO {
  /** 关注关系ID */
  relationId: number
  /** 被关注用户ID（关注列表）或粉丝用户ID（粉丝列表） */
  userId: number
  /** 用户名 */
  username: string
  /** 昵称 */
  nickname: string
  /** 头像 */
  avatar?: string | null
  /** 是否特别关注：0-否，1-是 */
  isSpecialFollow: number
  /** 备注 */
  remark?: string | null
  /** 是否互关：0-否，1-是 */
  mutualFollow: number
  /** 最近关注时间（关注列表）或对方关注我的时间（粉丝列表） */
  followTime: string
}

/**
 * 互关状态视图对象
 * @description 查询与目标用户的互关关系
 * @interface UserFollowMutualVO
 * @see GET /api/user/follows/mutual - 响应
 */
export interface UserFollowMutualVO {
  /** 目标用户ID */
  targetUserId: number
  /** 当前用户是否已关注目标用户 */
  following: boolean
  /** 目标用户是否已关注当前用户 */
  followedBy: boolean
  /** 是否互相关注 */
  mutualFollow: boolean
}

/**
 * 关注统计视图对象
 * @description 用户关注统计数据
 * @interface UserFollowCountVO
 * @see GET /api/user/follows/count - 响应
 */
export interface UserFollowCountVO {
  /** 关注数 */
  followingCount: number
  /** 粉丝数 */
  fanCount: number
}

/**
 * 更新特别关注请求
 * @description 设置或取消特别关注
 * @interface UserFollowSpecialUpdateRequest
 * @see PUT /api/user/follows/{userId}/special - 请求体
 */
export interface UserFollowSpecialUpdateRequest {
  /** 是否特别关注：0-取消，1-设置 */
  specialFollow: number
}

/**
 * 更新关注备注请求
 * @description 更新对被关注用户的备注
 * @interface UserFollowRemarkUpdateRequest
 * @see PUT /api/user/follows/{userId}/remark - 请求体
 */
export interface UserFollowRemarkUpdateRequest {
  /** 备注，最大256字符，传空字符串表示清空 */
  remark?: string | null
}

// ==================== 前台公开关注 ====================

/**
 * 公开关注列表查询请求
 * @description 公开查看指定用户的关注/粉丝列表
 * @interface PublicFollowPageQueryRequest
 * @see GET /api/users/{userId}/follows - 查询参数
 * @see GET /api/users/{userId}/fans - 查询参数
 */
export interface PublicFollowPageQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10，最大100 */
  size?: number
}

/**
 * 公开用户视图对象
 * @description 公开查看的用户简要信息
 * @interface PublicFollowUserVO
 * @see GET /api/users/{userId}/follows - 响应项
 * @see GET /api/users/{userId}/fans - 响应项
 */
export interface PublicFollowUserVO {
  /** 用户ID */
  userId: number
  /** 用户名 */
  username: string
  /** 昵称 */
  nickname: string
  /** 头像 */
  avatar?: string | null
  /** 关注发生时间 */
  followTime: string
}

/**
 * 公开关注用户列表视图对象
 * @description 同PublicFollowUserVO
 * @interface PublicFollowUserListVO
 * @extends PublicFollowUserVO
 */
export interface PublicFollowUserListVO extends PublicFollowUserVO {}

// ==================== 后台关注管理 ====================

/**
 * 后台关注关系查询请求
 * @description 后台分页查询关注关系
 * @interface FollowAdminQueryRequest
 * @see GET /api/sys/follows - 查询参数
 */
export interface FollowAdminQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认10，最大100 */
  size?: number
  /** 关注者用户ID */
  followerId?: number
  /** 被关注者用户ID */
  followingId?: number
  /** 关注状态：0-已取关，1-已关注 */
  followStatus?: number
  /** 是否特别关注：0-否，1-是 */
  specialFollow?: number
  /** 关注来源 */
  source?: string
  /** 匹配双方用户名或昵称 */
  keyword?: string
}

/**
 * 后台关注关系视图对象
 * @description 后台查看的完整关注关系信息
 * @interface FollowAdminRelationVO
 * @see GET /api/sys/follows - 响应项
 */
export interface FollowAdminRelationVO {
  /** 关系ID */
  relationId: number
  /** 关注者ID */
  followerId: number
  /** 关注者用户名 */
  followerUsername: string
  /** 关注者昵称 */
  followerNickname: string
  /** 关注者状态 */
  followerStatus?: number
  /** 关注者是否已删除 */
  followerDeletedFlag?: number
  /** 被关注者ID */
  followingId: number
  /** 被关注者用户名 */
  followingUsername: string
  /** 被关注者昵称 */
  followingNickname: string
  /** 被关注者状态 */
  followingStatus?: number
  /** 被关注者是否已删除 */
  followingDeletedFlag?: number
  /** 关系状态：0-已取关，1-已关注 */
  followStatus: number
  /** 是否特别关注：0-否，1-是 */
  isSpecialFollow: number
  /** 来源 */
  source?: string | null
  /** 备注 */
  remark?: string | null
  /** 最近关注时间 */
  followTime?: string | null
  /** 最近取关时间 */
  unfollowTime?: string | null
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
}

/**
 * 清理关注关系请求
 * @description 后台清理异常关注关系
 * @interface FollowRelationCleanRequest
 * @see DELETE /api/sys/follows/clean - 请求体
 */
export interface FollowRelationCleanRequest {
  /** 是否清理已取关关系 */
  cleanInactive: boolean
  /** 是否清理任一端已删除或缺失用户的关系 */
  cleanDeletedUsers: boolean
  /** 是否清理任一端已禁用用户的关系 */
  cleanDisabledUsers: boolean
}