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
        <button
          v-for="session in filteredSessions"
          :key="session.id"
          class="session-item"
          :class="{ 'is-active': selectedId === session.id }"
          type="button"
          @click="handleMobileSelectSession(session.id)"
        >
          <div class="session-item__main">
            <div class="session-item__title">
              <span class="session-title-text">{{ session.title || '新对话' }}</span>
              <el-tag
                v-if="session.status === 0"
                size="small"
                type="info"
                effect="plain"
              >
                关闭
              </el-tag>
            </div>
            <div class="session-item__meta">
              <span>{{ session.sceneType || 'general' }}</span>
              <span>{{ formatTime(session.lastMessageAt || session.updatedAt || session.createdAt) }}</span>
            </div>
          </div>
          <el-button
            v-if="session.status === 1"
            :icon="Close"
            circle
            size="small"
            text
            @click.stop="handleCloseSession(session.id)"
          />
        </button>

        <el-empty v-if="filteredSessions.length === 0" description="暂无会话" />
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
        <button
          v-for="session in filteredSessions"
          :key="session.id"
          class="session-item"
          :class="{ 'is-active': selectedId === session.id }"
          type="button"
          @click="handleSelectSession(session.id)"
        >
          <div class="session-item__main">
            <div class="session-item__title">
              <span class="session-title-text">{{ session.title || '新对话' }}</span>
              <el-tag
                v-if="session.status === 0"
                size="small"
                type="info"
                effect="plain"
              >
                关闭
              </el-tag>
            </div>
            <div class="session-item__meta">
              <span>{{ session.sceneType || 'general' }}</span>
              <span>{{ formatTime(session.lastMessageAt || session.updatedAt || session.createdAt) }}</span>
            </div>
          </div>
          <el-button
            v-if="session.status === 1"
            :icon="Close"
            circle
            size="small"
            text
            @click.stop="handleCloseSession(session.id)"
          />
        </button>

        <el-empty v-if="filteredSessions.length === 0" description="暂无会话" />
      </el-scrollbar>
    </aside>

    <!-- 工作区 -->
    <main class="panel workspace-panel">
      <header class="workspace-header">
        <div class="workspace-header__left">
          <el-button
            class="mobile-menu-btn"
            :icon="Menu"
            text
            @click="mobileDrawerVisible = true"
          />
          <div class="workspace-header__main">
            <div class="workspace-title">{{ activeTitle }}</div>
            <div class="workspace-meta">
              <el-tag v-if="activeSession" size="small" effect="plain">{{ currentModelLabel }}</el-tag>
              <el-tag v-if="activeSession" size="small" effect="plain">
                {{ activeSession.sceneType || requestSceneType }}
              </el-tag>
              <el-tag v-if="activeSession?.status === 0" size="small" type="info" effect="plain">
                已关闭
              </el-tag>
            </div>
          </div>
        </div>

        <div class="workspace-header__right">
          <template v-if="store.quota">
            <el-progress
              :percentage="quotaPercent"
              :stroke-width="6"
              :show-text="false"
              class="quota-bar"
            />
            <el-tag size="small" :type="quotaTagType" effect="plain">
              今日 {{ store.quota.usedToday }} / {{ store.quota.dailyLimit }}
            </el-tag>
          </template>
        </div>
      </header>

      <div ref="chatAreaRef" class="conversation-body">
        <template v-if="activeSession">
          <AiMessageBubble
            v-for="msg in store.messages"
            :key="msg.id"
            :role="msg.roleType as 'user' | 'assistant' | 'system'"
            :content="msg.content"
            :token-count="msg.tokenCount"
            :error-message="msg.responseStatus === 0 ? (msg.errorMessage ?? undefined) : undefined"
            :created-at="formatTime(msg.createdAt)"
            :attachments="msg.attachments"
            :rag-references="msg.ragReferences"
          />

          <div v-if="store.sending" class="thinking-indicator">
            <span>正在生成</span>
            <span class="thinking-dots">
              <span class="dot" />
              <span class="dot" />
              <span class="dot" />
            </span>
          </div>

          <el-empty v-if="store.messages.length === 0 && !store.sending" description="暂无消息" />
        </template>

        <div v-else class="welcome-state">
          <div class="welcome-state__title">AI 助手</div>
          <div class="welcome-state__sub">选择会话或直接发起新请求</div>
          <div class="welcome-state__quick">
            <el-button
              v-for="prompt in promptPresets"
              :key="prompt"
              size="small"
              plain
              @click="handlePromptClick(prompt)"
            >
              {{ prompt }}
            </el-button>
          </div>
        </div>
      </div>

      <section class="composer">
        <div v-if="attachmentDrafts.length" class="attachment-strip">
          <div v-for="draft in attachmentDrafts" :key="draft.id" class="attachment-item">
            <img :src="draft.previewUrl" :alt="draft.file.name" />
            <button class="attachment-item__remove" type="button" @click="removeAttachment(draft.id)">
              <el-icon><Close /></el-icon>
            </button>
            <div v-if="draft.uploading" class="attachment-item__mask">上传中</div>
          </div>
        </div>

        <div class="composer-toolbar">
          <div class="composer-toolbar__left">
            <el-select v-model="requestSceneType" size="small" class="scene-select">
              <el-option
                v-for="item in sceneOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>

            <el-input-number
              v-model="requestTargetId"
              :min="0"
              :controls="false"
              size="small"
              placeholder="目标 ID"
              class="target-input"
            />

            <el-upload
              :show-file-list="false"
              :before-upload="handleAttachmentBeforeUpload"
              accept="image/*"
              multiple
            >
              <el-button text :icon="Paperclip" size="small">附件</el-button>
            </el-upload>
          </div>

          <div class="composer-toolbar__right">
            <el-button text :icon="Delete" size="small" :disabled="attachmentDrafts.length === 0" @click="clearAttachments">
              清空
            </el-button>
          </div>
        </div>

        <el-input
          v-model="inputText"
          type="textarea"
          :rows="3"
          resize="none"
          placeholder="输入问题，Enter 发送，Shift+Enter 换行"
          :disabled="composerLocked"
          @keydown.enter.exact.prevent="handleSendMessage"
        />

        <div class="composer-footer">
          <span v-if="store.quota" class="composer-hint">
            今日剩余 {{ store.quota.remainingToday }} 次
            <template v-if="latestReferences.length"> · 最近引用 {{ latestReferences.length }} 条</template>
          </span>
          <span v-else />

          <el-button
            type="primary"
            :icon="Position"
            :loading="store.sending"
            :disabled="!canSend"
            @click="handleSendMessage"
          >
            发送
          </el-button>
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close, Delete, Menu, Paperclip, Plus, Position, Search } from '@element-plus/icons-vue'
import type { UploadRawFile } from 'element-plus'
import SparkMD5 from 'spark-md5'
import AiMessageBubble from './components/AiMessageBubble.vue'
import { UserFileApi } from '@/api/user/file'
import { useAutoScroll } from '@/composables/useAutoScroll'
import { useUserAiStore } from '@/stores'
import type { AiMessageSendRequest } from '@/types/api-types'

type AttachmentDraft = {
  id: string
  file: File
  previewUrl: string
  uploading: boolean
  fileId?: number
}

const store = useUserAiStore()
const { containerRef: chatAreaRef, scrollToBottom } = useAutoScroll()

const inputText = ref('')
const selectedId = ref<number | null>(null)
const sessionKeyword = ref('')
const requestSceneType = ref('general')
const requestTargetId = ref<number | undefined>()
const attachmentDrafts = ref<AttachmentDraft[]>([])
const mobileDrawerVisible = ref(false)

const sceneOptions = [
  { label: '通用问答', value: 'general' },
  { label: '文章生成', value: 'article' },
  { label: '社区问答', value: 'forum' },
  { label: '知识检索', value: 'knowledge' },
  { label: '代码辅助', value: 'code' },
]

const promptMap: Record<string, string[]> = {
  general: ['帮我梳理一下这个问题', '给我一个可执行方案', '把结论列成要点'],
  article: ['生成一篇结构清晰的文章', '给我一个文章大纲', '优化这段内容表达'],
  forum: ['根据社区内容给出建议', '总结用户关注的问题', '生成回复草稿'],
  knowledge: ['从知识库里检索相关内容', '列出可引用的来源', '总结关联结论'],
  code: ['检查这段代码的问题', '给出重构建议', '写一个可复用实现'],
}

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

const activeTitle = computed(() => activeSession.value?.title || 'AI 助手')

const currentModelLabel = computed(() => {
  if (!activeSession.value) return '默认渠道'
  return activeSession.value.modelName || activeSession.value.channelName || '默认渠道'
})

const promptPresets = computed(() => promptMap[requestSceneType.value] ?? promptMap.general)

const latestReferences = computed(() => {
  const latestAssistant = [...store.messages]
    .reverse()
    .find(message => message.roleType === 'assistant' && (message.ragReferences?.length ?? 0) > 0)
  return latestAssistant?.ragReferences ?? []
})

const quotaPercent = computed(() => {
  const quota = store.quota
  if (!quota || quota.dailyLimit <= 0) return 0
  return Math.min(100, Math.round((quota.usedToday / quota.dailyLimit) * 100))
})

const quotaTagType = computed(() => {
  if (!store.quota) return 'info'
  return store.quota.remainingToday <= 5 ? 'danger' : 'info'
})

const composerLocked = computed(() => store.sending || activeSession.value?.status === 0)

const canSend = computed(() => {
  return !!inputText.value.trim() && !store.sending && activeSession.value?.status !== 0
})

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function formatTime(value?: string | null): string {
  if (!value) return ''
  const date = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 16)

  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function buildSessionTitle(content: string): string {
  const text = content.replace(/\s+/g, ' ').trim()
  if (!text) return '新对话'
  return text.slice(0, 20)
}

function revokeAttachmentUrl(draft: AttachmentDraft): void {
  URL.revokeObjectURL(draft.previewUrl)
}

function removeAttachment(id: string): void {
  const index = attachmentDrafts.value.findIndex(item => item.id === id)
  if (index < 0) return
  const [draft] = attachmentDrafts.value.splice(index, 1)
  if (draft) revokeAttachmentUrl(draft)
}

function clearAttachments(): void {
  attachmentDrafts.value.forEach(revokeAttachmentUrl)
  attachmentDrafts.value = []
}

function handleAttachmentBeforeUpload(file: UploadRawFile): boolean {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('仅支持图片')
    return false
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片不能超过 10MB')
    return false
  }
  if (attachmentDrafts.value.length >= 5) {
    ElMessage.warning('最多添加 5 张图片')
    return false
  }

  attachmentDrafts.value.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    uploading: false,
  })
  return false
}

async function computeFileMD5(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer()
    const reader = new FileReader()
    const blockSize = 2 * 1024 * 1024
    const totalBlocks = Math.ceil(file.size / blockSize)
    let currentBlock = 0

    reader.onload = event => {
      if (!event.target?.result) return
      spark.append(event.target.result as ArrayBuffer)
      currentBlock += 1
      if (currentBlock < totalBlocks) {
        loadNext()
        return
      }
      resolve(spark.end())
    }

    reader.onerror = () => reject(reader.error ?? new Error('文件读取失败'))

    function loadNext(): void {
      const start = currentBlock * blockSize
      reader.readAsArrayBuffer(file.slice(start, Math.min(start + blockSize, file.size)))
    }

    loadNext()
  })
}

async function uploadAttachment(draft: AttachmentDraft): Promise<number> {
  if (draft.fileId) return draft.fileId

  const fileMd5 = await computeFileMD5(draft.file)
  const initResult = await UserFileApi.initUploadTask({
    originalName: draft.file.name,
    fileSize: draft.file.size,
    fileMd5,
    mimeType: draft.file.type || undefined,
    referenceType: 'temp',
    category: 'temp',
    isPublic: 0,
  })

  const initData = initResult.data.data
  if (initData.completed && initData.fileId) {
    draft.fileId = initData.fileId
    return initData.fileId
  }

  const formData = new FormData()
  formData.append('file', draft.file)
  const uploadResult = await UserFileApi.uploadFile(initData.uploadId, formData)
  const result = uploadResult.data.data
  const fileId = result.fileId ?? result.businessId
  if (!fileId) {
    throw new Error('上传结果缺少 fileId')
  }

  draft.fileId = fileId
  return fileId
}

async function ensureActiveSession(): Promise<number | null> {
  if (activeSession.value && activeSession.value.status === 1) {
    return activeSession.value.id
  }

  const session = await store.createSession({
    title: buildSessionTitle(inputText.value),
    sceneType: requestSceneType.value,
  })

  if (!session) {
    ElMessage.error('创建会话失败')
    return null
  }

  selectedId.value = session.id
  await store.selectSession(session.id)
  requestSceneType.value = store.currentSession?.sceneType || requestSceneType.value
  scrollToBottom()
  return session.id
}

async function handleNewSession(): Promise<void> {
  const session = await store.createSession({
    title: '新对话',
    sceneType: requestSceneType.value,
  })
  if (!session) {
    ElMessage.error('创建会话失败')
    return
  }

  selectedId.value = session.id
  await store.selectSession(session.id)
  requestSceneType.value = store.currentSession?.sceneType || requestSceneType.value
  scrollToBottom()
  mobileDrawerVisible.value = false
}

async function handleSelectSession(id: number): Promise<void> {
  selectedId.value = id
  await store.selectSession(id)
  requestSceneType.value = store.currentSession?.sceneType || requestSceneType.value
  scrollToBottom()
}

async function handleMobileSelectSession(id: number): Promise<void> {
  await handleSelectSession(id)
  mobileDrawerVisible.value = false
}

async function handleSendMessage(): Promise<void> {
  const content = inputText.value.trim()
  if (!content || store.sending || activeSession.value?.status === 0) return

  const sessionId = selectedId.value ?? (await ensureActiveSession())
  if (!sessionId) return

  const attachments = [...attachmentDrafts.value]
  const attachmentFileIds: number[] = []

  try {
    for (const draft of attachments) {
      draft.uploading = true
      const fileId = await uploadAttachment(draft)
      attachmentFileIds.push(fileId)
    }
  } catch {
    ElMessage.error('附件上传失败')
    attachments.forEach(draft => {
      draft.uploading = false
    })
    return
  } finally {
    attachments.forEach(draft => {
      draft.uploading = false
    })
  }

  const payload: AiMessageSendRequest = {
    content,
    requestSceneType: requestSceneType.value,
    requestTargetId: requestTargetId.value,
    attachmentFileIds: attachmentFileIds.length ? attachmentFileIds : undefined,
  }

  const result = await store.sendMessage(sessionId, payload)
  if (!result) {
    ElMessage.error('发送失败')
    return
  }

  inputText.value = ''
  clearAttachments()
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

function handlePromptClick(prompt: string): void {
  inputText.value = prompt
}

watch(
  () => [store.currentSession?.id, store.messages.length],
  () => scrollToBottom(),
)

watch(
  () => store.currentSession?.sceneType,
  value => {
    if (value) requestSceneType.value = value
  },
)

onMounted(async () => {
  await Promise.all([store.fetchSessions({ current: 1, size: 50 }), store.fetchQuota()])
  const initial = store.sessions.find(item => item.status === 1) ?? store.sessions[0]
  if (initial) {
    selectedId.value = initial.id
    await store.selectSession(initial.id)
    requestSceneType.value = store.currentSession?.sceneType || requestSceneType.value
  }
  scrollToBottom()
})

onBeforeUnmount(() => {
  clearAttachments()
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

/* ===== Panel base ===== */
.panel {
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

/* ===== Session panel ===== */
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

.session-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 6px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.session-item:hover {
  background: var(--el-fill-color-light);
}

.session-item.is-active {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

.session-item__main {
  min-width: 0;
  flex: 1;
}

.session-item__title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.session-title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.session-item__meta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

/* ===== Mobile menu button ===== */
.mobile-menu-btn {
  display: none;
}

/* ===== Workspace panel ===== */
.workspace-panel {
  border-right: none;
}

.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.workspace-header__left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.workspace-header__main {
  min-width: 0;
}

.workspace-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}

.workspace-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.workspace-header__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.quota-bar {
  width: 80px;
}

/* ===== Conversation body ===== */
.conversation-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.welcome-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 12px;
  padding: 32px 0;
}

.welcome-state__title {
  font-size: 22px;
  font-weight: 700;
}

.welcome-state__sub {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.welcome-state__quick {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* ===== Thinking indicator ===== */
.thinking-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.thinking-dots {
  display: inline-flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--el-text-color-placeholder);
  animation: dot-pulse 1.2s infinite ease-in-out both;
}

.dot:nth-child(2) {
  animation-delay: 0.15s;
}

.dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes dot-pulse {
  0%,
  80%,
  100% {
    opacity: 0.35;
    transform: scale(0.75);
  }

  40% {
    opacity: 1;
    transform: scale(1);
  }
}

/* ===== Composer ===== */
.composer {
  padding: 10px 20px 14px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.attachment-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.attachment-item {
  position: relative;
  width: 80px;
  height: 80px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-light);
}

.attachment-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attachment-item__remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attachment-item__mask {
  position: absolute;
  inset: auto 0 0;
  padding: 3px 6px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 11px;
  text-align: center;
}

.composer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.composer-toolbar__left,
.composer-toolbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.scene-select {
  width: 110px;
}

.target-input {
  width: 100px;
}

.composer :deep(.el-textarea__inner) {
  box-shadow: none;
}

.composer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.composer-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* ===== Mobile drawer ===== */
.drawer-header {
  padding: 0 0 12px;
}

.drawer-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ===== Responsive ===== */
@media (max-width: 960px) {
  .ai-assistant-page {
    grid-template-columns: minmax(0, 1fr);
  }

  .session-panel {
    display: none;
  }

  .mobile-menu-btn {
    display: inline-flex;
  }

  .workspace-panel {
    border-right: none;
  }
}

@media (max-width: 640px) {
  .workspace-header {
    padding: 10px 12px;
  }

  .conversation-body {
    padding: 12px;
  }

  .composer {
    padding: 8px 12px 12px;
  }

  .quota-bar {
    display: none;
  }

  .target-input {
    display: none;
  }
}
</style>
