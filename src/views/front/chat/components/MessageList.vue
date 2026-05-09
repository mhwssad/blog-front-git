<template>
  <div class="message-list" ref="listRef">
    <div v-if="loading" class="msg-loading">
      <el-skeleton :rows="4" animated />
    </div>
    <template v-else-if="messages.length">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-item"
        :class="{ 'is-self': msg.senderId === currentUserId }"
      >
        <el-avatar :size="32" :src="msg.senderAvatar ?? undefined">
          {{ (msg.senderNickname ?? '?').charAt(0) }}
        </el-avatar>
        <div class="msg-body">
          <div class="msg-sender">{{ msg.senderNickname }}</div>
          <div v-if="msg.revoked" class="msg-revoked">消息已撤回</div>
          <div v-else class="msg-bubble">
            <div v-if="msg.reply" class="msg-reply">
              <span class="reply-name">{{ msg.reply.senderNickname }}</span>
              : {{ msg.reply.content ?? '[文件]' }}
            </div>
            <!-- Image message -->
            <template v-if="msg.messageType === 'image' && msg.file">
              <el-image
                :src="msg.file.fileUrl"
                :preview-src-list="[msg.file.fileUrl]"
                fit="cover"
                class="msg-image"
                :style="{ maxWidth: '240px', maxHeight: '200px' }"
              />
              <span v-if="msg.content" class="msg-image-caption">{{ msg.content }}</span>
            </template>
            <!-- File message -->
            <template
              v-else-if="(msg.messageType === 'file' || msg.messageType === 'voice') && msg.file"
            >
              <div
                class="msg-file"
                @click="downloadFile(msg.file!.fileUrl, msg.file!.originalName)"
              >
                <el-icon size="24"><Document /></el-icon>
                <div class="msg-file-info">
                  <span class="msg-file-name">{{ msg.file.originalName }}</span>
                  <span class="msg-file-size">{{ formatFileSize(msg.file.fileSize) }}</span>
                </div>
              </div>
            </template>
            <!-- Text message -->
            <template v-else>
              <span>{{ msg.content }}</span>
            </template>
            <span v-if="msg.edited" class="msg-edited-tag">已编辑</span>
          </div>
          <div class="msg-meta">
            <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
            <span v-if="msg.senderId === currentUserId && deliveryStatus(msg)" class="msg-status">
              {{ deliveryStatus(msg) }}
            </span>
          </div>
        </div>
        <el-dropdown v-if="!msg.revoked" trigger="click" class="msg-actions">
          <el-icon class="msg-more"><MoreFilled /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-if="msg.senderId === currentUserId && msg.messageType === 'text'"
                @click="startEdit(msg)"
              >
                编辑
              </el-dropdown-item>
              <el-dropdown-item
                v-if="msg.senderId === currentUserId"
                @click="emit('revoke', msg.id)"
              >
                撤回
              </el-dropdown-item>
              <el-dropdown-item @click="emit('delete', msg.id)">删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </template>
    <el-empty v-else description="暂无消息" :image-size="64" />

    <!-- Inline edit dialog -->
    <el-dialog v-model="editVisible" title="编辑消息" width="400px" append-to-body>
      <el-input v-model="editContent" type="textarea" :rows="3" placeholder="修改消息内容..." />
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!editContent.trim()" @click="confirmEdit"
          >确定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
/**
 * 消息列表组件
 * @description 渲染聊天消息，支持文本/图片/文件类型，支持撤回、删除、编辑
 * @module front/chat/components/MessageList
 */
import { ref, watch, nextTick } from 'vue'
import { MoreFilled, Document } from '@element-plus/icons-vue'
import type { ChatMessageVO } from '@/types/api-types'

const props = defineProps<{
  messages: ChatMessageVO[]
  currentUserId?: number
  loading?: boolean
}>()

const emit = defineEmits<{
  revoke: [messageId: number]
  delete: [messageId: number]
  edit: [messageId: number, content: string]
}>()

const listRef = ref<HTMLElement | null>(null)
// 编辑弹窗相关状态
const editVisible = ref(false)
const editMessageId = ref(0)
const editContent = ref('')

function scrollToBottom(): void {
  nextTick(() => {
    if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
  })
}

watch(() => props.messages.length, scrollToBottom)

function formatTime(value: string | null | undefined): string {
  if (!value) return ''
  // Show only HH:mm for same-day messages
  const date = new Date(value)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 格式化文件大小（如 1.2 MB）
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// 下载文件（触发浏览器下载）
function downloadFile(url: string, filename: string): void {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// 获取消息送达状态文字
function deliveryStatus(msg: ChatMessageVO): string {
  if (msg.readByCurrentUser) return '已读'
  if (msg.deliveryStatus === 1 || msg.deliveryStatus === 2) return '已送达'
  return ''
}

// 打开编辑弹窗
function startEdit(msg: ChatMessageVO): void {
  editMessageId.value = msg.id
  editContent.value = msg.content ?? ''
  editVisible.value = true
}

// 确认编辑消息
function confirmEdit(): void {
  if (!editContent.value.trim()) return
  emit('edit', editMessageId.value, editContent.value.trim())
  editVisible.value = false
}
</script>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.msg-loading {
  padding: 16px 0;
}

.message-item {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.message-item.is-self {
  flex-direction: row-reverse;
}

.message-item.is-self .msg-body {
  align-items: flex-end;
}

.message-item.is-self .msg-bubble {
  background: var(--el-color-primary-light-9);
}

.msg-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 60%;
}

.msg-sender {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.msg-revoked {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  font-style: italic;
}

.msg-bubble {
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  position: relative;
}

.msg-reply {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 4px 8px;
  margin-bottom: 4px;
  border-left: 2px solid var(--el-color-primary-light-5);
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.reply-name {
  font-weight: 500;
  color: var(--el-color-primary);
}

.msg-image {
  border-radius: 6px;
  cursor: pointer;
  display: block;
}

.msg-image-caption {
  display: block;
  margin-top: 4px;
  font-size: 13px;
}

.msg-file {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
  cursor: pointer;
  min-width: 180px;
}

.msg-file:hover {
  background: var(--el-fill-color);
}

.msg-file-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.msg-file-name {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.msg-file-size {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.msg-edited-tag {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  margin-left: 6px;
}

.msg-meta {
  display: flex;
  gap: 6px;
  align-items: center;
}

.msg-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.msg-status {
  font-size: 10px;
  color: var(--el-color-primary-light-5);
}

.msg-actions {
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.message-item:hover .msg-actions {
  opacity: 1;
}

.msg-more {
  cursor: pointer;
  color: var(--el-text-color-placeholder);
  margin-top: 8px;
}
</style>
