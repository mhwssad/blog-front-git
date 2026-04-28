<template>
  <div class="ai-assistant-page">
    <div class="page-header">
      <h2 class="page-title">AI 助手</h2>
      <div class="header-actions">
        <el-tag type="info" effect="plain">今日剩余: {{ remainCount }} 次</el-tag>
        <el-button size="small" @click="showQuotaDetail">额度明细</el-button>
      </div>
    </div>

    <div class="chat-area" ref="chatAreaRef">
      <AiMessageBubble
        v-for="msg in messages"
        :key="msg.id"
        :role="msg.role"
        :content="msg.content"
      />
      <div v-if="loading" class="thinking-indicator">
        <span class="thinking-text">正在思考...</span>
        <span class="thinking-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </span>
      </div>
    </div>

    <div class="quick-questions">
      <el-button
        v-for="q in quickQuestions"
        :key="q"
        size="small"
        round
        @click="sendQuickQuestion(q)"
      >
        {{ q }}
      </el-button>
    </div>

    <div class="input-area">
      <el-input
        v-model="inputText"
        placeholder="输入你的问题..."
        @keyup.enter="sendMessage"
      />
      <el-button type="primary" :disabled="!inputText.trim() || loading" @click="sendMessage">
        发送
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import AiMessageBubble from './components/AiMessageBubble.vue'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<Message[]>([
  {
    id: 1,
    role: 'assistant',
    content: '你好！我是 AI 助手，有什么可以帮助你的吗？你可以直接输入问题，或者点击下方的快捷问题开始对话。',
  },
])

const inputText = ref('')
const loading = ref(false)
const remainCount = ref(20)
const chatAreaRef = ref<HTMLElement | null>(null)

const quickQuestions = [
  'Vue3 有哪些新特性',
  'TypeScript 入门指南',
  '如何学习前端开发',
  'React 和 Vue 的区别',
]

const mockReplies: Record<string, string> = {
  'Vue3 有哪些新特性':
    'Vue 3 的主要新特性包括：\n\n1. Composition API — 提供更灵活的逻辑组织和复用\n2. 更好的 TypeScript 支持\n3. Teleport 组件 — 将内容渲染到 DOM 中的任意位置\n4. Fragments — 支持多根节点组件\n5. Suspense — 处理异步组件加载\n6. 更小的打包体积和更好的性能',
  'TypeScript 入门指南':
    'TypeScript 入门建议：\n\n1. 先掌握 JavaScript 基础\n2. 学习基本类型注解：string, number, boolean\n3. 理解接口（interface）和类型别名（type）\n4. 学习泛型的使用\n5. 在实际项目中逐步引入\n\n推荐从官方文档开始：www.typescriptlang.org',
  '如何学习前端开发':
    '前端学习路径建议：\n\n1. HTML + CSS 基础 — 网页结构和样式\n2. JavaScript — 编程基础和 DOM 操作\n3. 版本控制 — Git 基本使用\n4. 框架学习 — Vue 或 React\n5. 构建工具 — Vite、Webpack\n6. TypeScript — 类型安全\n7. 项目实战 — 做完整项目练习',
  'React 和 Vue 的区别':
    'React 和 Vue 的主要区别：\n\n1. 模板语法：Vue 使用模板，React 使用 JSX\n2. 响应式：Vue 自动追踪依赖，React 需要手动触发更新\n3. 状态管理：Vue 用 Pinia，React 用 Redux/Zustand\n4. 学习曲线：Vue 更平缓，React 更灵活\n5. 生态系统：React 更大，Vue 更统一\n\n两者都很优秀，选择适合团队的即可。',
}

function scrollToBottom(): void {
  nextTick(() => {
    if (chatAreaRef.value) {
      chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight
    }
  })
}

function sendMessage(): void {
  if (!inputText.value.trim() || loading.value) return

  const userMessage: Message = {
    id: Date.now(),
    role: 'user',
    content: inputText.value.trim(),
  }
  messages.value.push(userMessage)
  const question = inputText.value.trim()
  inputText.value = ''
  scrollToBottom()

  loading.value = true
  setTimeout(() => {
    const reply =
      mockReplies[question] ??
      `这是一个关于「${question}」的好问题！让我为你分析一下...\n\n这个问题涉及多个方面，建议你可以从基础概念入手，逐步深入学习。如果需要更详细的解答，欢迎继续提问。`
    messages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: reply,
    })
    loading.value = false
    remainCount.value = Math.max(0, remainCount.value - 1)
    scrollToBottom()
  }, 1000)
}

function sendQuickQuestion(question: string): void {
  inputText.value = question
  sendMessage()
}

function showQuotaDetail(): void {
  ElMessage.info('额度明细功能开发中')
}
</script>

<style scoped>
.ai-assistant-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 12px;
}

.thinking-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  align-self: flex-start;
}

.thinking-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.thinking-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-text-color-placeholder);
  animation: dot-pulse 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot-pulse {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: scale(0.6);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.input-area {
  display: flex;
  gap: 8px;
}
</style>
