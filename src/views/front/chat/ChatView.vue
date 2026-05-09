<template>
  <div class="chat-page">
    <aside class="chat-sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">消息</span>
        <div style="display: flex; gap: 8px">
          <el-button size="small" type="primary" link @click="singleChatVisible = true">
            私聊
          </el-button>
          <el-button size="small" type="primary" link @click="createGroupVisible = true">
            创建群聊
          </el-button>
        </div>
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
        <el-tag
          v-if="store.currentConversation.conversationType === 'group'"
          size="small"
          effect="plain"
        >
          群聊
        </el-tag>
        <router-link
          v-if="store.currentConversation.conversationType === 'group'"
          :to="`/chat/groups/${store.currentConversation.id}/settings`"
        >
          <el-button size="small" text>
            <el-icon><Setting /></el-icon>
          </el-button>
        </router-link>
        <el-tag
          v-if="connectionState !== 'connected'"
          size="small"
          :type="connectionState === 'connecting' ? 'warning' : 'danger'"
          effect="dark"
        >
          {{ connectionState === 'connecting' ? '连接中...' : '已断开' }}
        </el-tag>
      </div>

      <MessageList
        :messages="store.messages"
        :current-user-id="currentUserId"
        :loading="store.loading"
        @revoke="handleRevoke"
        @delete="handleDelete"
        @edit="handleEdit"
      />

      <MessageInput :sending="store.sending" @send="handleSend" @send-file="handleSendFile" />
    </main>

    <div v-else class="chat-empty">
      <el-empty description="选择一个会话开始聊天" />
    </div>

    <CreateGroupDialog v-model:visible="createGroupVisible" @submit="handleCreateGroup" />

    <el-dialog v-model="singleChatVisible" title="发起私聊" width="400px">
      <el-form :model="singleChatForm" @submit.prevent="handleCreateSingle">
        <el-form-item label="用户ID">
          <el-input
            v-model="singleChatForm.targetUserId"
            placeholder="输入对方用户ID"
            clearable
            @keyup.enter="handleCreateSingle"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="singleChatVisible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!singleChatForm.targetUserId"
          @click="handleCreateSingle"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
/**
 * 聊天页面
 * @description 聚合私聊和群聊，支持消息发送、文件上传、群聊创建与管理
 * @module front/chat/ChatView
 * @see ../../api/user/chat.ts
 */
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import SparkMD5 from 'spark-md5'
import { useUserChatStore, useAuthStore } from '@/stores'
import { useChatSocket } from '@/composables/useChatSocket'
import { UserFileApi } from '@/api/user/file'
import type { FileUploadInitRequest } from '@/types/api-types'
import ConversationList from './components/ConversationList.vue'
import MessageList from './components/MessageList.vue'
import MessageInput from './components/MessageInput.vue'
import CreateGroupDialog from './components/CreateGroupDialog.vue'

const store = useUserChatStore()
const authStore = useAuthStore()
const { connectionState, connect } = useChatSocket()

const currentUserId = computed(() => authStore.currentUser?.id)
// 创建群聊弹窗是否显示
const createGroupVisible = ref(false)
// 私聊弹窗是否显示
const singleChatVisible = ref(false)
// 私聊表单
const singleChatForm = reactive({ targetUserId: '' })

async function handleSelectConv(id: number): Promise<void> {
  await store.selectConversation(id)
}

function handleSearch(keyword: string): void {
  store.fetchConversations({ keyword: keyword || undefined, current: 1, size: store.convSize })
}

async function handleCreateSingle(): Promise<void> {
  const targetId = Number(singleChatForm.targetUserId)
  if (!targetId || isNaN(targetId)) {
    ElMessage.warning('请输入有效的用户ID')
    return
  }
  const conv = await store.createSingleConversation({ targetUserId: targetId })
  if (conv) {
    ElMessage.success('创建成功')
    singleChatVisible.value = false
    singleChatForm.targetUserId = ''
    await store.selectConversation(conv.id)
  } else {
    ElMessage.error('创建私聊失败')
  }
}

async function handleSend(content: string): Promise<void> {
  if (!store.currentConversation) return
  await store.sendText({
    conversationId: store.currentConversation.id,
    content,
  })
}

async function handleSendFile(file: File): Promise<void> {
  if (!store.currentConversation) return

  try {
    // 计算文件 MD5
    const fileMd5 = await computeFileMD5(file)

    // Step 1: Initialize upload task
    const initReq: FileUploadInitRequest = {
      originalName: file.name,
      fileSize: file.size,
      fileMd5,
      mimeType: file.type || undefined,
      referenceType: 'temp',
      category: 'temp',
      isPublic: 0,
    }
    const initRes = await UserFileApi.initUploadTask(initReq)
    const task = initRes.data.data

    // Already completed (quick upload / dedup)
    if (task.completed && task.businessId) {
      await store.sendFileMessage({
        conversationId: store.currentConversation.id,
        businessId: task.businessId,
      })
      return
    }

    // Step 2: Upload file data
    const formData = new FormData()
    formData.append('file', file)
    const uploadRes = await UserFileApi.uploadFile(task.uploadId, formData)
    const result = uploadRes.data.data

    // Step 3: Send file message
    if (result.businessId) {
      await store.sendFileMessage({
        conversationId: store.currentConversation.id,
        businessId: result.businessId,
      })
    }
  } catch {
    ElMessage.error('文件发送失败')
  }
}

function computeFileMD5(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer()
    const reader = new FileReader()
    const blockSize = 2 * 1024 * 1024
    const totalBlocks = Math.ceil(file.size / blockSize)
    let currentBlock = 0

    reader.onload = e => {
      if (!e.target?.result) return
      spark.append(e.target.result as ArrayBuffer)
      currentBlock++
      if (currentBlock < totalBlocks) {
        loadNext()
      } else {
        resolve(spark.end())
      }
    }
    reader.onerror = () => reject(reader.error ?? new Error('文件读取失败'))

    function loadNext() {
      const start = currentBlock * blockSize
      reader.readAsArrayBuffer(file.slice(start, Math.min(start + blockSize, file.size)))
    }
    loadNext()
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

async function handleEdit(messageId: number, content: string): Promise<void> {
  const success = await store.updateMessage(messageId, { content })
  if (success) ElMessage.success('已编辑')
}

async function handleCreateGroup(data: { name: string }): Promise<void> {
  const conv = await store.createGroup({ name: data.name, memberUserIds: [] })
  if (conv) {
    ElMessage.success('群聊创建成功')
    await store.selectConversation(conv.id)
  }
}

onMounted(async () => {
  await store.fetchConversations()
  if (store.conversations.length > 0 && !store.currentConversation) {
    store.selectConversation(store.conversations[0]!.id)
  }
  connect()
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
