import { ref } from 'vue'
import { defineStore } from 'pinia'
import { sysFollowApi } from '@/api/sys/follow'
import type {
  FollowAdminQueryRequest,
  FollowAdminRelationVO,
  FollowRelationCleanRequest,
  PageResult,
} from '@/api/types'

export const useFollowStore = defineStore('follow', () => {
  const relations = ref<FollowAdminRelationVO[]>([])
  const total = ref(0)
  const current = ref(1)
  const size = ref(10)
  const loading = ref(false)
  const cleaning = ref(false)

  async function fetchFollows(params?: FollowAdminQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await sysFollowApi.getFollows(params)
      const data = response.data.data as PageResult<FollowAdminRelationVO>

      relations.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  async function cleanFollows(payload: FollowRelationCleanRequest): Promise<number> {
    cleaning.value = true
    try {
      const response = await sysFollowApi.cleanFollows(payload)
      return Number(response.data.data ?? 0)
    } finally {
      cleaning.value = false
    }
  }

  function clear(): void {
    relations.value = []
    total.value = 0
    current.value = 1
    size.value = 10
  }

  return {
    relations,
    total,
    current,
    size,
    loading,
    cleaning,
    fetchFollows,
    cleanFollows,
    clear,
  }
})
