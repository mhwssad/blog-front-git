<template>
  <div class="lobby-members-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>大厅成员</span>
          <el-button link type="primary" @click="fetchMembers">刷新</el-button>
        </div>
      </template>

      <el-table v-loading="chatStore.memberLoading" :data="chatStore.members" border stripe>
        <el-table-column prop="userId" label="用户 ID" width="90" align="center" />
        <el-table-column prop="username" label="用户名" width="120" align="center" />
        <el-table-column prop="nickname" label="昵称" width="120" align="center" />
        <el-table-column label="角色" width="90" align="center">
          <template #default="{ row }">
            {{ formatChatMemberRole(row.role) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="禁言截止" width="170" align="center">
          <template #default="{ row }">
            {{ row.muteUntil ? formatCreatedAt(row.muteUntil) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template #default="{ row }">
            <el-button
              v-permission="'content:chat:update'"
              link
              type="warning"
              @click="handleMute(row)"
            >
              禁言
            </el-button>
            <el-button
              v-if="row.muteUntil"
              v-permission="'content:chat:update'"
              link
              type="success"
              @click="handleUnmute(row.userId)"
            >
              解除禁言
            </el-button>
            <el-button
              v-permission="'content:chat:update'"
              link
              type="danger"
              @click="handleKick(row)"
            >
              踢出
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLobbyAdmin } from '@/composables/useLobbyAdmin'
import { DateUtils, formatCreatedAt } from '@/utils'
import { formatChatMemberRole } from '@/utils/contentAdmin'

const { chatStore, lobbyConvId, ensureLobbyLoaded } = useLobbyAdmin()

async function fetchMembers(): Promise<void> {
  if (!lobbyConvId.value) return
  await chatStore.fetchConversationMembers(lobbyConvId.value)
}

async function handleMute(member: { userId: number; nickname?: string }): Promise<void> {
  try {
    const { value } = await ElMessageBox.prompt(
      `设置用户「${member.nickname || member.userId}」的禁言截止时间`,
      '禁言成员',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: DateUtils.formatDate(
          new Date(Date.now() + 24 * 60 * 60 * 1000),
          "yyyy-MM-dd'T'HH:mm:ss",
        ),
        inputPlaceholder: 'YYYY-MM-DDTHH:mm:ss',
      },
    )
    if (!value) return
    const success = await chatStore.muteLobbyMember(member.userId, { muteUntil: value })
    if (success) {
      ElMessage.success('禁言已设置')
      await fetchMembers()
    }
  } catch {
    // cancelled
  }
}

async function handleUnmute(userId: number): Promise<void> {
  const success = await chatStore.muteLobbyMember(userId, { muteUntil: null })
  if (success) {
    ElMessage.success('禁言已解除')
    await fetchMembers()
  } else {
    ElMessage.error('解除禁言失败')
  }
}

async function handleKick(member: { userId: number; nickname?: string }): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确定将用户「${member.nickname || member.userId}」踢出大厅？`,
      '踢出用户',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    const success = await chatStore.kickLobbyMember(member.userId)
    if (success) {
      ElMessage.success('用户已被踢出')
      await fetchMembers()
    } else {
      ElMessage.error('踢出操作失败')
    }
  } catch {
    // cancelled
  }
}

onMounted(async () => {
  const loaded = await ensureLobbyLoaded()
  if (loaded) await fetchMembers()
})
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
}
</style>
