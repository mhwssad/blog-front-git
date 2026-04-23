<template>
  <el-card shadow="never" class="editor-main-card">
    <template #header>
      <div class="card-header">
        <div>
          <span>正文编辑</span>
          <p class="card-header__tip">预览标签页显示渲染效果，HTML 标签页使用 CodeMirror 编辑源码。</p>
        </div>
        <el-button size="small" @click="emit('import-markdown')">导入 Markdown</el-button>
      </div>
    </template>

    <el-form-item label="文章标题" prop="title">
      <el-input v-model="formData.title" maxlength="128" show-word-limit placeholder="请输入文章标题" />
    </el-form-item>

    <el-form-item label="文章摘要" prop="summary">
      <el-input
        v-model="formData.summary"
        type="textarea"
        :rows="4"
        maxlength="2000"
        show-word-limit
        resize="vertical"
        placeholder="请输入文章摘要"
      />
    </el-form-item>

    <el-form-item label="正文内容" prop="content">
      <el-tabs :model-value="activeTab" class="editor-tabs" @update:model-value="handleTabChange">
        <el-tab-pane label="渲染预览" name="preview">
          <div class="editor-shell preview-shell">
            <div class="preview-shell__toolbar">
              <span>当前显示将要保存的正文渲染结果</span>
              <el-button size="small" @click="emit('update:activeTab', 'html')">编辑 HTML</el-button>
            </div>
            <div class="preview-shell__content">
              <article v-if="previewHtml" class="preview-article" v-html="previewHtml" />
              <el-empty v-else description="暂无正文内容，请切换到 HTML 标签页输入内容或导入 Markdown。" />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="原 HTML" name="html">
          <div class="html-source">
            <div class="html-source__toolbar">
              <span>当前显示将要保存的 HTML 内容</span>
              <div class="html-source__actions">
                <el-button size="small" @click="handleFormat">格式化</el-button>
                <el-button size="small" type="primary" @click="emit('update:activeTab', 'preview')">
                  查看预览
                </el-button>
              </div>
            </div>
            <HtmlCodeEditor :model-value="htmlSource" class="html-source__textarea" @update:model-value="updateHtml" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-form-item>
  </el-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import HtmlCodeEditor from '@/components/editor/HtmlCodeEditor.vue'
import type { ArticleSaveRequest } from '@/api/types'
import { formatArticleHtml, normalizeArticleHtml, type EditorTab } from './article-editor'

interface Props {
  formData: ArticleSaveRequest
  htmlSource: string
  activeTab: EditorTab
}

interface Emits {
  (e: 'update:htmlSource', value: string): void
  (e: 'update:activeTab', value: EditorTab): void
  (e: 'import-markdown'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 预览区直接消费当前 HTML 源码的清洗结果，确保“所见即所得”和最终提交一致。
const previewHtml = computed(() => normalizeArticleHtml(props.htmlSource))

function updateHtml(value: string): void {
  emit('update:htmlSource', value)
}

function handleFormat(): void {
  // 只做结构化换行，不改写标签语义，避免编辑器自动格式化带来意外内容变动。
  emit('update:htmlSource', formatArticleHtml(props.htmlSource))
}

function handleTabChange(value: string | number): void {
  emit('update:activeTab', value as EditorTab)
}
</script>

<style scoped>
.editor-main-card {
  border-radius: 16px;
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.card-header__tip {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.editor-tabs :deep(.el-tabs__header) {
  margin-bottom: 12px;
}

.editor-shell,
.html-source {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: var(--article-editor-pane-height);
  height: var(--article-editor-pane-height);
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 14px;
  background: #fff;
}

.preview-shell__toolbar,
.html-source__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.preview-shell__content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 20px 22px 140px;
}

.preview-article {
  color: var(--el-text-color-primary);
  line-height: 1.9;
  word-break: break-word;
}

.preview-article :deep(*) {
  max-width: 100%;
}

.preview-article :deep(h1),
.preview-article :deep(h2),
.preview-article :deep(h3),
.preview-article :deep(h4),
.preview-article :deep(h5),
.preview-article :deep(h6) {
  margin: 1.2em 0 0.6em;
  font-weight: 700;
  line-height: 1.35;
}

.preview-article :deep(p),
.preview-article :deep(ul),
.preview-article :deep(ol),
.preview-article :deep(blockquote),
.preview-article :deep(pre),
.preview-article :deep(table) {
  margin: 0 0 1em;
}

.preview-article :deep(ul),
.preview-article :deep(ol) {
  padding-left: 1.5em;
}

.preview-article :deep(blockquote) {
  margin-left: 0;
  padding: 12px 16px;
  border-left: 4px solid rgba(59, 130, 246, 0.35);
  border-radius: 0 12px 12px 0;
  background: rgba(59, 130, 246, 0.06);
  color: var(--el-text-color-regular);
}

.preview-article :deep(pre) {
  overflow: auto;
  padding: 16px 18px;
  border-radius: 12px;
  background: #0f172a;
  color: #e2e8f0;
}

.preview-article :deep(code) {
  padding: 0.15em 0.35em;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.08);
  font-family: var(--font-family-mono);
}

.preview-article :deep(pre code) {
  padding: 0;
  background: transparent;
  color: inherit;
}

.preview-article :deep(table) {
  width: 100%;
  border-collapse: collapse;
}

.preview-article :deep(th),
.preview-article :deep(td) {
  padding: 10px 12px;
  border: 1px solid var(--el-border-color-light);
  text-align: left;
}

.preview-article :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 12px;
}

.html-source__actions {
  display: inline-flex;
  gap: 8px;
}

.html-source__textarea {
  width: 100%;
  flex: 1;
  min-height: 0;
  height: 100%;
}

@media (max-width: 768px) {
  .card-header,
  .preview-shell__toolbar,
  .html-source__toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
