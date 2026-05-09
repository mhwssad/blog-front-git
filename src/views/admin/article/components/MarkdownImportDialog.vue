<template>
  <el-dialog
    :model-value="visible"
    title="导入 Markdown"
    width="960px"
    align-center
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="import-split">
      <div class="import-input">
        <div class="import-bar">
          <span>Markdown 源码</span>
          <el-button size="small" @click="emit('clear')">清空</el-button>
        </div>
        <textarea
          :value="draft"
          class="import-textarea"
          placeholder="请输入 Markdown 内容..."
          @input="emit('update:draft', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>
      <div class="import-preview">
        <div class="import-bar"><span>HTML 预览</span></div>
        <div class="preview-scroll">
          <article v-if="previewHtml" class="article-body" v-html="previewHtml" />
          <el-empty v-else description="输入 Markdown 后自动预览" :image-size="48" />
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :disabled="!draft.trim()" @click="emit('apply')"
        >转换并应用</el-button
      >
    </template>
  </el-dialog>
</template>

/** * Markdown导入对话框 * @description
将Markdown格式文本转换为HTML并导入到文章编辑器，支持实时预览转换结果 * @module
admin/article/components/MarkdownImportDialog * @see utils/markdown.ts */ /** * Markdown导入对话框 *
@description 将Markdown格式文本转换为HTML并导入到文章编辑器，支持实时预览转换结果 * @module
admin/article/components/MarkdownImportDialog * @see utils/markdown.ts */
<script lang="ts" setup>
import { computed } from 'vue'
import { markdownToHtml } from '@/utils/markdown'
import { normalizeHtml } from './article-editor'

interface Props {
  visible: boolean
  draft: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'update:draft', value: string): void
  (e: 'clear'): void
  (e: 'apply'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const previewHtml = computed(() => normalizeHtml(markdownToHtml(props.draft)))
</script>

<style scoped>
.import-split {
  display: flex;
  height: 400px;
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-white);
}

.import-input,
.import-preview {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.import-input {
  border-right: 1px solid var(--color-border-light);
}

.import-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border-lighter);
  background: var(--color-gray-50);
  font-size: 12px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.import-textarea {
  flex: 1;
  width: 100%;
  padding: 16px;
  border: none;
  resize: none;
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  font-family: var(--font-family-mono);
  font-size: 14px;
  line-height: 1.75;
}

.preview-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
}

.article-body {
  color: var(--color-text-primary);
  line-height: 1.9;
  word-break: break-word;
}

.article-body :deep(h1),
.article-body :deep(h2),
.article-body :deep(h3),
.article-body :deep(h4) {
  margin: 0.8em 0 0.4em;
  font-weight: 700;
}

.article-body :deep(p),
.article-body :deep(ul),
.article-body :deep(ol),
.article-body :deep(blockquote),
.article-body :deep(pre) {
  margin: 0 0 0.8em;
}

.article-body :deep(pre) {
  overflow: auto;
  padding: 12px;
  border-radius: 6px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 13px;
}

.article-body :deep(code) {
  padding: 0.15em 0.35em;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.08);
  font-family: var(--font-family-mono);
}

.article-body :deep(pre code) {
  padding: 0;
  background: transparent;
  color: inherit;
}

.article-body :deep(blockquote) {
  padding: 8px 12px;
  border-left: 4px solid rgba(59, 130, 246, 0.35);
  background: rgba(59, 130, 246, 0.06);
}

@media (max-width: 768px) {
  .import-split {
    flex-direction: column;
    height: auto;
    min-height: 400px;
  }

  .import-input {
    border-right: none;
    border-bottom: 1px solid var(--color-border-light);
    min-height: 200px;
  }

  .import-preview {
    min-height: 200px;
  }
}
</style>
