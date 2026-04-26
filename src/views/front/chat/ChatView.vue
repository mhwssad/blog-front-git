<template>
  <div class="chat-page">
    <aside class="chat-sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">消息</span>
        <el-button size="small" type="primary" link @click="createGroupVisible = true">
          创建群聊
        </el-button>
      </div>
      <ConversationList
        :conversations="store.conversations"
        :active-id="store.currentConversation?.id"
        :loading="store.loading"
        @select="handleSelectConv"
        @search="handleSearch"
      />
    </aside>

    <main v-if="store.currentConversation" class="chat-main">
      <div class="chat-header">
        <span class="chat-title">
          {{ store.currentConversation.name ?? store.currentConversation.targetNickname ?? '会话' }}
        </span>
        <el-tag v-if="store.currentConversation.conversationType === 'group'" size="small" effect="plain">
          群聊
        </el-tag>
      </div>

      <MessageList
        :messages="store.messages"
        :current-user-id="currentUserId"
        :loading="store.loading"
        @revoke="handleRevoke"
        @delete="handleDelete"
      />

      <MessageInput :sending="store.sending" @send="handleSend" />
    </main>

    <div v-else class="chat-empty">
      <el-empty description="选择一个会话开始聊天" />
    </div>

    <CreateGroupDialog
      v-model:visible="createGroupVisible"
      @submit="handleCreateGroup"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserChatStore, useAuthStore } from '@/stores'
import ConversationList from './components/ConversationList.vue'
import MessageList from './components/MessageList.vue'
import MessageInput from './components/MessageInput.vue'
import CreateGroupDialog from './components/CreateGroupDialog.vue'

const store = useUserChatStore()
const authStore = useAuthStore()

const currentUserId = computed(() => authStore.currentUser?.id)
const createGroupVisible = ref(false)

async function handleSelectConv(id: number): Promise<void> {
  await store.selectConversation(id)
}

function handleSearch(keyword: string): void {
  store.fetchConversations({ keyword: keyword || undefined, current: 1, size: store.convSize })
}

async function handleSend(content: string): Promise<void> {
  if (!store.currentConversation) return
  await store.sendText({
    conversationId: store.currentConversation.id,
    content,
  })
}

async function handleRevoke(messageId: number): Promise<void> {
  const success = await store.revokeMessage(messageId)
  if (success) ElMessage.success('已撤回')
}

async function handleDelete(messageId: number): Promise<void> {
  const success = await store.deleteMessage(messageId)
  if (success) ElMessage.success('已删除')
}

async function handleCreateGroup(data: { name: string }): Promise<void> {
  const conv = await store.createGroup({ name: data.name, memberUserIds: [] })
  if (conv) {
    ElMessage.success('群聊创建成功')
    await store.selectConversation(conv.id)
  }
}

onMounted(() => {
  store.fetchConversations()
})
</script>

<style scoped>
.chat-page {
  height: calc(100vh - 60px);
  display: flex;
  background: #fff;
}

.chat-sidebar {
  width: 280px;
  flex-shrink: 0;
  border-right: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
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
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.chat-title {
  font-size: 15px;
  font-weight: 600;
}

.chat-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
