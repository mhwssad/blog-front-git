<template>
  <div class="message-input">
    <div class="input-actions">
      <el-upload :show-file-list="false" :before-upload="handleImageUpload" accept="image/*">
        <el-button text title="发送图片">
          <el-icon><Picture /></el-icon>
        </el-button>
      </el-upload>
      <el-upload :show-file-list="false" :before-upload="handleFileUpload">
        <el-button text title="发送文件">
          <el-icon><Document /></el-icon>
        </el-button>
      </el-upload>
    </div>
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
/**
 * 消息输入框组件
 * @description 支持文本消息发送、图片和文件上传
 * @module front/chat/components/MessageInput
 */
import { ref } from 'vue'
import { Picture, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadRawFile } from 'element-plus'

defineProps<{
  sending?: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
  sendFile: [file: File]
}>()

const text = ref('')

// 发送文本消息
function handleSend(): void {
  if (!text.value.trim()) return
  emit('send', text.value.trim())
  text.value = ''
}

// 图片上传前校验（大小不超过 10MB）
function handleImageUpload(file: UploadRawFile): boolean {
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 10MB')
    return false
  }
  emit('sendFile', file)
  return false
}

// 文件上传前校验（大小不超过 50MB）
function handleFileUpload(file: UploadRawFile): boolean {
  if (file.size > 50 * 1024 * 1024) {
    ElMessage.warning('文件大小不能超过 50MB')
    return false
  }
  emit('sendFile', file)
  return false
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

.input-actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 4px;
}

.input-actions :deep(.el-button) {
  padding: 4px;
  font-size: 18px;
}

.message-input :deep(.el-textarea__inner) {
  padding: 8px 12px;
}
</style>
