<template>
  <div class="lobby-messages-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>大厅消息</span>
        </div>
      </template>

      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            class="filter-control"
            clearable
            placeholder="消息内容"
          />
        </el-form-item>
        <el-form-item label="发送者 ID">
          <el-input-number
            v-model="searchForm.senderId"
            :min="1"
            controls-position="right"
            class="filter-control"
          />
        </el-form-item>
        <el-form-item label="消息类型">
          <el-select
            v-model="searchForm.messageType"
            clearable
            class="filter-control"
            placeholder="全部"
          >
            <el-option
              v-for="opt in CHAT_MESSAGE_TYPE_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="chatStore.messageLoading" :data="chatStore.messages" border stripe>
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column label="消息内容" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <template v-if="row.revoked">
              <el-text type="info">（消息已撤回）</el-text>
            </template>
            <template v-else>
              {{ row.content || row.file?.originalName || '-' }}
            </template>
          </template>
        </el-table-column>
        <el-table-column label="发送者" width="120" align="center">
          <template #default="{ row }">
            {{ row.senderNickname || row.senderUsername || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80" align="center">
          <template #default="{ row }">
            {{ formatChatMessageType(row.messageType) }}
          </template>
        </el-table-column>
        <el-table-column label="发送时间" width="170" align="center">
          <template #default="{ row }">
            {{ formatCreatedAt(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <el-button
              v-if="!isPinned(row.id)"
              v-permission="'content:chat:update'"
              link
              type="primary"
              @click="handlePin(row.id)"
            >
              置顶
            </el-button>
            <el-button
              v-else
              v-permission="'content:chat:update'"
              link
              type="warning"
              @click="handleUnpin(row.id)"
            >
              取消置顶
            </el-button>
            <el-button
              v-if="!row.revoked"
              v-permission="'content:chat:revoke'"
              link
              type="danger"
              @click="handleRevoke(row.id)"
            >
              撤回
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-area">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="chatStore.messageTotal"
          :page-sizes="[10, 20]"
          :layout="paginationLayout"
          @current-change="fetchMessages"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLobbyAdmin } from '@/composables/useLobbyAdmin'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { formatCreatedAt } from '@/utils'
import { CHAT_MESSAGE_TYPE_OPTIONS, formatChatMessageType } from '@/utils/contentAdmin'

const { chatStore, lobbyConvId, ensureLobbyLoaded } = useLobbyAdmin()
const { paginationLayout } = useContentAdmin()

const searchForm = reactive({
  keyword: '',
  senderId: undefined as number | undefined,
  messageType: undefined as string | undefined,
})
const pagination = reactive({ current: 1, size: 10 })

async function fetchMessages(): Promise<void> {
  if (!lobbyConvId.value) return
  await chatStore.fetchMessages(lobbyConvId.value, {
    current: pagination.current,
    size: pagination.size,
    keyword: searchForm.keyword || undefined,
    senderId: searchForm.senderId,
    messageType: searchForm.messageType,
  })
}

function handleSearch(): void {
  pagination.current = 1
  void fetchMessages()
}

function handleReset(): void {
  searchForm.keyword = ''
  searchForm.senderId = undefined
  searchForm.messageType = undefined
  pagination.current = 1
  void fetchMessages()
}

function handleSizeChange(): void {
  pagination.current = 1
  void fetchMessages()
}

function isPinned(messageId: number): boolean {
  return chatStore.pinnedMessages.some((p) => p.messageId === messageId)
}

async function handlePin(messageId: number): Promise<void> {
  const success = await chatStore.pinLobbyMessage(messageId)
  if (success) {
    ElMessage.success('已置顶')
    await chatStore.fetchPinnedLobbyMessages()
  }
}

async function handleUnpin(messageId: number): Promise<void> {
  const success = await chatStore.unpinLobbyMessage(messageId)
  if (success) {
    ElMessage.success('已取消置顶')
    await chatStore.fetchPinnedLobbyMessages()
  }
}

async function handleRevoke(messageId: number): Promise<void> {
  if (!lobbyConvId.value) return
  try {
    await ElMessageBox.confirm('确定撤回该消息？', '撤回消息', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const success = await chatStore.revokeMessage(lobbyConvId.value, messageId)
    if (success) {
      ElMessage.success('消息已撤回')
      await fetchMessages()
    }
  } catch {
    // cancelled
  }
}

onMounted(async () => {
  const loaded = await ensureLobbyLoaded()
  if (loaded) {
    await Promise.all([chatStore.fetchPinnedLobbyMessages(), fetchMessages()])
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
}

.search-form {
  margin-bottom: 16px;
}

.filter-control {
  width: 180px;
}

.pagination-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
