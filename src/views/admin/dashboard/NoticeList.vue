<template>
  <el-card shadow="never" class="panel-card">
    <template #header>
      <div class="panel-header">
        <span>近期通知</span>
        <el-button text size="small" @click="goToNotices">
          查看全部
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>
    </template>

    <el-empty v-if="notices.length === 0" description="暂无通知" />
    <div v-else class="notice-list">
      <div
        v-for="notice in notices"
        :key="notice.id"
        class="notice-item"
        @click="goToNotices"
      >
        <div class="notice-title">{{ notice.title }}</div>
        <div class="notice-time">{{ notice.publishTime || notice.createTime }}</div>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { ArrowRight } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import type { NoticeSummary } from '@/types/ui'

defineProps<{
  notices: NoticeSummary[]
}>()

const router = useRouter()

function goToNotices() {
  router.push('/admin/notices')
}
</script>

<style scoped>
.panel-card {
  min-height: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 600;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: var(--el-fill-color-light);
  cursor: pointer;
  transition: background 0.2s;
}

.notice-item:hover {
  background: var(--el-fill-color);
}

.notice-title {
  font-weight: 600;
}

.notice-time {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
