<template>
  <div class="channel-detail-page">
    <div v-if="store.loading && !store.currentConversation" class="channel-loading">
      <el-skeleton :rows="3" animated />
    </div>

    <template v-else-if="store.currentConversation">
      <!-- Channel header -->
      <div class="channel-header">
        <div class="channel-header-left">
          <h2 class="channel-name"># {{ store.currentConversation.name ?? '未命名频道' }}</h2>
          <span class="channel-meta member-toggle" @click="openMemberDrawer">
            {{ store.currentConversation.memberCount ?? 0 }} 成员
          </span>
        </div>
        <div class="channel-header-right">
          <el-button
            v-if="isJoined"
            type="default"
            :loading="joinLoading"
            @click="handleLeave"
          >
            已加入
          </el-button>
          <el-button
            v-else
            type="primary"
            :loading="joinLoading"
            @click="handleJoin"
          >
            加入
          </el-button>
          <el-button
            v-if="isManager"
            @click="$router.push(`/channel/${conversationId}/settings`)"
          >
            设置
          </el-button>
        </div>
      </div>

      <!-- Announcement bar -->
      <div v-if="store.currentConversation.notice" class="announcement-bar">
        <el-icon><InfoFilled /></el-icon>
        <span>{{ store.currentConversation.notice }}</span>
      </div>

      <!-- Message list -->
      <div ref="messageListRef" class="message-list" @scroll="onScroll">
        <div v-if="hasMoreMessages" class="load-more-area">
          <el-button
            text
            size="small"
            :loading="loadingMore"
            @click="loadMoreMessages"
          >
            加载更多消息
          </el-button>
        </div>
        <div
          v-for="msg in store.messages"
          :key="msg.id"
          class="message-item"
        >
          <el-avatar
            :size="36"
            :src="msg.senderAvatar ?? undefined"
            class="message-avatar"
          >
            {{ msg.senderNickname?.charAt(0) ?? '?' }}
          </el-avatar>
          <div class="message-body">
            <div class="message-header">
              <span class="message-username">{{ msg.senderNickname ?? msg.senderUsername ?? '未知用户' }}</span>
              <span class="message-time">{{ formatTime(msg.createdAt) }}</span>
            </div>
            <div v-if="msg.revoked" class="message-content revoked">消息已撤回</div>
            <div v-else class="message-content">{{ msg.content }}</div>
          </div>
        </div>
        <el-empty v-if="store.messages.length === 0 && !store.loading" description="暂无消息" />
      </div>

      <!-- Message input -->
      <div v-if="isJoined" class="message-input-area">
        <el-input
          v-model="inputText"
          placeholder="输入消息..."
          :disabled="store.sending"
          @keyup.enter="handleSend"
        />
        <el-button
          type="primary"
          :loading="store.sending"
          :disabled="!inputText.trim()"
          @click="handleSend"
        >
          发送
        </el-button>
      </div>
      <div v-else class="message-input-area join-prompt">
        <span class="join-prompt-text">加入频道后即可发送消息</span>
        <el-button type="primary" :loading="joinLoading" @click="handleJoin">
          加入频道
        </el-button>
      </div>

      <!-- 成员抽屉 -->
      <el-drawer v-model="memberDrawerVisible" title="频道成员" direction="rtl" size="320px">
        <div v-if="memberLoading" style="text-align: center; padding: 20px 0">
          <el-icon class="is-loading" :size="20"><Loading /></el-icon>
        </div>
        <div v-else-if="members.length" class="member-list">
          <div v-for="m in members" :key="m.userId" class="member-item">
            <el-avatar :size="32" :src="m.avatar ?? undefined">
              {{ m.nickname?.charAt(0) ?? m.username?.charAt(0) ?? '?' }}
            </el-avatar>
            <div class="member-info">
              <span class="member-name">{{ m.nickname ?? m.username ?? '未知用户' }}</span>
              <el-tag
                v-if="m.role"
                :type="roleTagType(m.role)"
                size="small"
                class="member-role"
              >
                {{ formatRole(m.role) }}
              </el-tag>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无成员" />
      </el-drawer>
    </template>

    <el-empty v-else description="频道不存在或无权访问" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { InfoFilled, Loading } from '@element-plus/icons-vue'
import { useUserChatStore } from '@/stores'
import { UserChatApi } from '@/api/user/chat'
import type { ChatGroupMemberVO } from '@/types/api-types'

const route = useRoute()
const store = useUserChatStore()

const inputText = ref('')
const joinLoading = ref(false)
const loadingMore = ref(false)
const messageListRef = ref<HTMLElement | null>(null)

const memberDrawerVisible = ref(false)
const memberLoading = ref(false)
const members = ref<ChatGroupMemberVO[]>([])

const conversationId = computed(() => Number(route.params.id))

const isJoined = computed(() => !!store.currentConversation?.selfRole)

const isManager = computed(
  () =>
    store.currentConversation?.selfRole === 'owner' ||
    store.currentConversation?.selfRole === 'admin',
)

const hasMoreMessages = computed(() => {
  const loaded = store.messages.length
  const total = store.msgTotal
  return loaded > 0 && loaded < total
})

function formatTime(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  if (isToday) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRole(role: string): string {
  const map: Record<string, string> = { owner: '群主', admin: '管理员', member: '成员' }
  return map[role] ?? role
}

function roleTagType(role: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  if (role === 'owner') return 'danger'
  if (role === 'admin') return 'warning'
  return 'info'
}

async function openMemberDrawer(): Promise<void> {
  memberDrawerVisible.value = true
  memberLoading.value = true
  try {
    const res = await UserChatApi.getGroupMembers(conversationId.value)
    members.value = res.data.data ?? []
  } catch {
    members.value = []
  } finally {
    memberLoading.value = false
  }
}

async function loadConversation(): Promise<void> {
  const id = conversationId.value
  if (!id || Number.isNaN(id)) return
  await store.selectConversation(id)
  await nextTick()
  scrollToBottom()
}

async function loadMoreMessages(): Promise<void> {
  if (loadingMore.value || !hasMoreMessages.value) return
  const listEl = messageListRef.value
  const prevScrollHeight = listEl?.scrollHeight ?? 0

  loadingMore.value = true
  try {
    await store.fetchMessages(conversationId.value, {
      current: store.msgCurrent + 1,
      size: store.msgSize,
    })
    await nextTick()
    if (listEl) {
      listEl.scrollTop = listEl.scrollHeight - prevScrollHeight
    }
  } finally {
    loadingMore.value = false
  }
}

function onScroll(): void {
  const listEl = messageListRef.value
  if (!listEl) return
  if (listEl.scrollTop < 60 && hasMoreMessages.value && !loadingMore.value) {
    loadMoreMessages()
  }
}

function scrollToBottom(): void {
  const listEl = messageListRef.value
  if (listEl) {
    listEl.scrollTop = listEl.scrollHeight
  }
}

async function handleJoin(): Promise<void> {
  joinLoading.value = true
  try {
    const ok = await store.joinConversation(conversationId.value)
    if (ok) {
      ElMessage.success('已加入频道')
      await store.selectConversation(conversationId.value)
    } else {
      ElMessage.error('加入失败，请稍后重试')
    }
  } finally {
    joinLoading.value = false
  }
}

async function handleLeave(): Promise<void> {
  joinLoading.value = true
  try {
    const ok = await store.leaveConversation(conversationId.value)
    if (ok) {
      ElMessage.info('已退出频道')
      await store.selectConversation(conversationId.value)
    } else {
      ElMessage.error('退出失败，请稍后重试')
    }
  } finally {
    joinLoading.value = false
  }
}

async function handleSend(): Promise<void> {
  const content = inputText.value.trim()
  if (!content) return

  const msg = await store.sendText({
    conversationId: conversationId.value,
    content,
  })
  if (msg) {
    inputText.value = ''
    await nextTick()
    scrollToBottom()
  } else {
    ElMessage.error('发送失败，请稍后重试')
  }
}

watch(conversationId, () => {
  loadConversation()
})

onMounted(() => {
  loadConversation()
})
</script>

<style scoped>
.channel-detail-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  box-sizing: border-box;
}

.channel-loading {
  padding-top: 40px;
}

.channel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.channel-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.channel-name {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.channel-meta {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.member-toggle {
  cursor: pointer;
  transition: color 0.2s;
}

.member-toggle:hover {
  color: var(--el-color-primary);
}

.channel-header-right {
  display: flex;
  gap: 8px;
}

.announcement-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--el-color-primary-light-9);
  border-radius: 6px;
  font-size: 13px;
  color: var(--el-color-primary-dark-2);
  margin-bottom: 16px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.load-more-area {
  text-align: center;
  padding: 8px 0;
}

.message-item {
  padding: 8px 0;
  display: flex;
  gap: 10px;
}

.message-avatar {
  flex-shrink: 0;
}

.message-body {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}

.message-username {
  font-weight: 600;
  font-size: 14px;
  color: var(--el-color-primary);
  white-space: nowrap;
}

.message-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.message-content.revoked {
  color: var(--el-text-color-placeholder);
  font-style: italic;
}

.message-input-area {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.message-input-area.join-prompt {
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.join-prompt-text {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

/* 成员列表 */
.member-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-role {
  flex-shrink: 0;
}
</style>
