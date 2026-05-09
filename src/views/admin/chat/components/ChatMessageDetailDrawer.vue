<template>
  <el-drawer
    :model-value="modelValue"
    :title="message ? `消息详情 #${message.id}` : '消息详情'"
    size="560px"
    @close="emit('update:modelValue', false)"
  >
    <div v-loading="loading" class="message-detail-drawer">
      <el-empty v-if="!message && !loading" description="请选择消息" />
      <template v-else-if="message">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="发送者">
            #{{ message.senderId }} / {{ message.senderNickname || message.senderUsername || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="消息类型">
            {{ formatChatMessageType(message.messageType) }}
          </el-descriptions-item>
          <el-descriptions-item label="消息内容">
            {{ formatOptionalText(message.content) }}
          </el-descriptions-item>
          <el-descriptions-item label="发送时间">
            {{ formatCreatedAt(message.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="撤回状态">
            <el-tag :type="message.revoked ? 'danger' : 'success'">
              {{ message.revoked ? '已撤回' : '正常' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="回执概览">
            {{ message.deliveredRecipientCount ?? 0 }}/{{
              message.totalRecipientCount ?? 0
            }}
            已送达， {{ message.readRecipientCount ?? 0 }} 已读
          </el-descriptions-item>
        </el-descriptions>

        <section v-if="message.reply" class="drawer-section">
          <div class="section-header">引用消息</div>
          <el-card shadow="never">
            <div class="reply-summary">
              <div class="reply-meta">
                #{{ message.reply.senderId }} /
                {{ message.reply.senderNickname || message.reply.senderUsername || '-' }}
              </div>
              <div class="reply-content">
                {{ formatOptionalText(message.reply.content) }}
              </div>
            </div>
          </el-card>
        </section>

        <section v-if="message.file" class="drawer-section">
          <div class="section-header">附件信息</div>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="文件名">{{
              message.file.originalName
            }}</el-descriptions-item>
            <el-descriptions-item label="文件大小">{{
              formatFileSize(message.file.fileSize)
            }}</el-descriptions-item>
            <el-descriptions-item label="文件地址">
              <el-link :href="message.file.fileUrl" target="_blank" type="primary">
                {{ message.file.fileUrl }}
              </el-link>
            </el-descriptions-item>
          </el-descriptions>
        </section>
      </template>
    </div>
  </el-drawer>
</template>

/** * 聊天消息详情抽屉 * @description
展示聊天消息的完整详情，包括发送者、消息内容、引用消息、附件信息、回执概览等 * @module
admin/chat/components/ChatMessageDetailDrawer * @see api/sys/chat.ts */
<script lang="ts" setup>
import type { ChatMessageVO } from '@/types/api-types'
import { FormatUtils } from '@/utils'
import { formatChatMessageType, formatCreatedAt, formatOptionalText } from '@/utils'

interface Props {
  modelValue: boolean
  message: ChatMessageVO | null
  loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function formatFileSize(size: number): string {
  return FormatUtils.formatFileSize(size)
}
</script>

<style scoped>
.message-detail-drawer {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.drawer-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  font-size: 15px;
  font-weight: 600;
}

.reply-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reply-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.reply-content {
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>
