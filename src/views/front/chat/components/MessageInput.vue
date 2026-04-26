<template>
  <div class="message-input">
    <el-input
      v-model="text"
      type="textarea"
      :rows="2"
      placeholder="输入消息..."
      resize="none"
      @keydown.enter.exact.prevent="handleSend"
    />
    <el-button type="primary" :loading="sending" :disabled="!text.trim()" @click="handleSend">
      发送
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

defineProps<{
  sending?: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
}>()

const text = ref('')

function handleSend(): void {
  if (!text.value.trim()) return
  emit('send', text.value.trim())
  text.value = ''
}
</script>

<style scoped>
.message-input {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.message-input :deep(.el-textarea__inner) {
  padding: 8px 12px;
}
</style>
