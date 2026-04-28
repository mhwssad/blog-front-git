<template>
  <div class="channel-detail-page">
    <div class="channel-header">
      <div class="channel-header-left">
        <h2 class="channel-name"># {{ channel.name }}</h2>
        <span class="channel-meta">
          {{ channel.memberCount }} 成员 · {{ channel.onlineCount }} 在线
        </span>
      </div>
      <div class="channel-header-right">
        <el-button
          :type="channel.joined ? 'default' : 'primary'"
          @click="toggleJoin"
        >
          {{ channel.joined ? '已加入' : '加入' }}
        </el-button>
        <el-button v-if="channel.joined" @click="$router.push(`/channel/${channelId}/settings`)">
          设置
        </el-button>
      </div>
    </div>

    <div v-if="channel.announcement" class="announcement-bar">
      <el-icon><InfoFilled /></el-icon>
      <span>{{ channel.announcement }}</span>
    </div>

    <div class="message-list">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-item"
      >
        <span class="message-username">{{ msg.username }}</span>
        <span class="message-content">{{ msg.content }}</span>
        <span class="message-time">{{ msg.time }}</span>
      </div>
      <el-empty v-if="messages.length === 0" description="暂无消息" />
    </div>

    <div class="message-input-area">
      <el-input
        v-model="inputText"
        placeholder="输入消息..."
        @keyup.enter="sendMessage"
      />
      <el-button type="primary" :disabled="!inputText.trim()" @click="sendMessage">
        发送
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

const route = useRoute()
const channelId = Number(route.params.id)

const channel = ref({
  id: channelId,
  name: '前端技术',
  memberCount: 128,
  onlineCount: 32,
  joined: true,
  announcement: '欢迎来到前端技术频道，请遵守社区规范，友善交流。',
})

interface Message {
  id: number
  username: string
  content: string
  time: string
}

const messages = ref<Message[]>([
  { id: 1, username: '张三', content: '大家好，今天研究了 Vue 3.5 的新特性', time: '10:30' },
  { id: 2, username: '李四', content: '响应式系统有了很大改进', time: '10:32' },
  { id: 3, username: '王五', content: '推荐看看 Reactivity Transform', time: '10:35' },
  { id: 4, username: '赵六', content: '有没有人用过 Pinia 做大型项目状态管理？', time: '10:40' },
  { id: 5, username: '张三', content: '我们项目一直在用，体验很好', time: '10:42' },
])

const inputText = ref('')

function toggleJoin(): void {
  channel.value.joined = !channel.value.joined
  if (channel.value.joined) {
    ElMessage.success('已加入频道')
  } else {
    ElMessage.info('已退出频道')
  }
}

function sendMessage(): void {
  if (!inputText.value.trim()) return
  messages.value.push({
    id: Date.now(),
    username: '我',
    content: inputText.value.trim(),
    time: new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
  })
  inputText.value = ''
}
</script>

<style scoped>
.channel-detail-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  box-sizing: border-box;
}

.channel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.channel-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.channel-name {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.channel-meta {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.channel-header-right {
  display: flex;
  gap: 8px;
}

.announcement-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--el-color-primary-light-9);
  border-radius: 6px;
  font-size: 13px;
  color: var(--el-color-primary-dark-2);
  margin-bottom: 16px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.message-item {
  padding: 8px 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.message-username {
  font-weight: 600;
  font-size: 14px;
  color: var(--el-color-primary);
  white-space: nowrap;
}

.message-content {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
}

.message-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

.message-input-area {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
