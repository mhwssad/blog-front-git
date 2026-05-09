<template>
  <div class="lobby-page">
    <!-- 大厅设置 -->
    <el-card class="settings-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>大厅设置</span>
          <el-button
            v-permission="'content:chat:update'"
            type="primary"
            size="small"
            :loading="savingSettings"
            @click="handleSaveSettings"
          >
            保存设置
          </el-button>
        </div>
      </template>

      <el-form :model="settingsForm" label-width="100px" class="settings-form">
        <el-row :gutter="24">
          <el-col :xs="24" :sm="8">
            <el-form-item label="发言等级">
              <el-input-number
                v-model="settingsForm.speakLevelLimit"
                :min="0"
                :max="100"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="慢速模式">
              <el-input-number
                v-model="settingsForm.slowModeSeconds"
                :min="0"
                :max="3600"
                controls-position="right"
              >
                <template #suffix>秒</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="游客发言">
              <el-switch
                v-model="settingsForm.allowGuestSpeak"
                inline-prompt
                active-text="允许"
                inactive-text="禁止"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 置顶消息 -->
    <el-card class="pinned-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>置顶消息</span>
          <el-button link type="primary" @click="fetchPinnedMessages">刷新</el-button>
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
              @click="handleUnpin(row.id)"
            >
              取消置顶
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-area">
        <el-pagination
          v-model:current-page="pinnedPagination.current"
          v-model:page-size="pinnedPagination.size"
          :total="chatStore.pinnedTotal"
          :page-sizes="[10, 20]"
          :layout="paginationLayout"
          @current-change="handlePinnedPageChange"
          @size-change="handlePinnedSizeChange"
        />
      </div>
    </el-card>

    <!-- 大厅成员管理 -->
    <el-card class="member-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>大厅成员管理</span>
        </div>
      </template>

      <el-form :model="memberQuery" inline class="member-search">
        <el-form-item label="用户 ID">
          <el-input-number v-model="memberQuery.userId" :min="1" controls-position="right" />
        </el-form-item>
        <el-form-item label="禁言截止">
          <el-date-picker
            v-model="memberQuery.muteUntil"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择截止时间"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :disabled="!memberQuery.userId || !memberQuery.muteUntil"
            @click="handleMute"
          >
            禁言
          </el-button>
          <el-button type="info" :disabled="!memberQuery.userId" @click="handleMute24h">
            24h
          </el-button>
          <el-button type="warning" :disabled="!memberQuery.userId" @click="handleUnmute">
            解除禁言
          </el-button>
          <el-button type="danger" :disabled="!memberQuery.userId" @click="handleKick">
            踢出
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useChatStore } from '@/stores'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { DateUtils, formatCreatedAt } from '@/utils'

const chatStore = useChatStore()

// ==================== 大厅设置 ====================

const savingSettings = ref(false)
const settingsForm = reactive({
  speakLevelLimit: 0,
  slowModeSeconds: 0,
  allowGuestSpeak: false,
})

async function handleSaveSettings(): Promise<void> {
  savingSettings.value = true
  try {
    const success = await chatStore.updateLobbySettings({
      speakLevelLimit: settingsForm.speakLevelLimit,
      slowModeSeconds: settingsForm.slowModeSeconds,
      allowGuestSpeak: settingsForm.allowGuestSpeak,
    })
    if (success) {
      ElMessage.success('大厅设置已保存')
    } else {
      ElMessage.error('保存失败')
    }
  } finally {
    savingSettings.value = false
  }
}

// ==================== 置顶消息 ====================

const pinnedPagination = reactive({ current: 1, size: 10 })
const { paginationLayout } = useContentAdmin()

async function fetchPinnedMessages(): Promise<void> {
  await chatStore.fetchPinnedLobbyMessages({
    current: pinnedPagination.current,
    size: pinnedPagination.size,
  })
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
      await fetchPinnedMessages()
    }
  } catch {
    // cancelled
  }
}

function handlePinnedPageChange(): void {
  void fetchPinnedMessages()
}

function handlePinnedSizeChange(): void {
  pinnedPagination.current = 1
  void fetchPinnedMessages()
}

// ==================== 成员管理 ====================

const memberQuery = reactive({
  userId: undefined as number | undefined,
  muteUntil: '' as string | null | undefined,
})

async function submitMute(muteUntil: string | null): Promise<void> {
  if (!memberQuery.userId) return
  const success = await chatStore.muteLobbyMember(memberQuery.userId, { muteUntil })
  if (success) {
    ElMessage.success(muteUntil ? '禁言已设置' : '禁言已解除')
  } else {
    ElMessage.error(muteUntil ? '禁言操作失败' : '解除禁言失败')
  }
}

async function handleMute(): Promise<void> {
  if (!memberQuery.muteUntil) return
  await submitMute(memberQuery.muteUntil)
}

async function handleMute24h(): Promise<void> {
  if (!memberQuery.userId) return
  const muteUntil = DateUtils.formatDate(
    new Date(Date.now() + 24 * 60 * 60 * 1000),
    "yyyy-MM-dd'T'HH:mm:ss",
  )
  memberQuery.muteUntil = muteUntil
  await submitMute(muteUntil)
}

async function handleUnmute(): Promise<void> {
  if (!memberQuery.userId) return
  memberQuery.muteUntil = undefined
  await submitMute(null)
}

async function handleKick(): Promise<void> {
  if (!memberQuery.userId) return
  try {
    await ElMessageBox.confirm('确定将该用户踢出大厅？', '踢出用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const success = await chatStore.kickLobbyMember(memberQuery.userId)
    if (success) {
      ElMessage.success('用户已被踢出')
    } else {
      ElMessage.error('踢出操作失败')
    }
  } catch {
    // cancelled
  }
}

onMounted(() => {
  void fetchPinnedMessages()
})
</script>

<style scoped>
.lobby-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
}

.settings-form {
  max-width: 800px;
}

.pagination-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.member-search {
  margin-bottom: 16px;
}
</style>
