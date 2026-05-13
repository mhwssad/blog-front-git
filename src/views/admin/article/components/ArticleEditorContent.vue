<template>
  <el-form-item label="文章标题" prop="title">
    <el-input
      v-model="formData.title"
      maxlength="128"
      show-word-limit
      placeholder="请输入文章标题"
    />
  </el-form-item>

  <el-form-item label="文章摘要" prop="summary">
    <el-input
      v-model="formData.summary"
      type="textarea"
      :rows="3"
      maxlength="2000"
      show-word-limit
      resize="vertical"
      placeholder="请输入文章摘要，留空保存时自动从正文提取"
    />
    <div v-if="!formData.summary && autoSummary" class="summary-preview">
      <span class="summary-preview__label">自动摘要预览</span>
      <span class="summary-preview__text">{{ autoSummary }}</span>
    </div>
  </el-form-item>

  <el-form-item label="正文内容" prop="content">
    <div class="content-editor">
      <div class="toolbar">
        <!-- 文本格式 -->
        <el-button-group size="small">
          <el-tooltip content="加粗 Ctrl+B"
            ><el-button @click="execFormat('bold')"><strong>B</strong></el-button></el-tooltip
          >
          <el-tooltip content="斜体 Ctrl+I"
            ><el-button @click="execFormat('italic')"><em>I</em></el-button></el-tooltip
          >
          <el-tooltip content="下划线"
            ><el-button @click="execFormat('underline')"><u>U</u></el-button></el-tooltip
          >
          <el-tooltip content="删除线"
            ><el-button @click="execFormat('strikeThrough')"><s>S</s></el-button></el-tooltip
          >
        </el-button-group>

        <!-- 标题 -->
        <el-button-group size="small">
          <el-dropdown trigger="click" @command="execHeading">
            <el-button>H <el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="h1">标题 1</el-dropdown-item>
                <el-dropdown-item command="h2">标题 2</el-dropdown-item>
                <el-dropdown-item command="h3">标题 3</el-dropdown-item>
                <el-dropdown-item command="p">正文</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-button-group>

        <!-- 插入 -->
        <el-button-group size="small">
          <el-tooltip content="链接"
            ><el-button @click="insertLink"><el-icon><Link /></el-icon></el-button></el-tooltip
          >
          <el-tooltip content="图片"
            ><el-button @click="insertImage"><el-icon><Picture /></el-icon></el-button></el-tooltip
          >
          <el-tooltip content="代码块"
            ><el-button @click="execFormat('insertHTML', '<pre><code>\n</code></pre>')"
              ><el-icon><Document /></el-icon></el-button
          ></el-tooltip>
        </el-button-group>

        <!-- 列表 / 引用 -->
        <el-button-group size="small">
          <el-tooltip content="无序列表"
            ><el-button @click="execFormat('insertUnorderedList')"
              ><el-icon><List /></el-icon></el-button
          ></el-tooltip>
          <el-tooltip content="有序列表"
            ><el-button @click="execFormat('insertOrderedList')"
              ><el-icon><List /></el-icon></el-button
          ></el-tooltip>
          <el-tooltip content="引用"
            ><el-button @click="execFormat('formatBlock', 'blockquote')"
              ><el-icon><ChatLineSquare /></el-icon></el-button
          ></el-tooltip>
          <el-tooltip content="分隔线"
            ><el-button @click="execFormat('insertHTML', '<hr />')">—</el-button></el-tooltip
          >
        </el-button-group>

        <!-- 表格 -->
        <el-button-group size="small">
          <el-tooltip content="表格"
            ><el-button @click="insertTable"><el-icon><Grid /></el-icon></el-button></el-tooltip
          >
        </el-button-group>

        <div class="toolbar-spacer" />
        <el-button size="small" @click="emit('importMarkdown')">导入 Markdown</el-button>
        <el-button size="small" @click="emit('update:htmlSource', formatHtml(htmlSource))">
          格式化
        </el-button>
        <el-radio-group v-model="mode" size="small" class="mode-toggle">
          <el-radio-button value="visual">可视化</el-radio-button>
          <el-radio-button value="source">源码</el-radio-button>
        </el-radio-group>
      </div>

      <div class="editor-body">
        <!-- 源码模式 -->
        <HtmlCodeEditor
          v-show="mode === 'source'"
          ref="codeEditorRef"
          :model-value="htmlSource"
          :extra-extensions="mdShortcuts"
          class="editor-pane"
          @update:model-value="emit('update:htmlSource', $event)"
        />
        <!-- 可视化模式 -->
        <div
          v-show="mode === 'visual'"
          ref="visualRef"
          class="editor-pane editor-visual article-body"
          contenteditable="true"
          @input="onVisualInput"
          @drop.prevent="onDrop"
          @dragover.prevent
          @paste="onPaste"
        />
        <!-- 拖拽提示 -->
        <div v-if="dragActive" class="drop-overlay">
          <el-icon size="32"><UploadFilled /></el-icon>
          <span>释放以插入图片</span>
        </div>
      </div>

      <div class="status-bar">
        <span>{{ htmlSource.length }} 字符</span>
        <span v-if="mode === 'source'" class="status-bar__hint">Markdown 快捷输入已启用</span>
        <span v-else-if="mode === 'visual'" class="status-bar__hint">支持拖拽/粘贴图片</span>
      </div>
    </div>
  </el-form-item>
</template>

<script lang="ts" setup>
import { nextTick, ref, watch, computed } from 'vue'
import { EditorView, keymap } from '@codemirror/view'
import type { Extension } from '@codemirror/state'
import { Prec } from '@codemirror/state'
import {
  Link,
  Picture,
  Document,
  List,
  ChatLineSquare,
  ArrowDown,
  Grid,
  UploadFilled,
} from '@element-plus/icons-vue'
import HtmlCodeEditor from '@/components/editor/HtmlCodeEditor.vue'
import type { ArticleSaveRequest } from '@/types/api-types'
import { formatHtml, normalizeHtml } from './article-editor'
import { useFileUpload } from '@/composables/useFileUpload'

interface Props {
  formData: ArticleSaveRequest
  htmlSource: string
}

interface Emits {
  (e: 'update:htmlSource', value: string): void
  (e: 'importMarkdown'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const codeEditorRef = ref<InstanceType<typeof HtmlCodeEditor>>()
const visualRef = ref<HTMLDivElement>()
const mode = ref<'source' | 'visual'>('visual')
const dragActive = ref(false)
let syncingVisual = false

const { upload } = useFileUpload()

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
const isMock = import.meta.env.VITE_ENABLE_MOCK === 'true'

// ==================== 自动摘要 ====================

const autoSummary = computed(() => {
  if (props.formData.summary) return ''
  const text = props.htmlSource
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 200 ? text.slice(0, 200) + '…' : text
})

function ensureSummary(): void {
  if (props.formData.summary) return
  const text = props.htmlSource
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (text) {
    props.formData.summary = text.length > 200 ? text.slice(0, 200) + '…' : text
  }
}

defineExpose({ ensureSummary })

// ==================== 模式切换同步 ====================

watch(mode, m => {
  if (m === 'visual') {
    nextTick(() => {
      if (!visualRef.value) return
      const html = normalizeHtml(props.htmlSource)
      syncingVisual = true
      visualRef.value.innerHTML = html || '<p style="color:#aaa">请输入正文内容…</p>'
      syncingVisual = false
    })
  } else {
    nextTick(() => codeEditorRef.value?.refresh())
  }
})

function onVisualInput() {
  if (syncingVisual || !visualRef.value) return
  emit('update:htmlSource', visualRef.value.innerHTML)
}

// ==================== 可视化模式格式命令 ====================

function execFormat(command: string, value?: string) {
  if (mode.value === 'visual') {
    visualRef.value?.focus()
    document.execCommand(command, false, value)
    onVisualInput()
  } else {
    const TAGS: Record<string, string> = {
      bold: '<strong>__SELECTION__</strong>',
      italic: '<em>__SELECTION__</em>',
      underline: '<u>__SELECTION__</u>',
      strikeThrough: '<s>__SELECTION__</s>',
    }
    const tag = TAGS[command]
    if (tag) codeEditorRef.value?.insertText(tag)
  }
}

function execHeading(tag: string) {
  if (mode.value === 'visual') {
    visualRef.value?.focus()
    document.execCommand('formatBlock', false, tag)
    onVisualInput()
  } else {
    codeEditorRef.value?.insertText(`<${tag}>__SELECTION__</${tag}>`)
  }
}

function insertLink() {
  if (mode.value === 'visual') {
    visualRef.value?.focus()
    const url = 'https://'
    document.execCommand('createLink', false, url)
    onVisualInput()
  } else {
    codeEditorRef.value?.insertText('<a href="|" target="_blank">__SELECTION__</a>')
  }
}

function insertImage() {
  const url = prompt('请输入图片地址')
  if (!url) return
  if (mode.value === 'visual') {
    visualRef.value?.focus()
    document.execCommand('insertHTML', false, `<img src="${url}" alt="" />`)
    onVisualInput()
  } else {
    codeEditorRef.value?.insertText(`<img src="${url}" alt="__SELECTION__" />`)
  }
}

function insertTable() {
  const html = `<table>\n<thead><tr><th>列 1</th><th>列 2</th><th>列 3</th></tr></thead>\n<tbody><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody>\n</table>`
  if (mode.value === 'visual') {
    visualRef.value?.focus()
    document.execCommand('insertHTML', false, html)
    onVisualInput()
  } else {
    codeEditorRef.value?.insertText(html)
  }
}

// ==================== 拖拽 & 粘贴图片 ====================

async function uploadAndInsertImage(file: File) {
  try {
    const result = await upload(file, { referenceType: 'article_attachment' })
    const url = isMock
      ? result.fileUrl ?? ''
      : result.fileId
        ? `${API_BASE}/public/files/${result.fileId}`
        : (result.fileUrl ?? '')

    const imgHtml = `<img src="${url}" alt="" />`
    if (mode.value === 'visual' && visualRef.value) {
      visualRef.value.focus()
      document.execCommand('insertHTML', false, imgHtml)
      onVisualInput()
    } else {
      emit('update:htmlSource', props.htmlSource + '\n' + imgHtml)
    }
  } catch {
    /* upload error handled by composable */
  }
}

function onDrop(e: DragEvent) {
  dragActive.value = false
  const files = e.dataTransfer?.files
  if (!files?.length) return
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      uploadAndInsertImage(file)
    }
  }
}

function onPaste(e: ClipboardEvent) {
  if (mode.value !== 'visual') return
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      if (file) uploadAndInsertImage(file)
      return
    }
  }
}

// ==================== Markdown 快捷输入 ====================

function escAttr(v: string) {
  return v
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function applyReplace(view: EditorView, from: number, to: number, text: string, cursor?: number) {
  view.dispatch({
    changes: { from, to, insert: text },
    selection: { anchor: cursor ?? from + text.length },
  })
  return true
}

function onEnter(view: EditorView): boolean {
  const pos = view.state.selection.main.head
  const line = view.state.doc.lineAt(pos)
  const raw = line.text.trimEnd()
  if (!raw || line.from >= pos) return false

  const t = raw.trim()

  const h = t.match(/^(#{1,6})\s+(.+)$/)
  if (h) {
    const level = h[1]?.length ?? 1
    return applyReplace(view, line.from, pos, `<h${level}>${h[2]}</h${level}>`)
  }

  const ul = t.match(/^[-*+]\s+(.+)$/)
  if (ul) return applyReplace(view, line.from, pos, `<ul>\n<li>${ul[1]}</li>\n</ul>`)

  const ol = t.match(/^\d+\.\s+(.+)$/)
  if (ol) return applyReplace(view, line.from, pos, `<ol>\n<li>${ol[1]}</li>\n</ol>`)

  const bq = t.match(/^>\s+(.+)$/)
  if (bq) return applyReplace(view, line.from, pos, `<blockquote>${bq[1]}</blockquote>`)

  if (t.startsWith('```')) {
    const lang = escAttr(t.slice(3).trim())
    const attr = lang ? ` class="language-${lang}"` : ''
    const html = `<pre><code${attr}>\n</code></pre>`
    return applyReplace(view, line.from, pos, html, line.from + html.indexOf('\n</code>'))
  }

  if (/^[-*_]{3,}$/.test(t)) return applyReplace(view, line.from, pos, '<hr />')

  return false
}

function onChar(view: EditorView, from: number, ch: string): boolean {
  if (ch !== '*' && ch !== '`' && ch !== '~') return false
  const before = view.state.sliceDoc(Math.max(0, from - 500), from)

  if (ch === '*') {
    const bold = before.match(/\*\*([^*\n]+)\*$/)
    if (bold) return applyReplace(view, from - bold[0].length, from, `<strong>${bold[1]}</strong>`)
    const em = before.match(/(?<!\*)\*([^*\n]+)\*$/)
    if (em) return applyReplace(view, from - em[0].length, from, `<em>${em[1]}</em>`)
  }

  if (ch === '`') {
    const code = before.match(/`([^`\n]+)`$/)
    if (code) return applyReplace(view, from - code[0].length, from, `<code>${code[1]}</code>`)
  }

  if (ch === '~') {
    const del = before.match(/~~([^~\n]+)~$/)
    if (del) return applyReplace(view, from - del[0].length, from, `<del>${del[1]}</del>`)
  }

  return false
}

const mdShortcuts: Extension[] = [
  Prec.highest(keymap.of([{ key: 'Enter', run: onEnter }])),
  EditorView.inputHandler.of((view: EditorView, from: number, _to: number, text: string) => {
    return onChar(view, from, text)
  }),
]
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

.mode-toggle {
  margin-left: 4px;
}

.editor-body {
  min-height: var(--editor-pane-height, 800px);
  height: calc(100vh - 380px);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border-light);
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  background: var(--color-white);
  position: relative;
}

.editor-pane {
  flex: 1;
  min-height: 0;
}

.editor-visual {
  overflow-y: auto;
  padding: 20px;
  outline: none;
  line-height: 1.9;
  word-break: break-word;
  color: var(--color-text-primary);
}

.editor-visual:focus {
  background: var(--color-white);
}

.editor-visual :deep(*) {
  max-width: 100%;
}

.editor-visual :deep(h1),
.editor-visual :deep(h2),
.editor-visual :deep(h3),
.editor-visual :deep(h4),
.editor-visual :deep(h5),
.editor-visual :deep(h6) {
  margin: 1.2em 0 0.6em;
  font-weight: 700;
  line-height: 1.35;
}

.editor-visual :deep(p),
.editor-visual :deep(ul),
.editor-visual :deep(ol),
.editor-visual :deep(blockquote),
.editor-visual :deep(pre),
.editor-visual :deep(table) {
  margin: 0 0 1em;
}

.editor-visual :deep(ul),
.editor-visual :deep(ol) {
  padding-left: 1.5em;
}

.editor-visual :deep(blockquote) {
  padding: 12px 16px;
  border-left: 4px solid rgba(59, 130, 246, 0.35);
  border-radius: 0 8px 8px 0;
  background: rgba(59, 130, 246, 0.06);
}

.editor-visual :deep(pre) {
  overflow: auto;
  padding: 16px;
  border-radius: 8px;
  background: #0f172a;
  color: #e2e8f0;
}

.editor-visual :deep(code) {
  padding: 0.15em 0.35em;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.08);
  font-family: var(--font-family-mono);
}

.editor-visual :deep(pre code) {
  padding: 0;
  background: transparent;
  color: inherit;
}

.editor-visual :deep(table) {
  width: 100%;
  border-collapse: collapse;
}

.editor-visual :deep(th),
.editor-visual :deep(td) {
  padding: 10px 12px;
  border: 1px solid var(--color-border-light);
  text-align: left;
}

.editor-visual :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.drop-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(59, 130, 246, 0.1);
  border: 2px dashed var(--el-color-primary);
  border-radius: 0 0 8px 8px;
  color: var(--el-color-primary);
  font-size: 14px;
  font-weight: 500;
  pointer-events: none;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.status-bar__hint {
  color: var(--el-color-success);
  font-size: 11px;
}

.summary-preview {
  margin-top: 4px;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--color-gray-50);
  font-size: 12px;
  color: var(--color-text-secondary);
}

.summary-preview__label {
  display: inline-block;
  margin-right: 6px;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 11px;
}

@media (max-width: 768px) {
  .toolbar {
    padding: 6px 8px;
    gap: 4px;
  }
}
</style>
