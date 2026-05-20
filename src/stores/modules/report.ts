/**
 * 举报管理 Store（后台管理端）
 * 基于 report-api.md 文档
 */

import { defineStore } from 'pinia'
import { ReportSysApi } from '@/api/sys/report'
import type {
  ReportAdminVO,
  ReportHandleLogVO,
  ReportHandleRequest,
  ReportRejectRequest,
  ReportRepairRequest,
} from '@/types/api-types'
import { usePaginatedState } from '../composables/usePaginatedState'

export const useReportStore = defineStore('report', () => {
  const {
    items: reports,
    total,
    current,
    size,
    loading,
    fetch: fetchReports,
    clear: clearReports,
  } = usePaginatedState<ReportAdminVO>({
    fetchFn: (params?: Record<string, unknown>) => ReportSysApi.getReports(params),
  })

  const clearState = clearReports

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
    clearState,
  }
})
