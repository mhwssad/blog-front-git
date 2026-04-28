<template>
  <div class="hall-page">
    <h1 class="page-title">聊天大厅</h1>

    <HallAnnouncement content="欢迎来到聊天大厅，请文明发言，遵守社区规范。" />

    <div class="hall-container">
      <HallMessageList :messages="messages" />

      <div class="hall-input-area">
        <template v-if="!isLoggedIn">
          <div class="input-notice">登录后可以发言</div>
        </template>
        <template v-else-if="!isLevelEnough">
          <LevelRequirementTip :required-level="2" :user-level="1" feature="大厅发言" />
        </template>
        <template v-else>
          <HallMessageInput :disabled="false" @send="handleSend" />
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import HallAnnouncement from './components/HallAnnouncement.vue'
import HallMessageList from './components/HallMessageList.vue'
import type { HallMessage } from './components/HallMessageList.vue'
import HallMessageInput from './components/HallMessageInput.vue'
import LevelRequirementTip from '@/components/common/LevelRequirementTip.vue'

const isLoggedIn = ref(false)
const isLevelEnough = ref(false)
const messages = ref<HallMessage[]>([])

let nextId = 1

function addSystemMessage(content: string): void {
  messages.value.push({
    id: nextId++,
    username: '',
    level: 0,
    content,
    time: new Date().toLocaleTimeString(),
    isSystem: true,
  })
}

function handleSend(content: string): void {
  messages.value.push({
    id: nextId++,
    username: '当前用户',
    level: 3,
    content,
    time: new Date().toLocaleTimeString(),
    isSystem: false,
  })
}

onMounted(() => {
  addSystemMessage('欢迎来到聊天大厅')
  addSystemMessage('用户 小明 加入了大厅')
  messages.value.push({
    id: nextId++,
    username: '小明',
    level: 5,
    content: '大家好！',
    time: new Date().toLocaleTimeString(),
    isSystem: false,
  })
  messages.value.push({
    id: nextId++,
    username: '小红',
    level: 3,
    content: '欢迎欢迎～',
    time: new Date().toLocaleTimeString(),
    isSystem: false,
  })
})
</script>

<style scoped>
.hall-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  margin: 0 0 24px;
  font-size: 22px;
  font-weight: 700;
}

.hall-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 220px);
  min-height: 400px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
}

.hall-input-area {
  flex-shrink: 0;
}

.input-notice {
  padding: 14px 16px;
  text-align: center;
  font-size: 14px;
  color: var(--el-text-color-placeholder);
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
