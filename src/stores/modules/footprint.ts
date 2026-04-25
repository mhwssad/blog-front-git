import { ref } from 'vue'
import { defineStore } from 'pinia'
import { FootprintApi } from '@/api/sys/footprint'
import type { FootprintQueryRequest, FootprintVO, PageResult } from '@/api/types'

export const useFootprintStore = defineStore('footprint', () => {
  const footprints = ref<FootprintVO[]>([])
  const total = ref(0)
  const current = ref(1)
  const size = ref(10)
  const loading = ref(false)
  const clearing = ref(false)

  async function fetchFootprints(params?: FootprintQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await FootprintApi.getFootprints(params)
      const data = response.data.data as PageResult<FootprintVO>

      footprints.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  async function deleteFootprint(id: number): Promise<boolean> {
    try {
      await FootprintApi.deleteFootprint(id)
      return true
    } catch {
      return false
    }
  }

  async function clearFootprints(params?: FootprintQueryRequest): Promise<boolean> {
    clearing.value = true
    try {
      await FootprintApi.clearFootprints(params)
      return true
    } catch {
      return false
    } finally {
      clearing.value = false
    }
  }

  function clear(): void {
    footprints.value = []
    total.value = 0
    current.value = 1
    size.value = 10
  }

  return {
    footprints,
    total,
    current,
    size,
    loading,
    clearing,
    fetchFootprints,
    deleteFootprint,
    clearFootprints,
    clear,
  }
})
