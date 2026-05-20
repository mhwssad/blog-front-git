<template>
  <div class="lobby-pinned-page">
    <DataTable
      :data="chatStore.pinnedMessages"
      :loading="chatStore.pinnedLoading"
      :total="chatStore.pinnedTotal"
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :page-sizes="[10, 20]"
      :pagination-layout="paginationLayout"
      title="置顶消息"
      @page-change="handleCurrentChange"
      @size-change="handleSizeChange"
    >
      <template #header-extra>
        <el-button link type="primary" @click="fetchList">刷新</el-button>
      </template>

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
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLobbyAdmin } from '@/composables/useLobbyAdmin'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useAdminPagination } from '@/composables/useAdminPagination'
import { formatCreatedAt } from '@/utils'
import DataTable from '@/components/common/DataTable.vue'

const { chatStore } = useLobbyAdmin()
const { paginationLayout } = useContentAdmin()

const {
  pagination,
  fetch: fetchList,
  handleSizeChange,
  handleCurrentChange,
} = useAdminPagination({
  fetchFn: chatStore.fetchPinnedLobbyMessages,
  buildParams: () => ({}),
  persistSizeKey: 'lobby-pinned-page-size',
})

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
</script>

<style scoped>
.lobby-pinned-page {
  padding: 20px;
}
</style>
