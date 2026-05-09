<template>
  <div class="message-bubble" :class="[`message-bubble--${role}`]">
    <div class="bubble-shell" :class="{ 'is-error': errorMessage }">
      <div class="bubble-header">
        <span class="bubble-role">{{ roleLabel }}</span>
        <span v-if="tokenCount !== undefined" class="bubble-token">{{ tokenCount }} tokens</span>
      </div>

      <div class="bubble-content markdown-body" v-html="renderedHtml" />

      <div v-if="attachments?.length" class="bubble-block bubble-attachments">
        <div class="bubble-block__title">附件</div>
        <div class="attachment-list">
          <a
            v-for="item in attachments"
            :key="item.fileId"
            class="attachment-item"
            :href="item.fileUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img v-if="isImageAttachment(item)" :src="item.fileUrl" :alt="String(item.fileId)" />
            <div class="attachment-item__text">
              <span>{{ item.fileType }}</span>
              <span>#{{ item.fileId }}</span>
            </div>
          </a>
        </div>
      </div>

      <div v-if="references.length" class="bubble-block bubble-references">
        <div class="bubble-block__title">参考来源</div>
        <div class="reference-list">
          <a
            v-for="item in references"
            :key="`${item.entryId}-${item.sourceId}`"
            class="reference-item"
            :href="item.sourceUrl || '#'"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="reference-title">{{ item.title }}</span>
            <span class="reference-meta">
              {{ formatReferenceType(item.sourceType) }}
              <template v-if="item.score !== undefined"> · {{ item.score.toFixed(3) }}</template>
            </span>
          </a>
        </div>
      </div>

      <div v-if="errorMessage" class="bubble-error">
        <el-icon><WarningFilled /></el-icon>
        {{ errorMessage }}
      </div>
    </div>

    <div v-if="createdAt" class="bubble-time">{{ createdAt }}</div>
  </div>
</template>

<script lang="ts" setup>
/**
 * AI 消息气泡组件
 * @description 渲染用户/助手/系统消息，支持 Markdown、引用与附件展示
 * @module front/ai/components/AiMessageBubble
 */
import { computed } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'
import { markdownToHtml } from '@/utils/markdown'
import type { AiAttachmentVO, AiRagReferenceVO } from '@/types/api-types'

const props = defineProps<{
  role: 'user' | 'assistant' | 'system'
  content: string
  errorMessage?: string
  createdAt?: string
  tokenCount?: number
  attachments?: AiAttachmentVO[] | null
  ragReferences?: AiRagReferenceVO[] | null
}>()

const renderedHtml = computed(() => markdownToHtml(props.content || '') || '<p>-</p>')
const references = computed(() => props.ragReferences ?? [])

const roleLabelMap: Record<typeof props.role, string> = {
  user: '我',
  assistant: 'AI',
  system: '系统',
}

function formatReferenceType(value: string): string {
  const map: Record<string, string> = {
    public_article: '公开文章',
    forum_post: '论坛帖子',
    author_profile: '作者主页',
    admin_entry: '管理条目',
  }
  return map[value] ?? value
}

function isImageAttachment(item: AiAttachmentVO): boolean {
  return item.fileType === 'image' || item.mimeType?.startsWith('image/') === true
}

const roleLabel = computed(() => roleLabelMap[props.role])
</script>

<style scoped>
.message-bubble {
  display: flex;
  flex-direction: column;
  max-width: min(84%, 780px);
}

.message-bubble--user {
  align-self: flex-end;
}

.message-bubble--assistant {
  align-self: flex-start;
}

.message-bubble--system {
  align-self: center;
}

.bubble-shell {
  border: 1px solid var(--el-border-color-light);
  border-radius: 10px;
  background: var(--el-bg-color);
  padding: 14px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.message-bubble--user .bubble-shell {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
}

.message-bubble--system .bubble-shell {
  background: var(--el-fill-color-light);
}

.bubble-shell.is-error {
  border-color: var(--el-color-danger-light-5);
}

.bubble-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.bubble-role {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.bubble-token {
  font-variant-numeric: tabular-nums;
}

.bubble-content {
  color: var(--el-text-color-primary);
  line-height: 1.75;
  word-break: break-word;
}

.bubble-content :deep(p) {
  margin: 0 0 10px;
}

.bubble-content :deep(p:last-child) {
  margin-bottom: 0;
}

.bubble-content :deep(ul),
.bubble-content :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.bubble-content :deep(pre) {
  overflow: auto;
  margin: 10px 0;
  padding: 12px;
  border-radius: 8px;
  background: #0f172a;
  color: #e2e8f0;
}

.bubble-content :deep(code) {
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--el-fill-color);
}

.bubble-content :deep(pre code) {
  padding: 0;
  background: transparent;
}

.bubble-content :deep(blockquote) {
  margin: 10px 0;
  padding: 10px 12px;
  border-left: 3px solid var(--el-color-primary);
  background: var(--el-fill-color-light);
  border-radius: 6px;
}

.bubble-content :deep(a) {
  color: var(--el-color-primary);
  text-decoration: none;
}

.bubble-content :deep(a:hover) {
  text-decoration: underline;
}

.bubble-block {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.bubble-block__title {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.attachment-list,
.reference-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  background: var(--el-fill-color-blank);
}

.attachment-item img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
}

.attachment-item__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
}

.reference-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  background: var(--el-fill-color-blank);
}

.reference-item:hover {
  border-color: var(--el-color-primary-light-5);
}

.reference-title {
  font-size: 13px;
  font-weight: 500;
}

.reference-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.bubble-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  color: var(--el-color-danger);
  font-size: 12px;
}

.message-bubble--user .bubble-error {
  color: #dc2626;
}

.bubble-time {
  margin-top: 6px;
  padding: 0 4px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.message-bubble--user .bubble-time {
  text-align: right;
}
</style>
