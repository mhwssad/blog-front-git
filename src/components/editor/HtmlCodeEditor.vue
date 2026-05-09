<template>
  <div ref="editorRoot" class="html-code-editor" />
</template>

<script lang="ts" setup>
import { EditorView, basicSetup } from 'codemirror'
import type { Extension } from '@codemirror/state'
import { html } from '@codemirror/lang-html'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Props {
  modelValue: string
  extraExtensions?: Extension[]
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const editorRoot = ref<HTMLDivElement>()

let editorView: EditorView | null = null
let syncingFromModel = false

const customHighlight = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.tagName, color: '#3b82f6' },
  { tag: tags.attributeName, color: '#e06c75' },
  { tag: tags.string, color: '#98c379' },
  { tag: tags.comment, color: '#6b7280', fontStyle: 'italic' },
  { tag: tags.meta, color: '#6b7280' },
  { tag: tags.content, color: '#111827' },
]))

const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
    backgroundColor: '#ffffff',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'var(--font-family-mono)',
    lineHeight: '1.75',
  },
  '.cm-content': {
    minHeight: '100%',
    padding: '18px 20px 120px',
    caretColor: 'var(--color-primary)',
  },
  '.cm-gutters': {
    borderRight: '1px solid var(--color-border-light)',
    backgroundColor: 'var(--color-gray-50)',
    color: 'var(--color-text-secondary)',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  '.cm-tooltip': {
    border: '1px solid var(--color-border-base)',
    borderRadius: 'var(--border-radius-base)',
    boxShadow: 'var(--shadow-base)',
  },
  '.cm-tooltip-autocomplete ul li': {
    padding: '4px 8px',
  },
  '.cm-completionLabel': {
    fontFamily: 'var(--font-family-mono)',
    fontSize: '13px',
  },
})

function createEditor(): void {
  if (!editorRoot.value) {
    return
  }

  editorView = new EditorView({
    doc: props.modelValue,
    extensions: [
      basicSetup,
      EditorView.lineWrapping,
      html(),
      customHighlight,
      editorTheme,
      ...(props.extraExtensions ?? []),
    ],
    parent: editorRoot.value,
    dispatchTransactions(transactions, view) {
      view.update(transactions)

      if (syncingFromModel || !transactions.some(transaction => transaction.docChanged)) {
        return
      }

      emit('update:modelValue', view.state.doc.toString())
    },
  })
}

function replaceDoc(nextValue: string): void {
  if (!editorView) {
    return
  }

  const currentValue = editorView.state.doc.toString()
  if (currentValue === nextValue) {
    return
  }

  syncingFromModel = true
  editorView.dispatch({
    changes: {
      from: 0,
      to: currentValue.length,
      insert: nextValue,
    },
  })
  syncingFromModel = false
}

function insertText(text: string): void {
  if (!editorView) {
    return
  }

  const state = editorView.state
  const selection = state.selection.main
  const selectedText = state.sliceDoc(selection.from, selection.to)

  if (selectedText) {
    const wrapped = text.replace('__SELECTION__', selectedText)
    editorView.dispatch({
      changes: { from: selection.from, to: selection.to, insert: wrapped },
    })
  } else {
    const inserted = text.replace('__SELECTION__', '')
    const cursorOffset = inserted.indexOf('|')
    const finalText = cursorOffset >= 0 ? inserted.replace('|', '') : inserted
    const finalCursorPos = cursorOffset >= 0
      ? selection.from + cursorOffset
      : selection.from + finalText.length

    editorView.dispatch({
      changes: { from: selection.from, to: selection.to, insert: finalText },
      selection: { anchor: finalCursorPos },
    })
  }

  editorView.focus()
}

function focus(): void {
  editorView?.focus()
}

function refresh(): void {
  editorView?.requestMeasure()
}

defineExpose({
  focus,
  insertText,
  refresh,
})

watch(
  () => props.modelValue,
  value => {
    replaceDoc(value)
  }
)

onMounted(() => {
  createEditor()
})

onBeforeUnmount(() => {
  editorView?.destroy()
  editorView = null
})
</script>

<style scoped>
.html-code-editor {
  height: 100%;
  min-height: 0;
}

.html-code-editor :deep(.cm-editor) {
  height: 100%;
}
</style>
