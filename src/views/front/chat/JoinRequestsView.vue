<template>
  <div class="join-requests-page">
    <div class="page-header">
      <h2 class="page-title">入群申请</h2>
    </div>

    <el-empty v-if="requests.length === 0" description="暂无入群申请" />

    <div v-else class="request-list">
      <div
        v-for="item in requests"
        :key="item.id"
        class="request-item"
      >
        <div class="request-info">
          <span class="request-user">{{ item.username }}</span>
          <span class="request-group">申请加入「{{ item.groupName }}」</span>
          <span class="request-time">{{ item.time }}</span>
        </div>
        <div class="request-actions">
          <el-tag
            v-if="item.status === 'approved'"
            type="success"
            size="small"
          >
            已通过
          </el-tag>
          <el-tag
            v-else-if="item.status === 'rejected'"
            type="danger"
            size="small"
          >
            已拒绝
          </el-tag>
          <template v-else>
            <el-button size="small" type="primary" @click="handleApprove(item.id)">
              通过
            </el-button>
            <el-button size="small" @click="handleReject(item.id)">
              拒绝
            </el-button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

interface JoinRequest {
  id: number
  username: string
  groupName: string
  time: string
  status: 'pending' | 'approved' | 'rejected'
}

const requests = ref<JoinRequest[]>([
  { id: 1, username: '赵六', groupName: '前端技术交流群', time: '2025-04-27 14:30', status: 'pending' },
  { id: 2, username: '钱七', groupName: 'Vue爱好者', time: '2025-04-27 13:15', status: 'pending' },
  { id: 3, username: '孙八', groupName: '前端技术交流群', time: '2025-04-26 10:00', status: 'approved' },
  { id: 4, username: '周九', groupName: 'Node.js学习组', time: '2025-04-25 18:20', status: 'rejected' },
  { id: 5, username: '吴十', groupName: 'Vue爱好者', time: '2025-04-25 09:45', status: 'pending' },
])

function handleApprove(id: number): void {
  const item = requests.value.find((r) => r.id === id)
  if (item) {
    item.status = 'approved'
    ElMessage.success(`已通过 ${item.username} 的入群申请`)
  }
}

function handleReject(id: number): void {
  const item = requests.value.find((r) => r.id === id)
  if (item) {
    item.status = 'rejected'
    ElMessage.info(`已拒绝 ${item.username} 的入群申请`)
  }
}
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
  background: #fff;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.request-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.request-user {
  font-weight: 600;
  font-size: 14px;
}

.request-group {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.request-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.request-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
