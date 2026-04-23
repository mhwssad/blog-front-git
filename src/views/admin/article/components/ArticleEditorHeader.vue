<template>
  <div class="editor-page-header">
    <div class="editor-page-header__title">
      <el-button text @click="emit('back')">返回列表</el-button>
      <div>
        <h2>{{ pageTitle }}</h2>
        <p>默认显示渲染预览，正文源码统一使用 CodeMirror 编辑，支持查看原 HTML，也支持将 Markdown 自动转换为 HTML。</p>
      </div>
    </div>
    <div class="editor-page-header__actions">
      <el-button @click="emit('import-markdown')">Markdown 导入</el-button>
      <el-button @click="emit('back')">取消</el-button>
      <el-button v-permission="submitPermission" type="primary" :loading="submitting" @click="emit('submit')">
        {{ isEdit ? '保存文章' : '创建文章' }}
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  pageTitle: string
  isEdit: boolean
  submitPermission: string
  submitting: boolean
}

interface Emits {
  (e: 'back'): void
  (e: 'import-markdown'): void
  (e: 'submit'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<style scoped>
.editor-page-header {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px 16px;
  padding: 20px 24px;
  border: 1px solid rgba(59, 130, 246, 0.12);
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(24, 144, 255, 0.12), rgba(64, 158, 255, 0.03)),
    rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.editor-page-header__title {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.editor-page-header__title h2 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.editor-page-header__title p {
  margin: 0;
  color: var(--el-text-color-regular);
}

.editor-page-header__actions {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 768px) {
  .editor-page-header {
    padding: 16px;
  }

  .editor-page-header__title {
    width: 100%;
  }

  .editor-page-header__actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
