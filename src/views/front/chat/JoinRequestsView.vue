<template>
  <div class="join-requests-page">
    <div class="page-header">
      <h2 class="page-title">入群申请</h2>
    </div>

    <div v-if="loading" class="loading-area">
      <el-skeleton :rows="5" animated />
    </div>

    <el-empty v-else-if="applications.length === 0" description="暂无入群申请" />

    <div v-else class="request-list">
      <div v-for="item in applications" :key="item.id" class="request-item">
        <div class="request-info">
          <span class="request-user">{{ item.nickname || item.username }}</span>
          <span class="request-group">申请加入「{{ item.conversationId }}」</span>
          <span v-if="item.applyMessage" class="request-msg">{{ item.applyMessage }}</span>
          <span class="request-time">{{ formatAiDate(item.createdAt) }}</span>
        </div>
        <div class="request-actions">
          <el-tag v-if="item.applyStatus === 1" type="success" size="small">已通过</el-tag>
          <el-tag v-else-if="item.applyStatus === 2" type="danger" size="small">已拒绝</el-tag>
          <template v-else>
            <el-button size="small" type="primary" @click="handleReview(item, 1)">通过</el-button>
            <el-button size="small" @click="handleReview(item, 2)">拒绝</el-button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * 入群申请审批页面
 * @description 群主/管理员查看并审批用户的入群申请
 * @module front/chat/JoinRequestsView
 * @see ../../api/user/chat.ts
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserChatStore } from '@/stores'
import { formatAiDate } from '@/utils'
import type { GroupJoinApplicationVO } from '@/types/api-types'

const route = useRoute()
const store = useUserChatStore()

const groupId = Number(route.params.id)
const loading = ref(false)
// 入群申请列表
const applications = ref<GroupJoinApplicationVO[]>([])

async function fetchApplications(): Promise<void> {
  loading.value = true
  try {
    await store.fetchGroupJoinApplications(groupId, { size: 50 })
    applications.value = [...store.joinApplications]
  } finally {
    loading.value = false
  }
}

/** 审批申请（通过或拒绝） */
async function handleReview(item: GroupJoinApplicationVO, status: 1 | 2): Promise<void> {
  const action = status === 1 ? '通过' : '拒绝'
  try {
    await ElMessageBox.confirm(
      `确定${action} ${item.nickname || item.username} 的入群申请吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    const success = await store.reviewJoinApplication(groupId, item.id, {
      reviewStatus: status,
    })
    if (success) {
      ElMessage.success(`已${action}`)
      await fetchApplications()
    } else {
      ElMessage.error(`${action}失败`)
    }
  } catch {
    // cancelled
  }
}

onMounted(() => {
  void fetchApplications()
})
</script>

<style scoped>
.join-requests-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.loading-area {
  padding: 16px 0;
}

.request-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.request-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--color-bg-base);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.request-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  min-width: 0;
  flex: 1;
}

.request-user {
  font-weight: 600;
  font-size: 14px;
}

.request-group {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.request-msg {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.request-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.request-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
</style>
