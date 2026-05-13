<template>
  <div class="ai-assistant-page">
    <!-- 移动端会话抽屉 -->
    <el-drawer
      v-model="mobileDrawerVisible"
      title="AI 会话"
      direction="ltr"
      :size="300"
      append-to-body
      class="session-drawer"
    >
      <div class="drawer-header">
        <el-input
          v-model="sessionKeyword"
          clearable
          placeholder="搜索会话"
          :prefix-icon="Search"
          size="default"
        />
        <el-button type="primary" :icon="Plus" style="margin-top: 12px; width: 100%" @click="handleNewSession">
          新建会话
        </el-button>
      </div>

      <div class="drawer-list">
        <AiSessionList
          :sessions="filteredSessions"
          :selected-id="selectedId"
          @select="handleMobileSelectSession"
          @close="handleCloseSession"
        />
      </div>
    </el-drawer>

    <!-- 桌面端会话面板 -->
    <aside class="panel session-panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">AI 会话</div>
          <div class="panel-subtitle">{{ store.sessionTotal }} 个会话</div>
        </div>
        <el-button :icon="Plus" type="primary" size="small" @click="handleNewSession">新建</el-button>
      </div>

      <div class="panel-section">
        <el-input
          v-model="sessionKeyword"
          clearable
          placeholder="搜索会话"
          :prefix-icon="Search"
          size="small"
        />
      </div>

      <el-scrollbar class="session-list">
        <AiSessionList
          :sessions="filteredSessions"
          :selected-id="selectedId"
          @select="handleSelectSession"
          @close="handleCloseSession"
        />
      </el-scrollbar>
    </aside>

    <!-- 工作区 -->
    <main class="panel workspace-panel">
      <AiWorkspaceHeader
        :session="activeSession"
        :scene-type="composerRef?.getSceneType() ?? 'general'"
        :quota="store.quota"
        @toggle-mobile-menu="mobileDrawerVisible = true"
      />

      <div ref="chatAreaRef" class="conversation-body">
        <AiConversationBody
          :messages="store.messages"
          :sending="store.sending"
          :prompt-presets="promptPresets"
          :active-session="activeSession ?? null"
          @prompt-click="composerRef?.setInputText($event)"
        />
      </div>

      <AiComposer
        ref="composerRef"
        :sending="store.sending"
        :locked="composerLocked"
        :quota="store.quota"
        :latest-references="latestReferences"
        @send="handleSendMessage"
      />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import AiSessionList from './components/AiSessionList.vue'
import AiWorkspaceHeader from './components/AiWorkspaceHeader.vue'
import AiConversationBody from './components/AiConversationBody.vue'
import AiComposer from './components/AiComposer.vue'
import { useAutoScroll } from '@/composables/useAutoScroll'
import { useUserAiStore } from '@/stores'
import type { AiMessageSendRequest } from '@/types/api-types'
import { PROMPT_MAP } from './components/ai-helpers'

const store = useUserAiStore()
const { containerRef: chatAreaRef, scrollToBottom } = useAutoScroll()

const selectedId = ref<number | null>(null)
const sessionKeyword = ref('')
const mobileDrawerVisible = ref(false)
const composerRef = ref<InstanceType<typeof AiComposer> | null>(null)

const filteredSessions = computed(() => {
  const keyword = sessionKeyword.value.trim().toLowerCase()
  if (!keyword) return store.sessions
  return store.sessions.filter(session => {
    return [session.title, session.sceneType].some(field =>
      String(field ?? '').toLowerCase().includes(keyword),
    )
  })
})

const activeSession = computed(() => store.currentSession)

const promptPresets = computed<string[]>(() => {
  const sceneType = composerRef.value?.getSceneType() ?? 'general'
  return PROMPT_MAP[sceneType] ?? PROMPT_MAP.general!
})

const latestReferences = computed(() => {
  const latestAssistant = [...store.messages]
    .reverse()
    .find(message => message.roleType === 'assistant' && (message.ragReferences?.length ?? 0) > 0)
  return latestAssistant?.ragReferences ?? []
})

const composerLocked = computed(() => store.sending || activeSession.value?.status === 0)

function buildSessionTitle(content: string): string {
  const text = content.replace(/\s+/g, ' ').trim()
  if (!text) return '新对话'
  return text.slice(0, 20)
}

async function ensureActiveSession(): Promise<number | null> {
  if (activeSession.value && activeSession.value.status === 1) {
    return activeSession.value.id
  }

  const session = await store.createSession({
    title: buildSessionTitle('新对话'),
    sceneType: composerRef.value?.getSceneType() ?? 'general',
  })

  if (!session) {
    ElMessage.error('创建会话失败')
    return null
  }

  selectedId.value = session.id
  await store.selectSession(session.id)
  syncSceneType()
  scrollToBottom()
  return session.id
}

function syncSceneType(): void {
  const sceneType = store.currentSession?.sceneType
  if (sceneType) composerRef.value?.setSceneType(sceneType)
}

async function handleNewSession(): Promise<void> {
  const session = await store.createSession({
    title: '新对话',
    sceneType: composerRef.value?.getSceneType() ?? 'general',
  })
  if (!session) {
    ElMessage.error('创建会话失败')
    return
  }

  selectedId.value = session.id
  await store.selectSession(session.id)
  syncSceneType()
  scrollToBottom()
  mobileDrawerVisible.value = false
}

async function handleSelectSession(id: number): Promise<void> {
  selectedId.value = id
  await store.selectSession(id)
  syncSceneType()
  scrollToBottom()
}

async function handleMobileSelectSession(id: number): Promise<void> {
  await handleSelectSession(id)
  mobileDrawerVisible.value = false
}

async function handleSendMessage(payload: AiMessageSendRequest): Promise<void> {
  const sessionId = selectedId.value ?? (await ensureActiveSession())
  if (!sessionId) return

  const result = await store.sendMessage(sessionId, payload)
  if (!result) {
    ElMessage.error('发送失败')
    return
  }

  composerRef.value?.clearInput()
  scrollToBottom()
}

async function handleCloseSession(id: number): Promise<void> {
  try {
    await ElMessageBox.confirm('关闭该会话？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await store.closeSession(id)
    if (!success) return

    if (selectedId.value === id) {
      selectedId.value = null
      const fallback = store.sessions.find(item => item.status === 1)
      if (fallback) {
        await handleSelectSession(fallback.id)
      }
    }

    ElMessage.success('会话已关闭')
  } catch {
    // noop
  }
}

watch(
  () => [store.currentSession?.id, store.messages.length],
  () => scrollToBottom(),
)

watch(
  () => store.currentSession?.sceneType,
  value => {
    if (value) composerRef.value?.setSceneType(value)
  },
)

onMounted(async () => {
  await Promise.all([store.fetchSessions({ current: 1, size: 50 }), store.fetchQuota()])
  const initial = store.sessions.find(item => item.status === 1) ?? store.sessions[0]
  if (initial) {
    selectedId.value = initial.id
    await store.selectSession(initial.id)
    syncSceneType()
  }
  scrollToBottom()
})
</script>

<style scoped>
.ai-assistant-page {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 0;
  height: calc(100vh - 60px);
  box-sizing: border-box;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.panel {
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.panel-subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.panel-section {
  padding: 10px 16px 0;
}

.session-list {
  flex: 1;
  min-height: 0;
  padding: 10px 8px 10px 12px;
}

.workspace-panel {
  border-right: none;
}

.conversation-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drawer-header {
  padding: 0 0 12px;
}

.drawer-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

@media (max-width: 960px) {
  .ai-assistant-page {
    grid-template-columns: minmax(0, 1fr);
  }

  .session-panel {
    display: none;
  }
}

@media (max-width: 640px) {
  .conversation-body {
    padding: 12px;
  }
}
</style>
