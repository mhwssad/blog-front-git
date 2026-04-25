<template>
  <div class="editor-page">
    <div class="editor-header">
      <el-button text @click="handleBack"><el-icon><ArrowLeft /></el-icon> 返回列表</el-button>
      <h3 class="editor-title">{{ articleId ? '编辑文章' : '新建文章' }}</h3>
      <div class="header-actions">
        <el-button @click="handleSubmit(0)">存为草稿</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit(1)">发布</el-button>
      </div>
    </div>

    <div v-loading="pageLoading" class="editor-body">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        class="editor-form"
      >
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="17">
            <ArticleEditorContent
              :form-data="formData"
              :html-source="htmlSource"
              @update:html-source="htmlSource = $event"
              @import-markdown="markdownDialogVisible = true"
            />
          </el-col>
          <el-col :xs="24" :sm="24" :md="7">
            <ArticleEditorSettings
              :form-data="formData"
              :categories="categories"
              :tags="tags"
              :author-name="authorName"
            />
          </el-col>
        </el-row>
      </el-form>
    </div>

    <MarkdownImportDialog
      :visible="markdownDialogVisible"
      :draft="markdownDraft"
      @update:visible="markdownDialogVisible = $event"
      @update:draft="markdownDraft = $event"
      @clear="markdownDraft = ''"
      @apply="applyMarkdownDraft"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ArticleSaveRequest, ArticleDetailVO } from '@/api/types'
import { ArticleApi } from '@/api/sys/article'
import { useCategoryStore, useTagStore, useAuthStore } from '@/stores'
import { markdownToHtml } from '@/utils/markdown'
import ArticleEditorContent from './ArticleEditorContent.vue'
import ArticleEditorSettings from './ArticleEditorSettings.vue'
import MarkdownImportDialog from './MarkdownImportDialog.vue'
import { createEmptyForm, normalizeHtml, formatHtml } from './article-editor'

interface Props {
  articleId: number | null
}

interface Emits {
  (e: 'back'): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const categoryStore = useCategoryStore()
const tagStore = useTagStore()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const formData = ref<ArticleSaveRequest>(createEmptyForm())
const htmlSource = ref('')
const pageLoading = ref(false)
const submitting = ref(false)
const savedSnapshot = ref('')

const markdownDialogVisible = ref(false)
const markdownDraft = ref('')

const categories = computed(() => categoryStore.categories)
const tags = computed(() => tagStore.tags)
const authorName = computed(() => {
  if (props.articleId && originalArticle.value) {
    return originalArticle.value.authorName || '未知'
  }
  return authStore.currentUser?.nickname || '未知'
})

const originalArticle = ref<ArticleDetailVO | null>(null)

const formRules: FormRules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
}

const isDirty = computed(() => {
  const current = JSON.stringify({
    ...formData.value,
    content: normalizeHtml(htmlSource.value),
  })
  return current !== savedSnapshot.value
})

function takeSnapshot(): void {
  savedSnapshot.value = JSON.stringify({
    ...formData.value,
    content: normalizeHtml(htmlSource.value),
  })
}

async function loadArticle(): Promise<void> {
  if (!props.articleId) return

  pageLoading.value = true
  try {
    const response = await ArticleApi.getArticleById(props.articleId)
    const detail = response.data.data
    if (!detail) {
      ElMessage.error('文章不存在')
      emit('back')
      return
    }

    originalArticle.value = detail
    formData.value = {
      title: detail.title || '',
      summary: detail.summary || '',
      content: detail.content || '',
      coverImage: detail.coverImage || '',
      authorId: detail.authorId,
      isTop: detail.isTop ?? 0,
      isOriginal: detail.isOriginal ?? 1,
      sourceUrl: detail.sourceUrl || '',
      status: detail.status ?? 0,
      publishTime: detail.publishTime || '',
      accessLevel: detail.accessLevel ?? 0,
      remark: detail.remark || '',
      categoryIds: detail.categoryIds || [],
      tagIds: detail.tagIds || [],
      accessList: detail.accessList || [],
    }
    htmlSource.value = detail.content || ''
    takeSnapshot()
  } catch {
    ElMessage.error('加载文章失败')
    emit('back')
  } finally {
    pageLoading.value = false
  }
}

async function loadDependencies(): Promise<void> {
  pageLoading.value = true
  try {
    await Promise.all([
      categoryStore.fetchCategoryTree(),
      tagStore.fetchTags(),
      loadArticle(),
    ])
  } finally {
    pageLoading.value = false
  }
}

function handleBack(): void {
  if (isDirty.value) {
    ElMessageBox.confirm('当前内容未保存，确认返回？', '提示', {
      confirmButtonText: '确认离开',
      cancelButtonText: '继续编辑',
      type: 'warning',
    }).then(() => emit('back')).catch(() => {})
    return
  }
  emit('back')
}

async function handleSubmit(targetStatus: number): Promise<void> {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    ElMessage.warning('请填写必填项')
    return
  }

  submitting.value = true
  formData.value.status = targetStatus
  formData.value.content = normalizeHtml(htmlSource.value)

  try {
    if (props.articleId) {
      await ArticleApi.updateArticle(props.articleId, formData.value)
      ElMessage.success('文章已更新')
    } else {
      await ArticleApi.createArticle(formData.value)
      ElMessage.success(targetStatus === 1 ? '文章已发布' : '草稿已保存')
    }
    takeSnapshot()
    emit('success')
  } catch {
    ElMessage.error('保存失败，请重试')
  } finally {
    submitting.value = false
  }
}

function applyMarkdownDraft(): void {
  const html = markdownToHtml(markdownDraft.value)
  const formatted = formatHtml(html)
  htmlSource.value = formatted
  markdownDraft.value = ''
  markdownDialogVisible.value = false
  ElMessage.success('Markdown 已转换为 HTML')
}

function onKeyDown(e: KeyboardEvent): void {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    handleSubmit(formData.value.status ?? 0)
  }
}

function onBeforeUnload(e: BeforeUnloadEvent): void {
  if (isDirty.value) {
    e.preventDefault()
  }
}

onMounted(() => {
  if (!props.articleId) {
    takeSnapshot()
  }
  loadDependencies()
  document.addEventListener('keydown', onKeyDown)
  window.addEventListener('beforeunload', onBeforeUnload)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('beforeunload', onBeforeUnload)
})

onBeforeRouteLeave((_to, _from, next) => {
  if (isDirty.value) {
    ElMessageBox.confirm('当前内容未保存，确认离开？', '提示', {
      confirmButtonText: '确认离开',
      cancelButtonText: '继续编辑',
      type: 'warning',
    }).then(() => next()).catch(() => next(false))
  } else {
    next()
  }
})
</script>

<style scoped>
.editor-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-white);
  flex-shrink: 0;
}

.editor-title {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.editor-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
  background: var(--color-gray-50);
}

.editor-form :deep(.el-form-item__label) {
  font-weight: 600;
}

@media (max-width: 768px) {
  .editor-header {
    padding: 10px 12px;
    gap: 8px;
  }

  .editor-title {
    font-size: 14px;
  }

  .editor-body {
    padding: 12px;
  }
}
</style>
