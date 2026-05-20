<template>
  <div class="lobby-messages-page">
    <DataTable
      :data="chatStore.messages"
      :loading="chatStore.messageLoading"
      :total="chatStore.messageTotal"
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :page-sizes="[10, 20]"
      :pagination-layout="paginationLayout"
      title="大厅消息"
      @page-change="handleCurrentChange"
      @size-change="handleSizeChange"
    >
      <template #toolbar>
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
      </template>

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
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLobbyAdmin } from '@/composables/useLobbyAdmin'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useAdminPagination } from '@/composables/useAdminPagination'
import { formatCreatedAt } from '@/utils'
import { CHAT_MESSAGE_TYPE_OPTIONS, formatChatMessageType } from '@/utils/contentAdmin'
import DataTable from '@/components/common/DataTable.vue'

const { chatStore, lobbyConvId, ensureLobbyLoaded } = useLobbyAdmin()
const { paginationLayout } = useContentAdmin()

const searchForm = reactive({
  keyword: '',
  senderId: undefined as number | undefined,
  messageType: undefined as string | undefined,
})

const {
  pagination,
  fetch: fetchMessages,
  handleSearch,
  handleSizeChange,
  handleCurrentChange,
} = useAdminPagination({
  fetchFn: (params: Record<string, unknown>) => {
    if (!lobbyConvId.value) return Promise.resolve()
    return chatStore.fetchMessages(lobbyConvId.value, params)
  },
  buildParams: () => ({
    keyword: searchForm.keyword || undefined,
    senderId: searchForm.senderId,
    messageType: searchForm.messageType,
  }),
  immediate: false,
  persistSizeKey: 'lobby-messages-page-size',
})

function handleReset(): void {
  searchForm.keyword = ''
  searchForm.senderId = undefined
  searchForm.messageType = undefined
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
.lobby-messages-page {
  padding: 20px;
}

.search-form {
  margin-bottom: 16px;
}

.filter-control {
  width: 180px;
}
</style>
