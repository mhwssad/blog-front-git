<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <div class="notice-wrapper">
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
        <button class="action-btn">
          <el-icon :size="18">
            <Bell />
          </el-icon>
        </button>
      </el-badge>
    </div>
    <template #dropdown>
      <el-dropdown-menu class="notice-dropdown">
        <div class="notice-header">
          <span class="notice-title">通知</span>
          <el-link type="primary" :underline="false" @click="handleMarkAll">
            全部已读
          </el-link>
        </div>
        <div class="notice-list" v-loading="loading">
          <template v-if="noticeList.length > 0">
            <el-dropdown-item
              v-for="item in noticeList"
              :key="item.id"
              :class="{ 'is-read': item.isRead === 1 }"
              @click="handleNoticeClick(item)"
            >
              <div class="notice-item">
                <div class="notice-item-title">{{ item.title }}</div>
                <div class="notice-item-content">{{ item.content }}</div>
                <div class="notice-item-time">{{ formatTime(item.createTime) }}</div>
              </div>
            </el-dropdown-item>
          </template>
          <el-empty v-else description="暂无通知" :image-size="80" />
        </div>
        <div class="notice-footer">
          <el-link type="primary" :underline="false" @click="handleViewAll">
            查看全部
          </el-link>
        </div>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserNoticeStore } from '@/stores'
import { ElMessage } from 'element-plus'
import type { UserNoticeVO } from '@/api/types'

const router = useRouter()
const userNoticeStore = useUserNoticeStore()

const loading = ref(false)
const noticeList = ref<UserNoticeVO[]>([])

const unreadCount = computed(() => userNoticeStore.unreadCount)

// 获取通知列表
async function fetchNoticeList() {
  loading.value = true
  try {
    await userNoticeStore.fetchMyNotices({ current: 1, size: 5 })
    noticeList.value = userNoticeStore.myNotices
  } finally {
    loading.value = false
  }
}

// 格式化时间
function formatTime(time: string): string {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  }
  // 小于1天
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  }
  // 大于1天
  return date.toLocaleDateString()
}

// 点击通知
async function handleNoticeClick(item: UserNoticeVO) {
  if (item.isRead === 0) {
    await userNoticeStore.markAsRead(item.id)
    item.isRead = 1
  }
  // 这里可以跳转到相关页面
  ElMessage.success(item.title)
}

// 全部标记已读
async function handleMarkAll() {
  const success = await userNoticeStore.markAllAsRead()
  if (success) {
    ElMessage.success('已全部标记为已读')
    await fetchNoticeList()
  }
}

// 查看全部
function handleViewAll() {
  router.push('/admin/notices')
}

// 处理下拉菜单命令
function handleCommand(command: string) {
  // 可以在这里处理其他命令
}

onMounted(() => {
  fetchNoticeList()
  userNoticeStore.fetchUnreadCount()
})
</script>

<style scoped>
.notice-wrapper {
  display: flex;
  align-items: center;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-regular);
  background-color: transparent;
  border-radius: 4px;
  transition: all 0.3s;
}

.action-btn:hover {
  color: var(--color-primary);
  background-color: var(--color-gray-100);
}

.notice-dropdown {
  width: 360px;
}

.notice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-base);
}

.notice-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.notice-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;
}

.notice-list :deep(.el-dropdown-item) {
  padding: 0;
  line-height: normal;
}

.notice-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.notice-item:hover {
  background-color: var(--color-gray-50);
}

.notice-item.is-read {
  opacity: 0.6;
}

.notice-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.notice-item-content {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-item-time {
  font-size: 12px;
  color: var(--color-text-placeholder);
}

.notice-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--color-border-base);
  text-align: center;
}
</style>
