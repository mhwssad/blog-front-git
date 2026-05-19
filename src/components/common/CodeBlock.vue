<script lang="ts" setup>
import { ElMessage } from 'element-plus'

const props = withDefaults(defineProps<{
  code?: string
  language?: string
  showCopy?: boolean
  maxHeight?: string
}>(), {
  showCopy: true,
  maxHeight: '400px',
})

const copied = ref(false)

const handleCopy = async () => {
  if (!props.code) return
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    ElMessage.success('已复制到剪贴板')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<template>
  <div class="code-block">
    <div v-if="language || showCopy" class="code-block__header">
      <span v-if="language" class="code-block__lang">{{ language }}</span>
      <el-button
        v-if="showCopy"
        link
        size="small"
        class="code-block__copy"
        @click="handleCopy"
      >
        {{ copied ? '已复制' : '复制' }}
      </el-button>
    </div>
    <div class="code-block__content" :style="{ maxHeight }">
      <slot>
        <pre><code>{{ code }}</code></pre>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.code-block {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-fill-color-lighter);
  overflow: hidden;
}

.code-block__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background-color: var(--el-fill-color);
}

.code-block__lang {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
}

.code-block__content {
  overflow: auto;
  padding: 12px 16px;
}

.code-block__content pre {
  margin: 0;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-primary);
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
