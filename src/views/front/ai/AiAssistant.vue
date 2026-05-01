<template>
  <div class="ai-assistant-page">
    <!-- 左侧会话列表 -->
    <div class="session-sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">对话列表</span>
        <el-button type="primary" size="small" @click="handleNewSession">
          <el-icon><Plus /></el-icon>
          新对话
        </el-button>
      </div>
      <el-scrollbar class="session-list">
        <div
          v-for="session in store.sessions"
          :key="session.id"
          :class="['session-item', { 'session-item--active': selectedId === session.id }]"
          @click="handleSelectSession(session.id)"
        >
          <div class="session-info">
            <div class="session-title">
              <el-tag v-if="session.status === 0" type="info" size="small">已关闭</el-tag>
              {{ session.title || '新对话' }}
            </div>
            <div class="session-time">{{ formatSessionTime(session.lastMessageAt) }}</div>
          </div>
          <el-button
            v-if="session.status === 1"
            :icon="Close"
            circle
            size="small"
            text
            @click.stop="handleCloseSession(session.id)"
          />
        </div>
        <div v-if="store.sessions.length === 0" class="session-empty">暂无对话</div>
      </el-scrollbar>
    </div>

    <!-- 主聊天区域 -->
    <div class="chat-main">
      <div class="chat-header">
        <div class="chat-title">
          {{ store.currentSession?.title || 'AI 助手' }}
          <el-tag v-if="store.currentSession" type="info" size="small" style="margin-left: 8px">
            {{ store.currentSession.modelName || store.currentSession.channelName }}
          </el-tag>
        </div>
        <div class="header-actions">
          <el-tag v-if="store.quota" :type="store.quota.remainingToday <= 5 ? 'danger' : 'info'" effect="plain">
            今日剩余: {{ store.quota.remainingToday }} / {{ store.quota.dailyLimit }}
          </el-tag>
        </div>
      </div>

      <div ref="chatAreaRef" class="chat-area">
        <template v-if="store.currentSession">
          <AiMessageBubble
            v-for="msg in store.messages"
            :key="msg.id"
            :role="msg.roleType as 'user' | 'assistant' | 'system'"
            :content="msg.content"
            :error-message="msg.responseStatus === 0 ? msg.errorMessage ?? undefined : undefined"
            :created-at="formatMsgTime(msg.createdAt)"
          />
          <div v-if="store.sending" class="thinking-indicator">
            <span class="thinking-text">正在思考...</span>
            <span class="thinking-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </span>
          </div>
        </template>
        <template v-else>
          <div class="welcome-area">
            <div class="welcome-title">你好！我是 AI 助手</div>
            <div class="welcome-desc">有什么可以帮助你的吗？你可以直接输入问题，或者点击下方的快捷问题开始对话。</div>
            <div class="quick-questions">
              <el-button
                v-for="q in quickQuestions"
                :key="q"
                size="default"
                round
                @click="handleQuickQuestion(q)"
              >
                {{ q }}
              </el-button>
            </div>
          </div>
        </template>
      </div>

      <div v-if="store.currentSession" class="input-area">
        <el-input
          v-model="inputText"
          placeholder="输入你的问题..."
          :disabled="store.sending"
          @keyup.enter="handleSendMessage"
        />
        <el-button
          type="primary"
          :disabled="!inputText.trim() || store.sending"
          @click="handleSendMessage"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close, Plus } from '@element-plus/icons-vue'
import AiMessageBubble from './components/AiMessageBubble.vue'
import { useUserAiStore } from '@/stores'

const store = useUserAiStore()
const inputText = ref('')
const selectedId = ref<number | null>(null)
const chatAreaRef = ref<HTMLElement | null>(null)

const quickQuestions = [
  'Vue3 有哪些新特性',
  'TypeScript 入门指南',
  '如何学习前端开发',
  'React 和 Vue 的区别',
]

function scrollToBottom(): void {
  nextTick(() => {
    if (chatAreaRef.value) {
      chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight
    }
  })
}

function formatSessionTime(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return value.slice(11, 16)
  }
  return value.slice(5, 16)
}

function formatMsgTime(value: string | null | undefined): string {
  if (!value) return ''
  return value.slice(11, 16)
}

async function handleNewSession(): Promise<void> {
  const session = await store.createSession({ title: '新对话' })
  if (session) {
    selectedId.value = session.id
    await store.selectSession(session.id)
    scrollToBottom()
  } else {
    ElMessage.error('创建会话失败')
  }
}

async function handleSelectSession(id: number): Promise<void> {
  selectedId.value = id
  await store.selectSession(id)
  scrollToBottom()
}

async function handleSendMessage(): Promise<void> {
  if (!inputText.value.trim() || store.sending || !selectedId.value) return

  const content = inputText.value.trim()
  inputText.value = ''

  await store.sendMessage(selectedId.value, { content })
  scrollToBottom()
}

async function handleCloseSession(id: number): Promise<void> {
  try {
    await ElMessageBox.confirm('确定要关闭此对话吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const success = await store.closeSession(id)
    if (success) {
      if (selectedId.value === id) selectedId.value = null
      ElMessage.success('会话已关闭')
    }
  } catch {
    // 用户取消
  }
}

function handleQuickQuestion(question: string): void {
  inputText.value = question
  if (!selectedId.value) {
    void handleNewSession().then(() => {
      void handleSendMessage()
    })
  } else {
    void handleSendMessage()
  }
}

watch(
  () => store.messages.length,
  () => scrollToBottom(),
)

onMounted(async () => {
  await store.fetchSessions({ current: 1, size: 50 })
  await store.fetchQuota()
})
</script>

<style scoped>
.ai-assistant-page {
  display: flex;
  height: calc(100vh - 60px);
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}

.session-sidebar {
  width: 280px;
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.sidebar-title {
  font-weight: 600;
  font-size: 16px;
}

.session-list {
  flex: 1;
  overflow: hidden;
}

.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

.session-item:hover {
  background: var(--el-fill-color-light);
}

.session-item--active {
  background: var(--el-color-primary-light-9);
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
}

.session-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-top: 4px;
}

.session-empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.chat-title {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.welcome-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
}

.welcome-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  max-width: 400px;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}

.thinking-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  align-self: flex-start;
}

.thinking-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.thinking-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-text-color-placeholder);
  animation: dot-pulse 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: 0s; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-pulse {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.6);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.input-area {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid var(--el-border-color-light);
}

@media (max-width: 768px) {
  .session-sidebar {
    width: 220px;
  }

  .ai-assistant-page {
    max-width: 100%;
  }
}
</style>
