<template>
  <div class="hall-message-input">
    <el-input
      v-model="text"
      placeholder="发送一条消息..."
      @keydown.enter.exact.prevent="handleSend"
    >
      <template #append>
        <el-button type="primary" :disabled="disabled || !text.trim()" @click="handleSend">
          发送
        </el-button>
      </template>
    </el-input>
  </div>
</template>

<script lang="ts" setup>
/**
 * 大厅消息输入组件
 * @description 简化版输入框，回车发送消息，用于大厅聊天
 * @module front/hall/components/HallMessageInput
 */
import { ref } from 'vue'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
}>()

const text = ref('')

// 发送消息（清空输入框）
function handleSend(): void {
  if (!text.value.trim()) return
  emit('send', text.value.trim())
  text.value = ''
}
</script>

<style scoped>
.hall-message-input {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
