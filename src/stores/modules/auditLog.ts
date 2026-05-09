/**
 * 审计日志管理 Store
 * @see docs/api文档/auth-api.md - 审计日志后台管理
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { AuditLogApi } from '@/api/sys/auditLog'
import type { AuditLogVO, AuditLogQueryRequest } from '@/types/api-types'

type LegacyAuditLogRecord = AuditLogVO & {
  operatorId?: number
  operatorName?: string
  targetType?: string
  ip?: string
  requestUrl?: string
  status?: number
  createTime?: string
  action?: string
  module?: string
  description?: string
}

function normalizeAuditLogRecord(log: LegacyAuditLogRecord | null | undefined): AuditLogVO | null {
  if (!log) {
    return null
  }

  const targetTypeMap: Record<string, string> = {
    user: '用户',
    article: '文章',
    comment: '评论',
    role: '角色',
    menu: '菜单',
    config: '配置',
    notice: '通知',
    file: '文件',
    chat: '聊天',
    report: '举报',
    authorApplication: '作者申请',
    author_application: '作者申请',
  }

  return {
    ...log,
    operatorUserId: log.operatorUserId ?? log.operatorId ?? 0,
    operatorUsername: log.operatorUsername || log.operatorName || String(log.operatorUserId ?? log.operatorId ?? '-'),
    targetUserId: log.targetUserId ?? log.targetId,
    targetUsername: log.targetUsername || '-',
    operationType: log.operationType || log.action || '-',
    operationTypeDesc: log.operationTypeDesc || log.action || log.operationType || '-',
    targetTypeName: log.targetTypeName || targetTypeMap[log.targetType ?? ''] || log.targetType || '-',
    requestIp: log.requestIp || log.ip || '-',
    remark: log.remark || log.description || '-',
    createdAt: log.createdAt || log.createTime || '',
  }
}

export const useAuditLogStore = defineStore('auditLog', () => {
  const logs = ref<AuditLogVO[]>([])
  const total = ref(0)
  const current = ref(1)
  const size = ref(10)
  const loading = ref(false)
  const currentLog = ref<AuditLogVO | null>(null)

  async function fetchLogs(params?: AuditLogQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await AuditLogApi.getAuditLogs(params)
      const data = response.data.data
      const records = Array.isArray(data.records) ? data.records : []

      logs.value = records
        .map(normalizeAuditLogRecord)
        .filter((item): item is AuditLogVO => item !== null)
      total.value = data.total ?? records.length
      current.value = data.current ?? params?.current ?? 1
      size.value = data.size ?? params?.size ?? 10
    } finally {
      loading.value = false
    }
  }

  async function fetchLogById(id: number): Promise<AuditLogVO | null> {
    try {
      const response = await AuditLogApi.getAuditLogById(id)
      currentLog.value = normalizeAuditLogRecord(response.data.data)
      return currentLog.value
    } catch {
      return null
    }
  }

  function clearLogs(): void {
    logs.value = []
    total.value = 0
    current.value = 1
    currentLog.value = null
  }

  return {
    logs,
    total,
    current,
    size,
    loading,
    currentLog,
    fetchLogs,
    fetchLogById,
    clearLogs,
  }
})
