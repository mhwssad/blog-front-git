<template>
  <div class="notification-settings-page">
    <div class="page-header">
      <h1 class="page-title">通知设置</h1>
      <el-button type="primary" :loading="saving" @click="handleSave">保存设置</el-button>
    </div>

    <el-card shadow="never" class="settings-card">
      <div class="settings-section">
        <div class="section-title">评论与互动</div>
        <div class="setting-list">
          <div v-for="item in interactionSettings" :key="item.key" class="setting-item">
            <div>
              <div class="setting-label">{{ item.label }}</div>
              <div class="setting-desc">{{ item.desc }}</div>
            </div>
            <el-switch v-model="settings[item.key]" />
          </div>
        </div>
      </div>

      <el-divider />

      <div class="settings-section">
        <div class="section-title">社交关系</div>
        <div class="setting-list">
          <div v-for="item in socialSettings" :key="item.key" class="setting-item">
            <div>
              <div class="setting-label">{{ item.label }}</div>
              <div class="setting-desc">{{ item.desc }}</div>
            </div>
            <el-switch v-model="settings[item.key]" />
          </div>
        </div>
      </div>

      <el-divider />

      <div class="settings-section">
        <div class="section-title">系统消息</div>
        <div class="setting-list">
          <div v-for="item in systemSettings" :key="item.key" class="setting-item">
            <div>
              <div class="setting-label">{{ item.label }}</div>
              <div class="setting-desc">{{ item.desc }}</div>
            </div>
            <el-switch v-model="settings[item.key]" />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

interface NotificationSettings {
  commentArticle: boolean
  likeArticle: boolean
  collectArticle: boolean
  newFollower: boolean
  groupMention: boolean
  privateMessage: boolean
  channelAnnouncement: boolean
  systemAnnouncement: boolean
  aiTaskComplete: boolean
}

const settings = reactive<NotificationSettings>({
  commentArticle: true,
  likeArticle: true,
  collectArticle: false,
  newFollower: true,
  groupMention: true,
  privateMessage: true,
  channelAnnouncement: true,
  systemAnnouncement: true,
  aiTaskComplete: false,
})

const saving = ref(false)

const interactionSettings = [
  { key: 'commentArticle' as const, label: '评论我的文章', desc: '有人评论你发布的文章时通知你' },
  { key: 'likeArticle' as const, label: '点赞我的文章', desc: '有人点赞你发布的文章时通知你' },
  { key: 'collectArticle' as const, label: '收藏我的文章', desc: '有人收藏你发布的文章时通知你' },
]

const socialSettings = [
  { key: 'newFollower' as const, label: '有人关注我', desc: '有新用户关注你时通知你' },
  { key: 'groupMention' as const, label: '群聊有人 @ 我', desc: '群聊中有人 @ 你时通知你' },
]

const systemSettings = [
  { key: 'privateMessage' as const, label: '收到私聊', desc: '有人给你发送私信时通知你' },
  { key: 'channelAnnouncement' as const, label: '频道公告', desc: '频道发布新公告时通知你' },
  { key: 'systemAnnouncement' as const, label: '系统公告', desc: '系统发布重要公告时通知你' },
  { key: 'aiTaskComplete' as const, label: 'AI 任务完成', desc: 'AI 处理任务完成时通知你' },
]

async function handleSave(): Promise<void> {
  saving.value = true
  await new Promise((r) => setTimeout(r, 500))
  saving.value = false
  ElMessage.success('通知设置已保存')
}
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
