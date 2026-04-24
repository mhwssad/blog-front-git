<template>
  <el-form-item label="文章标题" prop="title">
    <el-input v-model="formData.title" maxlength="128" show-word-limit placeholder="请输入文章标题" />
  </el-form-item>

  <el-form-item label="文章摘要" prop="summary">
    <el-input
      v-model="formData.summary"
      type="textarea"
      :rows="3"
      maxlength="2000"
      show-word-limit
      resize="vertical"
      placeholder="请输入文章摘要"
    />
  </el-form-item>

  <el-form-item label="正文内容" prop="content">
    <div class="content-editor">
      <div class="toolbar">
        <el-button-group size="small">
          <el-tooltip content="加粗"><el-button @click="insert(SNIPPETS.bold)"><strong>B</strong></el-button></el-tooltip>
          <el-tooltip content="斜体"><el-button @click="insert(SNIPPETS.italic)"><em>I</em></el-button></el-tooltip>
          <el-tooltip content="标题"><el-button @click="insert(SNIPPETS.heading)">H</el-button></el-tooltip>
        </el-button-group>
        <el-button-group size="small">
          <el-tooltip content="链接"><el-button @click="insert(SNIPPETS.link)"><el-icon><Link /></el-icon></el-button></el-tooltip>
          <el-tooltip content="图片"><el-button @click="insert(SNIPPETS.image)"><el-icon><Picture /></el-icon></el-button></el-tooltip>
          <el-tooltip content="代码块"><el-button @click="insert(SNIPPETS.code)"><el-icon><Document /></el-icon></el-button></el-tooltip>
        </el-button-group>
        <el-button-group size="small">
          <el-tooltip content="列表"><el-button @click="insert(SNIPPETS.list)"><el-icon><List /></el-icon></el-button></el-tooltip>
          <el-tooltip content="引用"><el-button @click="insert(SNIPPETS.quote)"><el-icon><ChatLineSquare /></el-icon></el-button></el-tooltip>
          <el-tooltip content="分隔线"><el-button @click="insert(SNIPPETS.hr)">—</el-button></el-tooltip>
        </el-button-group>
        <div class="toolbar-spacer" />
        <el-button size="small" @click="emit('import-markdown')">导入 Markdown</el-button>
        <el-button size="small" @click="emit('update:htmlSource', formatHtml(htmlSource))">格式化</el-button>
      </div>

      <div class="split-pane">
        <div class="pane-editor">
          <div class="pane-label">源码</div>
          <HtmlCodeEditor
            ref="editorRef"
            :model-value="htmlSource"
            class="pane-code"
            @update:model-value="emit('update:htmlSource', $event)"
          />
        </div>
        <div class="pane-divider" />
        <div class="pane-preview">
          <div class="pane-label">预览</div>
          <div class="preview-scroll">
            <article v-if="previewHtml" class="article-body" v-html="previewHtml" />
            <el-empty v-else description="暂无正文内容" :image-size="64" />
          </div>
        </div>
      </div>

      <div class="status-bar">
        <span>{{ charCount }} 字符</span>
      </div>
    </div>
  </el-form-item>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { Link, Picture, Document, List, ChatLineSquare } from '@element-plus/icons-vue'
import HtmlCodeEditor from '@/components/editor/HtmlCodeEditor.vue'
import type { ArticleSaveRequest } from '@/api/types'
import { formatHtml, normalizeHtml } from './article-editor'

interface Props {
  formData: ArticleSaveRequest
  htmlSource: string
}

interface Emits {
  (e: 'update:htmlSource', value: string): void
  (e: 'import-markdown'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const editorRef = ref<InstanceType<typeof HtmlCodeEditor>>()

const previewHtml = computed(() => normalizeHtml(props.htmlSource))
const charCount = computed(() => props.htmlSource.length)

const SNIPPETS = {
  bold: '<strong>__SELECTION__</strong>',
  italic: '<em>__SELECTION__</em>',
  heading: '<h2>__SELECTION__</h2>',
  link: '<a href="|" target="_blank">__SELECTION__</a>',
  image: '<img src="|" alt="__SELECTION__" />',
  code: '<pre><code>__SELECTION__</code></pre>',
  list: '<ul>\n<li>__SELECTION__</li>\n</ul>',
  quote: '<blockquote>__SELECTION__</blockquote>',
  hr: '<hr />',
} as const

function insert(snippet: string): void {
  editorRef.value?.insertText(snippet)
}
</script>

<style scoped>
.content-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--color-border-light);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  background: var(--color-gray-50);
  flex-wrap: wrap;
}

.toolbar-spacer {
  flex: 1;
}

.split-pane {
  display: flex;
  height: var(--editor-pane-height, 600px);
  border: 1px solid var(--color-border-light);
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  background: var(--color-white);
}

.pane-editor,
.pane-preview {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pane-label {
  padding: 4px 12px;
  font-size: 12px;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border-lighter);
  background: var(--color-gray-50);
  flex-shrink: 0;
}

.pane-divider {
  width: 1px;
  background: var(--color-border-base);
  flex-shrink: 0;
}

.pane-code {
  flex: 1;
  min-height: 0;
}

.preview-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* 预览文章样式 */
.article-body {
  color: var(--color-text-primary);
  line-height: 1.9;
  word-break: break-word;
}

.article-body :deep(*) {
  max-width: 100%;
}

.article-body :deep(h1),
.article-body :deep(h2),
.article-body :deep(h3),
.article-body :deep(h4),
.article-body :deep(h5),
.article-body :deep(h6) {
  margin: 1.2em 0 0.6em;
  font-weight: 700;
  line-height: 1.35;
}

.article-body :deep(p),
.article-body :deep(ul),
.article-body :deep(ol),
.article-body :deep(blockquote),
.article-body :deep(pre),
.article-body :deep(table) {
  margin: 0 0 1em;
}

.article-body :deep(ul),
.article-body :deep(ol) {
  padding-left: 1.5em;
}

.article-body :deep(blockquote) {
  padding: 12px 16px;
  border-left: 4px solid rgba(59, 130, 246, 0.35);
  border-radius: 0 8px 8px 0;
  background: rgba(59, 130, 246, 0.06);
}

.article-body :deep(pre) {
  overflow: auto;
  padding: 16px;
  border-radius: 8px;
  background: #0f172a;
  color: #e2e8f0;
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

.article-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
}

.article-body :deep(th),
.article-body :deep(td) {
  padding: 10px 12px;
  border: 1px solid var(--color-border-light);
  text-align: left;
}

.article-body :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .split-pane {
    flex-direction: column;
    height: auto;
    min-height: 500px;
  }

  .pane-editor,
  .pane-preview {
    min-height: 300px;
  }

  .pane-divider {
    width: auto;
    height: 1px;
  }
}
</style>
