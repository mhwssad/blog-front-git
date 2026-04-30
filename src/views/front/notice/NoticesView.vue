<template>
  <div class="notices-page">
    <div class="page-header">
      <h1 class="page-title">
        通知中心
        <el-badge v-if="store.hasUnread" :value="store.unreadCount" :max="99" />
      </h1>
      <div class="header-actions">
        <el-radio-group v-model="readFilter" size="small" @change="handleFilterChange">
          <el-radio-button :value="undefined">全部</el-radio-button>
          <el-radio-button :value="0">未读</el-radio-button>
          <el-radio-button :value="1">已读</el-radio-button>
        </el-radio-group>
        <el-button
          size="small"
          :disabled="!store.hasUnread"
          @click="handleMarkAllRead"
        >
          全部已读
        </el-button>
        <router-link to="/user/notification-settings">
          <el-button size="small" plain>通知设置</el-button>
        </router-link>
      </div>
    </div>

    <div v-if="store.loading" class="loading-area">
      <el-skeleton :rows="5" animated />
    </div>

    <template v-else-if="store.myNotices.length">
      <div class="notice-list">
        <NoticeItem
          v-for="notice in store.myNotices"
          :key="notice.id"
          :notice="notice"
          @click="handleNoticeClick"
        />
      </div>

      <div v-if="store.total > store.size" class="pagination-area">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="store.size"
          :total="store.total"
          layout="prev, pager, next"
          @current-change="loadNotices"
        />
      </div>
    </template>

    <el-empty v-else description="暂无通知" />

    <NoticeDetailDialog
      v-model:visible="detailVisible"
      :notice="detailNotice"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserNoticeStore } from '@/stores'
import type { UserNoticeVO } from '@/types/api-types'
import NoticeItem from './components/NoticeItem.vue'
import NoticeDetailDialog from './components/NoticeDetailDialog.vue'

const store = useUserNoticeStore()

const readFilter = ref<number | undefined>(undefined)
const currentPage = ref(1)
const detailVisible = ref(false)
const detailNotice = ref<UserNoticeVO | null>(null)

async function loadNotices(): Promise<void> {
  await store.fetchMyNotices({
    current: currentPage.value,
    size: store.size,
    isRead: readFilter.value,
  })
}

function handleFilterChange(): void {
  currentPage.value = 1
  loadNotices()
}

async function handleNoticeClick(notice: UserNoticeVO): Promise<void> {
  if (notice.isRead === 0) {
    await store.markAsRead(notice.id)
  }
  detailNotice.value = notice
  detailVisible.value = true
}

async function handleMarkAllRead(): Promise<void> {
  const success = await store.markAllAsRead()
  if (success) {
    ElMessage.success('已全部标记为已读')
  }
}

onMounted(() => {
  loadNotices()
  store.fetchUnreadCount()
})
</script>

<style scoped>
.notices-page {
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.loading-area {
  padding: 16px 0;
}

.notice-list {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.pagination-area {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
