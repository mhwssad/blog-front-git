/**
 * 举报模块类型
 * @module api-types/report
 * @see docs/api文档/report-api.md
 */

// ==================== 用户侧举报 ====================

/**
 * 后台举报查询请求
 * @description 后台分页查询举报列表
 * @interface ReportAdminQueryRequest
 * @see GET /api/sys/reports - 查询参数
 */
export interface ReportAdminQueryRequest {
  /** 页码，默认1 */
  current?: number
  /** 每页条数，默认20 */
  size?: number
  /** 举报状态：0-待处理，1-处理中，2-已处理，3-已驳回 */
  status?: number
  /** 举报对象类型：article/comment/chat_message */
  reportTargetType?: string
  /** 举报人ID */
  reporterUserId?: number
  /** 举报开始时间 */
  reportedStart?: string
  /** 举报结束时间 */
  reportedEnd?: string
}

/**
 * 创建举报请求
 * @description 用户提交举报
 * @interface ReportCreateRequest
 * @see POST /api/user/reports - 请求体
 */
export interface ReportCreateRequest {
  /** 举报对象类型：article/comment/user/chat_message */
  targetType: 'article' | 'comment' | 'user' | 'chat_message' | string
  /** 举报对象ID */
  targetId: number
  /** 举报原因编码 */
  reasonCode: string
  /** 补充说明 */
  reasonDetail?: string
}

/**
 * 举报视图对象
 * @description 用户查看自己的举报记录
 * @interface ReportVO
 * @see GET /api/user/reports - 响应项
 * @see GET /api/user/reports/{id} - 响应
 * @see POST /api/user/reports - 响应
 */
export interface ReportVO {
  /** 举报ID */
  id: number
  /** 举报对象类型 */
  targetType: string
  /** 举报对象ID */
  targetId: number
  /** 举报原因编码 */
  reasonCode: string
  /** 补充说明 */
  reasonDetail?: string | null
  /** 状态：0-待处理，1-处理中，2-已处理，3-已驳回 */
  status: number
  /** 举报时间 */
  reportedAt: string
}

// ==================== 后台举报管理 ====================

/**
 * 后台举报视图对象
 * @description 后台举报列表项/详情
 * @interface ReportAdminVO
 * @see GET /api/sys/reports - 响应项
 * @see GET /api/sys/reports/{id} - 响应
 */
export interface ReportAdminVO {
  /** 举报ID */
  id: number
  /** 举报对象类型 */
  reportTargetType: string
  /** 举报对象ID */
  reportTargetId: number
  /** 举报人ID */
  reporterUserId: number
  /** 举报人用户名 */
  reporterUsername: string
  /** 举报原因编码 */
  reasonCode: string
  /** 补充说明 */
  reasonDetail?: string | null
  /** 状态：0-待处理，1-处理中，2-已处理，3-已驳回 */
  status: number
  /** 处理人ID */
  handlerUserId?: number
  /** 处理人用户名 */
  handlerUsername?: string
  /** 处理结果类型：delete_content/revoke_message/mute_user/ban_user/record_only */
  resultType?: string
  /** 处罚类型 */
  punishmentType?: string
  /** 举报时间 */
  reportedAt: string
  /** 处理时间 */
  handledAt?: string
  /** 创建时间 */
  createdAt: string
}

/**
 * 处理举报请求
 * @description 后台执行举报处理
 * @interface ReportHandleRequest
 * @see PUT /api/sys/reports/{id}/handle - 请求体
 */
export interface ReportHandleRequest {
  /** 处理结果类型：delete_content/revoke_message/mute_user/ban_user/record_only */
  resultType:
    | 'delete_content'
    | 'revoke_message'
    | 'mute_user'
    | 'ban_user'
    | 'record_only'
    | string
  /** 处罚类型 */
  punishmentType?: string
  /** 备注 */
  remark?: string
  /** 会话ID（举报聊天消息时必填） */
  conversationId?: number
  /** 禁言范围：global=全局/lobby=大厅/topic_channel=主题频道/group=群组 */
  muteScope?: 'global' | 'lobby' | 'topic_channel' | 'group'
  /** 禁言截止时间 */
  muteUntil?: string | null
}

/**
 * 驳回举报请求
 * @description 后台驳回举报
 * @interface ReportRejectRequest
 * @see PUT /api/sys/reports/{id}/reject - 请求体
 */
export interface ReportRejectRequest {
  /** 驳回原因备注，最大512字符 */
  remark?: string
}

/**
 * 修复举报状态请求
 * @description 超级管理员修正已处理/已驳回的举报状态
 * @interface ReportRepairRequest
 * @see PUT /api/sys/reports/{id}/repair - 请求体
 */
export interface ReportRepairRequest {
  /** 目标状态：0-待审核，1-处理中，2-已处理，3-已驳回 */
  targetStatus: 0 | 1 | 2 | 3
  /** 修复备注 */
  remark?: string
}

/**
 * 举报处理日志视图对象
 * @description 举报处理历史记录
 * @interface ReportHandleLogVO
 * @see GET /api/sys/reports/{id}/logs - 响应项
 */
export interface ReportHandleLogVO {
  /** 日志ID */
  id: number
  /** 变更前状态 */
  fromStatus: number
  /** 变更后状态 */
  toStatus: number
  /** 动作类型：claim/handle/reject/override */
  actionType: string
  /** 处理结果 */
  actionResult?: string
  /** 操作人ID */
  operatorUserId: number
  /** 操作人用户名 */
  operatorUsername: string
  /** 操作备注 */
  actionRemark?: string
  /** 创建时间 */
  createdAt: string
}
