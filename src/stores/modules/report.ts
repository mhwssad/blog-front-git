/**
 * 举报管理 Store（后台管理端）
 * 基于 report-api.md 文档
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ReportSysApi } from '@/api/sys/report'
import type {
  ReportAdminVO,
  ReportHandleLogVO,
  ReportHandleRequest,
  ReportRejectRequest,
  ReportRepairRequest,
} from '@/types/api-types'

export const useReportStore = defineStore('report', () => {
  const reports = ref<ReportAdminVO[]>([])
  const total = ref(0)
  const current = ref(1)
  const size = ref(10)
  const loading = ref(false)

  async function fetchReports(params?: {
    status?: number
    reportTargetType?: string
    reporterUserId?: number
    reportedStart?: string
    reportedEnd?: string
    current?: number
    size?: number
  }): Promise<void> {
    loading.value = true
    try {
      const response = await ReportSysApi.getReports(params)
      const data = response.data.data
      reports.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  async function getReportById(id: number): Promise<ReportAdminVO | null> {
    try {
      const response = await ReportSysApi.getReportById(id)
      return response.data.data
    } catch {
      return null
    }
  }

  async function takeReport(id: number): Promise<boolean> {
    try {
      await ReportSysApi.takeReport(id)
      return true
    } catch {
      return false
    }
  }

  async function handleReport(id: number, data: ReportHandleRequest): Promise<boolean> {
    try {
      await ReportSysApi.handleReport(id, data)
      return true
    } catch {
      return false
    }
  }

  async function rejectReport(id: number, data: ReportRejectRequest): Promise<boolean> {
    try {
      await ReportSysApi.rejectReport(id, data)
      return true
    } catch {
      return false
    }
  }

  async function getReportLogs(id: number): Promise<ReportHandleLogVO[]> {
    try {
      const response = await ReportSysApi.getReportLogs(id)
      return response.data.data ?? []
    } catch {
      return []
    }
  }

  async function repairReport(id: number, data: ReportRepairRequest): Promise<boolean> {
    try {
      await ReportSysApi.repairReport(id, data)
      return true
    } catch {
      return false
    }
  }

  async function overrideReport(id: number): Promise<boolean> {
    try {
      await ReportSysApi.overrideReport(id)
      return true
    } catch {
      return false
    }
  }

  function clearReports(): void {
    reports.value = []
    total.value = 0
    current.value = 1
  }

  return {
    reports,
    total,
    current,
    size,
    loading,
    fetchReports,
    getReportById,
    takeReport,
    handleReport,
    rejectReport,
    getReportLogs,
    overrideReport,
    repairReport,
    clearReports,
  }
})
