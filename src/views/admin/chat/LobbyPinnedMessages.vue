<template>
  <div class="lobby-pinned-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>置顶消息</span>
          <el-button link type="primary" @click="fetchList">刷新</el-button>
        </div>
      </template>

      <el-table v-loading="chatStore.pinnedLoading" :data="chatStore.pinnedMessages" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="消息内容" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.message?.content || row.message?.file?.originalName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="发送者" width="140" align="center">
          <template #default="{ row }">
            {{ row.message?.senderNickname || row.message?.senderUsername || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="置顶人" width="110" align="center">
          <template #default="{ row }">
            #{{ row.pinnedBy }}
          </template>
        </el-table-column>
        <el-table-column label="置顶时间" width="170" align="center">
          <template #default="{ row }">
            {{ formatCreatedAt(row.pinnedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button
              v-permission="'content:chat:update'"
              link
              type="danger"
              @click="handleUnpin(row.messageId)"
            >
              取消置顶
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-area">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="chatStore.pinnedTotal"
          :page-sizes="[10, 20]"
          :layout="paginationLayout"
          @current-change="fetchList"
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

const { chatStore } = useLobbyAdmin()
const { paginationLayout } = useContentAdmin()

const pagination = reactive({ current: 1, size: 10 })

async function fetchList(): Promise<void> {
  await chatStore.fetchPinnedLobbyMessages({
    current: pagination.current,
    size: pagination.size,
  })
}

function handleSizeChange(): void {
  pagination.current = 1
  void fetchList()
}

async function handleUnpin(messageId: number): Promise<void> {
  try {
    await ElMessageBox.confirm('确定取消置顶该消息？', '取消置顶', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const success = await chatStore.unpinLobbyMessage(messageId)
    if (success) {
      ElMessage.success('已取消置顶')
      await fetchList()
    }
  } catch {
    // cancelled
  }
}

onMounted(() => {
  void fetchList()
})
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
}

.pagination-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
