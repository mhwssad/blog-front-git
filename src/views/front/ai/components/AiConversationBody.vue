<template>
  <template v-if="activeSession">
    <AiMessageBubble
      v-for="msg in messages"
      :key="msg.id"
      :role="msg.roleType as 'user' | 'assistant' | 'system'"
      :content="msg.content"
      :token-count="msg.tokenCount"
      :error-message="msg.responseStatus === 0 ? (msg.errorMessage ?? undefined) : undefined"
      :created-at="formatAITime(msg.createdAt)"
      :attachments="msg.attachments"
      :rag-references="msg.ragReferences"
    />

    <div v-if="sending" class="thinking-indicator">
      <span>正在生成</span>
      <span class="thinking-dots">
        <span class="dot" />
        <span class="dot" />
        <span class="dot" />
      </span>
    </div>

    <el-empty v-if="messages.length === 0 && !sending" description="暂无消息" />
  </template>

  <div v-else class="welcome-state">
    <div class="welcome-state__title">AI 助手</div>
    <div class="welcome-state__sub">选择会话或直接发起新请求</div>
    <div class="welcome-state__quick">
      <el-button
        v-for="prompt in promptPresets"
        :key="prompt"
        size="small"
        plain
        @click="$emit('promptClick', prompt)"
      >
        {{ prompt }}
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { AiMessageVO, AiSessionDetailVO } from '@/types/api-types'
import AiMessageBubble from './AiMessageBubble.vue'
import { formatAITime } from './ai-helpers'

defineProps<{
  messages: AiMessageVO[]
  sending: boolean
  promptPresets: string[]
  activeSession: AiSessionDetailVO | null
}>()

defineEmits<{
  promptClick: [prompt: string]
}>()
</script>

<style scoped>
.welcome-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 12px;
  padding: 32px 0;
}

.welcome-state__title {
  font-size: 22px;
  font-weight: 700;
}

.welcome-state__sub {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.welcome-state__quick {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.thinking-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.thinking-dots {
  display: inline-flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--el-text-color-placeholder);
  animation: dot-pulse 1.2s infinite ease-in-out both;
}

.dot:nth-child(2) {
  animation-delay: 0.15s;
}

.dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes dot-pulse {
  0%,
  80%,
  100% {
    opacity: 0.35;
    transform: scale(0.75);
  }

  40% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
