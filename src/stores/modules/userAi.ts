import { ref } from 'vue'
import { defineStore } from 'pinia'
import { aiUserApi } from '@/api/user/ai'
import type {
  AiSessionCreateRequest,
  AiSessionVO,
  AiSessionDetailVO,
  AiMessageVO,
  AiMessageSendRequest,
  AiQuotaVO,
} from '@/types/api-types'

export const useUserAiStore = defineStore('userAi', () => {
  const sessions = ref<AiSessionVO[]>([])
  const sessionTotal = ref(0)
  const currentSession = ref<AiSessionDetailVO | null>(null)
  const messages = ref<AiMessageVO[]>([])
  const messageTotal = ref(0)
  const quota = ref<AiQuotaVO | null>(null)
  const loading = ref(false)
  const sending = ref(false)

  async function fetchSessions(params?: { current?: number; size?: number }): Promise<void> {
    loading.value = true
    try {
      const response = await aiUserApi.getSessions(params)
      const data = response.data.data
      sessions.value = data.records
      sessionTotal.value = data.total
    } finally {
      loading.value = false
    }
  }

  async function createSession(data: AiSessionCreateRequest): Promise<AiSessionVO | null> {
    try {
      const response = await aiUserApi.createSession(data)
      const session = response.data.data
      sessions.value.unshift(session)
      return session
    } catch {
      return null
    }
  }

  async function selectSession(id: number): Promise<void> {
    loading.value = true
    try {
      const detailResponse = await aiUserApi.getSessionById(id)
      currentSession.value = detailResponse.data.data

      const msgResponse = await aiUserApi.getSessionMessages(id, { current: 1, size: 100 })
      const msgData = msgResponse.data.data
      messages.value = msgData.records
      messageTotal.value = msgData.total
    } finally {
      loading.value = false
    }
  }

  async function fetchMessages(
    sessionId: number,
    params?: { current?: number; size?: number },
  ): Promise<void> {
    try {
      const response = await aiUserApi.getSessionMessages(sessionId, params)
      const data = response.data.data
      messages.value = data.records
      messageTotal.value = data.total
    } catch {
      // ignore
    }
  }

  async function sendMessage(
    sessionId: number,
    data: AiMessageSendRequest,
  ): Promise<AiMessageVO | null> {
    sending.value = true
    try {
      const response = await aiUserApi.sendMessage(sessionId, data)
      const reply = response.data.data
      messages.value.push(reply)
      return reply
    } catch {
      return null
    } finally {
      sending.value = false
    }
  }

  async function closeSession(id: number): Promise<boolean> {
    try {
      await aiUserApi.closeSession(id)
      const session = sessions.value.find(s => s.id === id)
      if (session) session.status = 0
      if (currentSession.value?.id === id) {
        currentSession.value = null
        messages.value = []
      }
      return true
    } catch {
      return false
    }
  }

  async function fetchQuota(): Promise<void> {
    try {
      const response = await aiUserApi.getQuota()
      quota.value = response.data.data
    } catch {
      // ignore
    }
  }

  function clearState(): void {
    sessions.value = []
    sessionTotal.value = 0
    currentSession.value = null
    messages.value = []
    messageTotal.value = 0
    quota.value = null
  }

  return {
    sessions,
    sessionTotal,
    currentSession,
    messages,
    messageTotal,
    quota,
    loading,
    sending,
    fetchSessions,
    createSession,
    selectSession,
    fetchMessages,
    sendMessage,
    closeSession,
    fetchQuota,
    clearState,
  }
})
