<template>
  <div :class="['message-bubble', `message-bubble--${role}`]">
    <div class="bubble-content">
      {{ content }}
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  role: 'user' | 'assistant'
  content: string
}>()
</script>

<style scoped>
.message-bubble {
  display: flex;
  max-width: 75%;
}

.message-bubble--user {
  align-self: flex-end;
  justify-content: flex-end;
}

.message-bubble--user .bubble-content {
  background: var(--el-color-primary);
  color: #fff;
  border-radius: 12px 12px 4px 12px;
}

.message-bubble--assistant {
  align-self: flex-start;
  justify-content: flex-start;
}

.message-bubble--assistant .bubble-content {
  background: #f4f4f5;
  color: var(--el-text-color-primary);
  border-radius: 12px 12px 12px 4px;
}

.bubble-content {
  padding: 10px 16px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}
</style>
