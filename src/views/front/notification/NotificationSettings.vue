<template>
  <div class="notification-settings-page">
    <div class="page-header">
      <h1 class="page-title">通知设置</h1>
      <el-button type="primary" :loading="saving" @click="handleSave">保存设置</el-button>
    </div>

    <el-card v-loading="store.loading" shadow="never" class="settings-card">
      <div class="settings-section">
        <div class="section-title">评论与互动</div>
        <div class="setting-list">
          <div v-for="item in interactionTypes" :key="item.type" class="setting-item">
            <div>
              <div class="setting-label">{{ findLabel(item.type) }}</div>
              <div class="setting-desc">{{ findDesc(item.type) }}</div>
            </div>
            <el-switch v-model="item.enabled" />
          </div>
        </div>
      </div>

      <el-divider />

      <div class="settings-section">
        <div class="section-title">社交关系</div>
        <div class="setting-list">
          <div v-for="item in socialTypes" :key="item.type" class="setting-item">
            <div>
              <div class="setting-label">{{ findLabel(item.type) }}</div>
              <div class="setting-desc">{{ findDesc(item.type) }}</div>
            </div>
            <el-switch v-model="item.enabled" />
          </div>
        </div>
      </div>

      <el-divider />

      <div class="settings-section">
        <div class="section-title">系统消息</div>
        <div class="setting-list">
          <div v-for="item in systemTypes" :key="item.type" class="setting-item">
            <div>
              <div class="setting-label">{{ findLabel(item.type) }}</div>
              <div class="setting-desc">{{ findDesc(item.type) }}</div>
            </div>
            <el-switch v-model="item.enabled" />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
/**
 * 通知设置页面
 * @description 用户管理各类通知的开关（评论、互动、社交、系统等）
 * @module front/notification/NotificationSettings
 * @see ../../api/user/notification.ts
 */
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useNotificationSettingsStore } from '@/stores'
import type { UserNotificationSettingItemVO } from '@/types/api-types'

const store = useNotificationSettingsStore()
const saving = ref(false)

// 互动类通知的 keys
const interactionKeys = ['comment_article', 'like_article', 'collect_article']
// 社交类通知的 keys
const socialKeys = ['new_follower', 'group_mention']
// 系统类通知的 keys
const systemKeys = [
  'private_message',
  'channel_announcement',
  'system_announcement',
  'ai_task_complete',
]

const descriptions: Record<string, string> = {
  comment_article: '有人评论你发布的文章时通知你',
  like_article: '有人点赞你发布的文章时通知你',
  collect_article: '有人收藏你发布的文章时通知你',
  new_follower: '有新用户关注你时通知你',
  group_mention: '群聊中有人 @ 你时通知你',
  private_message: '有人给你发送私信时通知你',
  channel_announcement: '频道发布新公告时通知你',
  system_announcement: '系统发布重要公告时通知你',
  ai_task_complete: 'AI 处理任务完成时通知你',
}

const interactionTypes = computed(() =>
  store.settings.filter(s => interactionKeys.includes(s.type))
)
const socialTypes = computed(() => store.settings.filter(s => socialKeys.includes(s.type)))
const systemTypes = computed(() => store.settings.filter(s => systemKeys.includes(s.type)))

function findLabel(type: string): string {
  return store.settings.find(s => s.type === type)?.label ?? type
}

function findDesc(type: string): string {
  return descriptions[type] ?? ''
}

/** 保存通知设置 */
async function handleSave(): Promise<void> {
  saving.value = true
  try {
    const settings: Array<{ type: string; enabled: boolean }> = store.settings.map(s => ({
      type: s.type,
      enabled: s.enabled,
    }))
    const success = await store.batchUpdateSettings({ settings })
    if (success) {
      ElMessage.success('通知设置已保存')
    } else {
      ElMessage.error('保存失败')
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void store.fetchSettings()
})
</script>

<style scoped>
.notification-settings-page {
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

.settings-card {
  border-radius: 12px;
}

.settings-section {
  padding: 4px 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.setting-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  transition: background 0.2s;
}

.setting-item:hover {
  background: var(--el-fill-color-lighter);
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.setting-desc {
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
