<template>
  <div ref="editorRoot" class="html-code-editor" />
</template>

<script lang="ts" setup>
import { EditorView, basicSetup } from 'codemirror'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()
const editorRoot = ref<HTMLDivElement>()

let editorView: EditorView | null = null
let syncingFromModel = false

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
    caretColor: 'var(--el-color-primary)',
  },
  '.cm-gutters': {
    borderRight: '1px solid var(--el-border-color-lighter)',
    backgroundColor: 'rgba(248, 250, 252, 0.92)',
    color: 'var(--el-text-color-secondary)',
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
})

function createEditor(): void {
  if (!editorRoot.value) {
    return
  }

  editorView = new EditorView({
    doc: props.modelValue,
    extensions: [basicSetup, EditorView.lineWrapping, editorTheme],
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

function focus(): void {
  editorView?.focus()
}

defineExpose({
  focus,
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
