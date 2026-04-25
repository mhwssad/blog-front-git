import { ref } from 'vue'
import { defineStore } from 'pinia'
import { InteractionApi } from '@/api/sys/interaction'
import type { InteractionQueryRequest, InteractionVO, PageResult } from '@/api/types'

export const useInteractionStore = defineStore('interaction', () => {
  const interactions = ref<InteractionVO[]>([])
  const total = ref(0)
  const current = ref(1)
  const size = ref(10)
  const loading = ref(false)

  async function fetchInteractions(params?: InteractionQueryRequest): Promise<void> {
    loading.value = true
    try {
      const response = await InteractionApi.getInteractions(params)
      const data = response.data.data as PageResult<InteractionVO>

      interactions.value = data.records
      total.value = data.total
      current.value = data.current
      size.value = data.size
    } finally {
      loading.value = false
    }
  }

  async function deleteInteraction(id: number): Promise<boolean> {
    try {
      await InteractionApi.deleteInteraction(id)
      return true
    } catch {
      return false
    }
  }

  function clearInteractions(): void {
    interactions.value = []
    total.value = 0
    current.value = 1
  }

  return {
    interactions,
    total,
    current,
    size,
    loading,
    fetchInteractions,
    deleteInteraction,
    clearInteractions,
  }
})
