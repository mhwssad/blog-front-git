/**
 * 后台数据看板 API
 * 基于 dashboard-api.md 文档
 */

import { http } from '../request'
import type {
  DashboardQueryRequest,
  DashboardOverviewVO,
  DashboardContentVO,
  DashboardCommunityVO,
  DashboardAiVO,
  DashboardGovernanceVO,
} from '@/types/api-types'

export class DashboardApi {
  /**
   * 核心概览
   * GET /api/sys/dashboard/overview
   */
  static getOverview(params?: DashboardQueryRequest) {
    return http.get<DashboardOverviewVO>('/sys/dashboard/overview', params)
  }

  /**
   * 内容统计
   * GET /api/sys/dashboard/content
   */
  static getContent(params?: DashboardQueryRequest) {
    return http.get<DashboardContentVO>('/sys/dashboard/content', params)
  }

  /**
   * 社区统计
   * GET /api/sys/dashboard/community
   */
  static getCommunity(params?: DashboardQueryRequest) {
    return http.get<DashboardCommunityVO>('/sys/dashboard/community', params)
  }

  /**
   * AI 调用统计
   * GET /api/sys/dashboard/ai
   */
  static getAi(params?: DashboardQueryRequest) {
    return http.get<DashboardAiVO>('/sys/dashboard/ai', params)
  }

  /**
   * 治理统计
   * GET /api/sys/dashboard/governance
   */
  static getGovernance(params?: DashboardQueryRequest) {
    return http.get<DashboardGovernanceVO>('/sys/dashboard/governance', params)
  }

  /**
   * 导出运营看板统计 Excel
   * GET /api/sys/dashboard/export
   * @param params 查询参数
   * @returns Excel 文件流
   */
  static exportExcel(params?: DashboardQueryRequest) {
    return http.get<string>('/sys/dashboard/export', params, {
      responseType: 'blob',
    })
  }
}

export default DashboardApi
