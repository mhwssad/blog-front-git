/**
 * 后台数据看板 Store
 * 基于 auth-api.md 文档 8.6 节
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { DashboardApi } from '@/api/sys/dashboard'
import type {
  DashboardAiVO,
  DashboardCommunityVO,
  DashboardContentVO,
  DashboardGovernanceVO,
  DashboardOverviewVO,
  DashboardQueryRequest,
} from '@/types/api-types'

export const useDashboardStore = defineStore('admin-dashboard', () => {
  const overview = ref<DashboardOverviewVO | null>(null)
  const content = ref<DashboardContentVO | null>(null)
  const community = ref<DashboardCommunityVO | null>(null)
  const ai = ref<DashboardAiVO | null>(null)
  const governance = ref<DashboardGovernanceVO | null>(null)

  const overviewLoading = ref(false)
  const contentLoading = ref(false)
  const communityLoading = ref(false)
  const aiLoading = ref(false)
  const governanceLoading = ref(false)

  async function fetchOverview(params?: DashboardQueryRequest): Promise<void> {
    overviewLoading.value = true
    try {
      const response = await DashboardApi.getOverview(params)
      overview.value = response.data.data
    } finally {
      overviewLoading.value = false
    }
  }

  async function fetchContent(params?: DashboardQueryRequest): Promise<void> {
    contentLoading.value = true
    try {
      const response = await DashboardApi.getContent(params)
      content.value = response.data.data
    } finally {
      contentLoading.value = false
    }
  }

  async function fetchCommunity(params?: DashboardQueryRequest): Promise<void> {
    communityLoading.value = true
    try {
      const response = await DashboardApi.getCommunity(params)
      community.value = response.data.data
    } finally {
      communityLoading.value = false
    }
  }

  async function fetchAi(params?: DashboardQueryRequest): Promise<void> {
    aiLoading.value = true
    try {
      const response = await DashboardApi.getAi(params)
      ai.value = response.data.data
    } finally {
      aiLoading.value = false
    }
  }

  async function fetchGovernance(params?: DashboardQueryRequest): Promise<void> {
    governanceLoading.value = true
    try {
      const response = await DashboardApi.getGovernance(params)
      governance.value = response.data.data
    } finally {
      governanceLoading.value = false
    }
  }

  function clearState(): void {
    overview.value = null
    content.value = null
    community.value = null
    ai.value = null
    governance.value = null
    overviewLoading.value = false
    contentLoading.value = false
    communityLoading.value = false
    aiLoading.value = false
    governanceLoading.value = false
  }

  return {
    overview,
    content,
    community,
    ai,
    governance,
    overviewLoading,
    contentLoading,
    communityLoading,
    aiLoading,
    governanceLoading,
    fetchOverview,
    fetchContent,
    fetchCommunity,
    fetchAi,
    fetchGovernance,
    clearState,
  }
})
