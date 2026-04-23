<template>
  <div class="article-editor-page">
    <ArticleEditorHeader
      :page-title="pageTitle"
      :is-edit="isEdit"
      :submit-permission="submitPermission"
      :submitting="submitting"
      @back="emit('back')"
      @import-markdown="markdownDialogVisible = true"
      @submit="handleSubmit"
    />

    <el-form
      ref="formRef"
      v-loading="pageLoading"
      :model="formData"
      :rules="formRules"
      label-position="top"
      class="article-editor-form"
    >
      <el-row :gutter="16" class="article-editor-layout">
        <el-col :xs="24" :xl="17">
          <ArticleContentEditor
            :form-data="formData"
            :html-source="htmlSource"
            :active-tab="activeTab"
            @update:html-source="htmlSource = $event"
            @update:active-tab="activeTab = $event"
            @import-markdown="markdownDialogVisible = true"
          />
        </el-col>

        <el-col :xs="24" :xl="7">
          <div class="editor-side-column">
            <ArticlePublishSettingsCard :form-data="formData" :current-author-name="currentAuthorName" />
            <ArticleTaxonomyCard :form-data="formData" :category-options="categoryOptions" :tags="tagStore.tags" />
          </div>
        </el-col>
      </el-row>
    </el-form>

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
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { ArticleSaveRequest } from '@/api/types'
import { articleApi } from '@/api/sys/article'
import { useAuthStore, useCategoryStore, useTagStore } from '@/stores'
import { markdownToHtml } from '@/utils/markdown'
import ArticleContentEditor from './ArticleContentEditor.vue'
import ArticleEditorHeader from './ArticleEditorHeader.vue'
import ArticlePublishSettingsCard from './ArticlePublishSettingsCard.vue'
import ArticleTaxonomyCard from './ArticleTaxonomyCard.vue'
import MarkdownImportDialog from './MarkdownImportDialog.vue'
import {
  buildCategoryOptions,
  createArticleFormData,
  formatArticleHtml,
  normalizeArticleHtml,
  type EditorTab,
} from './article-editor'

interface Props {
  articleId: number | null
}

interface Emits {
  (e: 'back'): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()

const formRef = ref<FormInstance>()
const pageLoading = ref(false)
const submitting = ref(false)
const activeTab = ref<EditorTab>('preview')
const markdownDialogVisible = ref(false)
const markdownDraft = ref('')
const htmlSource = ref('')
const formData = reactive<ArticleSaveRequest>(createArticleFormData())

const isEdit = computed(() => props.articleId !== null)
const pageTitle = computed(() => (isEdit.value ? '编辑文章' : '新增文章'))
const submitPermission = computed(() =>
  isEdit.value ? 'content:article:update' : 'content:article:create'
)
const currentAuthorName = computed(
  () =>
    authStore.currentUser?.nickname ||
    authStore.currentUser?.username ||
    `用户 #${authStore.currentUser?.id ?? '-'}`
)
const categoryOptions = computed(() => buildCategoryOptions(categoryStore.categories))

const formRules: FormRules<ArticleSaveRequest> = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  content: [
    {
      // 真正提交的是 htmlSource 清洗后的结果，校验时也要以同一份数据为准。
      validator: (_, value, callback) => {
        if (!normalizeArticleHtml(String(value ?? ''))) {
          callback(new Error('请输入文章正文内容'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
  sourceUrl: [
    {
      validator: (_, value, callback) => {
        if (formData.isOriginal === 0 && !String(value ?? '').trim()) {
          callback(new Error('转载文章必须填写转载地址'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
  categoryIds: [
    {
      validator: (_, value: number[] | undefined, callback) => {
        const validIds = new Set(categoryOptions.value.map(item => item.id))
        const invalid = (value ?? []).some(id => !validIds.has(id))
        if (invalid) {
          callback(new Error('存在无效分类，请重新选择'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
  tagIds: [
    {
      validator: (_, value: number[] | undefined, callback) => {
        const validIds = new Set(tagStore.tags.map(item => item.id))
        const invalid = (value ?? []).some(id => !validIds.has(id))
        if (invalid) {
          callback(new Error('存在无效标签，请重新选择'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
}

function resetForm(): void {
  Object.assign(formData, createArticleFormData())
  activeTab.value = 'preview'
  htmlSource.value = ''
  markdownDraft.value = ''
  formRef.value?.clearValidate()
}

function applyMarkdownDraft(): void {
  const markdown = markdownDraft.value.trim()
  if (!markdown) {
    ElMessage.warning('请输入 Markdown 内容')
    return
  }

  // Markdown 导入只负责生成初始 HTML，后续仍以 HTML 编辑区作为唯一可编辑源。
  htmlSource.value = formatArticleHtml(markdownToHtml(markdown))
  markdownDialogVisible.value = false
  markdownDraft.value = ''
  activeTab.value = 'preview'
}

async function loadDependencies(): Promise<void> {
  // 分类和标签都会参与表单校验，进入页面时并行拉取，避免出现“详情回填了无效选项”的误判。
  await Promise.all([categoryStore.fetchCategoryTree(), tagStore.fetchTags()])
}

async function loadArticleDetail(articleId: number): Promise<void> {
  pageLoading.value = true
  try {
    const response = await articleApi.getArticleById(articleId)
    const detail = response.data.data
    const normalizedHtml = normalizeArticleHtml(detail.content ?? '')

    Object.assign(formData, {
      title: detail.title,
      summary: detail.summary ?? '',
      content: normalizedHtml,
      coverImage: detail.coverImage ?? '',
      isTop: detail.isTop ?? 0,
      isOriginal: detail.isOriginal ?? 1,
      sourceUrl: detail.sourceUrl ?? '',
      status: detail.status ?? 0,
      publishTime: detail.publishTime ?? '',
      accessLevel: detail.accessLevel ?? 0,
      remark: detail.remark ?? '',
      categoryIds: detail.categoryIds ?? [],
      tagIds: detail.tagIds ?? [],
      accessList: detail.accessList ?? [],
    })

    // 详情接口返回的 content 直接作为最终保存值，同时同步生成源码编辑区内容。
    htmlSource.value = formatArticleHtml(normalizedHtml)
  } catch {
    ElMessage.error('获取文章详情失败')
  } finally {
    pageLoading.value = false
  }
}

async function handleSubmit(): Promise<void> {
  const normalizedHtml = normalizeArticleHtml(htmlSource.value)
  // 先把编辑器当前值写回表单模型，保证校验、提交、脏数据判断都基于同一份正文。
  formData.content = normalizedHtml

  try {
    await formRef.value?.validate()
    submitting.value = true

    const payload: ArticleSaveRequest = {
      title: formData.title.trim(),
      summary: formData.summary?.trim() || undefined,
      content: normalizedHtml || undefined,
      coverImage: formData.coverImage?.trim() || undefined,
      isTop: formData.isTop ?? 0,
      isOriginal: formData.isOriginal ?? 1,
      sourceUrl: formData.isOriginal === 0 ? formData.sourceUrl?.trim() || undefined : undefined,
      status: formData.status ?? 0,
      publishTime: formData.publishTime || undefined,
      accessLevel: formData.accessLevel ?? 0,
      remark: formData.remark?.trim() || undefined,
      categoryIds: [...(formData.categoryIds ?? [])],
      tagIds: [...(formData.tagIds ?? [])],
      accessList: formData.accessList ?? [],
    }

    if (isEdit.value && props.articleId) {
      await articleApi.updateArticle(props.articleId, payload)
      ElMessage.success('文章更新成功')
    } else {
      await articleApi.createArticle(payload)
      ElMessage.success('文章创建成功')
    }

    emit('success')
  } catch {
    // 表单校验失败或请求失败
  } finally {
    submitting.value = false
  }
}

watch(
  () => props.articleId,
  async articleId => {
    await loadDependencies()
    resetForm()

    // 组件本身同时承载“新建”和“编辑”，切换文章 ID 时需要完整重建编辑上下文。
    if (articleId) {
      await loadArticleDetail(articleId)
    }
  },
  { immediate: true }
)

watch(
  htmlSource,
  value => {
    // 让 el-form 的 content 校验跟随源码编辑区变化实时生效。
    formData.content = normalizeArticleHtml(value)
  },
  { immediate: true }
)
</script>

<style scoped>
.article-editor-page {
  --article-editor-pane-height: 640px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-editor-layout {
  align-items: stretch;
}

.editor-side-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-editor-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.article-editor-form :deep(.el-select),
.article-editor-form :deep(.el-date-editor) {
  width: 100%;
}

@media (max-width: 1200px) {
  .article-editor-page {
    --article-editor-pane-height: 520px;
  }
}

@media (max-width: 768px) {
  .article-editor-page {
    --article-editor-pane-height: 420px;
  }
}
</style>
