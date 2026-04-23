<template>
  <el-dialog
    :model-value="visible"
    title="导入 Markdown"
    width="880px"
    align-center
    :close-on-click-modal="false"
    class="markdown-import-dialog"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="markdown-import">
      <div class="markdown-import__toolbar">
        <span>在这里输入或粘贴 Markdown，确认后会自动转换为 HTML 并填入预览与源码编辑区。</span>
        <el-button size="small" @click="emit('clear')">清空</el-button>
      </div>
      <textarea
        :value="draft"
        class="markdown-import__textarea"
        placeholder="请输入 Markdown 内容..."
        @input="emit('update:draft', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>

    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="emit('apply')">转换并应用</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
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

defineProps<Props>()
// 对话框保持无状态，只透传输入和按钮事件，真正的转换逻辑放在父组件统一处理。
const emit = defineEmits<Emits>()
</script>

<style scoped>
.markdown-import {
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 14px;
  background: #fff;
}

.markdown-import__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.markdown-import__textarea {
  width: 100%;
  min-height: 360px;
  padding: 18px 20px;
  border: none;
  resize: none;
  outline: none;
  background: transparent;
  color: var(--el-text-color-primary);
  font-family: var(--font-family-mono);
  font-size: 14px;
  line-height: 1.75;
}

@media (max-width: 768px) {
  .markdown-import__toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
