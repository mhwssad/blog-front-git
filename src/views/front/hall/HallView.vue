<template>
  <div class="hall-page">
    <h1 class="page-title">聊天大厅</h1>

    <HallAnnouncement :content="hallNotice" />

    <div class="hall-container">
      <div v-if="store.loading && !store.messages.length" class="loading-area">
        <el-skeleton :rows="8" animated />
      </div>

      <template v-else>
        <div ref="messageListRef" class="hall-message-list">
          <div
            v-for="msg in store.messages"
            :key="msg.id"
            class="hall-message-item"
          >
            <el-avatar :size="32" :src="msg.senderAvatar ?? undefined">
              {{ msg.senderNickname?.charAt(0) ?? '?' }}
            </el-avatar>
            <div class="message-body">
              <div class="message-header">
                <span class="message-username">{{ msg.senderNickname || msg.senderUsername || '未知' }}</span>
                <span class="message-time">{{ formatTime(msg.createdAt) }}</span>
              </div>
              <div class="message-content">{{ msg.content }}</div>
            </div>
          </div>
          <el-empty v-if="!store.messages.length" description="暂无消息" :image-size="64" />
        </div>

        <div class="hall-input-area">
          <template v-if="!authStore.isLoggedIn">
            <div class="input-notice">登录后可以发言</div>
          </template>
          <template v-else>
            <el-input
              v-model="inputText"
              placeholder="输入消息..."
              :disabled="store.sending"
              @keyup.enter="handleSend"
            />
            <el-button type="primary" :disabled="!inputText.trim()" :loading="store.sending" @click="handleSend">
              发送
            </el-button>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useUserChatStore } from '@/stores'
import { useAuthStore } from '@/stores'
import { formatAiDate } from '@/utils'
import HallAnnouncement from './components/HallAnnouncement.vue'

const store = useUserChatStore()
const authStore = useAuthStore()

const inputText = ref('')
const messageListRef = ref<HTMLElement | null>(null)
const hallConversationId = ref<number | null>(null)

const hallNotice = computed(() => store.currentConversation?.notice ?? '欢迎来到聊天大厅，请文明发言，遵守社区规范。')

function formatTime(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function scrollToBottom(): void {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

async function loadHall(): Promise<void> {
  await store.fetchConversations({ size: 100 })
  const hallConv = store.conversations.find(c => c.sceneType === 'hall_channel')
  if (hallConv) {
    hallConversationId.value = hallConv.id
    await store.selectConversation(hallConv.id)
    scrollToBottom()
  }
}

async function handleSend(): Promise<void> {
  const text = inputText.value.trim()
  if (!text || !hallConversationId.value) return

  await store.sendText({
    conversationId: hallConversationId.value,
    content: text,
  })
  inputText.value = ''
  scrollToBottom()
}

onMounted(() => {
  void loadHall()
})
</script>

<style scoped>
.hall-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  margin: 0 0 24px;
  font-size: 22px;
  font-weight: 700;
}

.hall-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 220px);
  min-height: 400px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
}

.loading-area {
  flex: 1;
  padding: 16px;
}

.hall-message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.hall-message-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 16px;
}

.message-body {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.message-username {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.message-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.hall-input-area {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}

.input-notice {
  width: 100%;
  padding: 8px 0;
  text-align: center;
  font-size: 14px;
  color: var(--el-text-color-placeholder);
}
</style>
