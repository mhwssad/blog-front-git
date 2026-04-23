<template>
  <el-drawer
    v-model="drawerVisible"
    :title="isEdit ? '编辑文章' : '新增文章'"
    :size="drawerSize"
    :close-on-click-modal="false"
    destroy-on-close
    class="article-form-drawer"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      v-loading="detailLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="article-form"
    >
      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item label="文章标题" prop="title">
            <el-input v-model="formData.title" maxlength="128" show-word-limit placeholder="请输入文章标题" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="文章摘要" prop="summary">
        <el-input
          v-model="formData.summary"
          type="textarea"
          :rows="3"
          maxlength="2000"
          show-word-limit
          placeholder="请输入文章摘要"
        />
      </el-form-item>

      <el-form-item label="正文内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="12"
          placeholder="请输入文章正文"
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <el-form-item label="封面地址" prop="coverImage">
            <el-input v-model="formData.coverImage" maxlength="512" placeholder="请输入封面图片地址" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="发布时间" prop="publishTime">
            <el-date-picker
              v-model="formData.publishTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择发布时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :xs="24" :md="8">
          <el-form-item label="访问级别" prop="accessLevel">
            <el-select v-model="formData.accessLevel" placeholder="请选择访问级别">
              <el-option
                v-for="option in ACCESS_LEVEL_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="发布状态" prop="status">
            <el-radio-group v-model="formData.status" class="status-group">
              <el-radio v-for="option in ARTICLE_STATUS_OPTIONS" :key="option.value" :value="option.value">
                {{ option.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-form-item label="是否置顶" prop="isTop">
            <el-radio-group v-model="formData.isTop" class="status-group">
              <el-radio :value="1">是</el-radio>
              <el-radio :value="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <el-form-item label="是否原创" prop="isOriginal">
            <el-radio-group v-model="formData.isOriginal" class="status-group">
              <el-radio :value="1">原创</el-radio>
              <el-radio :value="0">转载</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item v-if="formData.isOriginal === 0" label="转载地址" prop="sourceUrl">
            <el-input v-model="formData.sourceUrl" maxlength="512" placeholder="请输入转载来源地址" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <el-form-item label="文章分类" prop="categoryIds">
            <el-select
              v-model="formData.categoryIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择分类"
            >
              <el-option
                v-for="item in categoryOptions"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="文章标签" prop="tagIds">
            <el-select
              v-model="formData.tagIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择标签"
            >
              <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          maxlength="256"
          show-word-limit
          placeholder="请输入备注"
        />
      </el-form-item>

      <el-alert
        v-if="formData.accessLevel === 4"
        type="info"
        :closable="false"
        class="access-alert"
        title="当前文章为指定用户可见，访问名单请在列表中的“访问名单”操作中单独维护。"
      />
    </el-form>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button v-permission="submitPermission" type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '保存' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { ArticleSaveRequest, CategoryAdminVO, TagVO } from '@/api/types'
import { articleApi } from '@/api/sys/article'
import { ACCESS_LEVEL_OPTIONS, ARTICLE_STATUS_OPTIONS } from '@/utils'

interface CategoryOption {
  id: number
  label: string
}

interface Props {
  visible: boolean
  articleId: number | null
  categories: CategoryAdminVO[]
  tags: TagVO[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const detailLoading = ref(false)
const submitting = ref(false)

const drawerVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

const isEdit = computed(() => !!props.articleId)
const submitPermission = computed(() => (isEdit.value ? 'content:article:update' : 'content:article:create'))
const drawerSize = computed(() => (typeof window !== 'undefined' && window.innerWidth <= 992 ? '100%' : '880px'))

const categoryOptions = computed<CategoryOption[]>(() => {
  const options: CategoryOption[] = []

  function walk(nodes: CategoryAdminVO[], prefix = ''): void {
    nodes.forEach(node => {
      const label = prefix ? `${prefix} / ${node.name}` : node.name
      options.push({ id: node.id, label })

      if (node.children?.length) {
        walk(node.children, label)
      }
    })
  }

  walk(props.categories)
  return options
})

const formData = reactive<ArticleSaveRequest>({
  title: '',
  summary: '',
  content: '',
  coverImage: '',
  isTop: 0,
  isOriginal: 1,
  sourceUrl: '',
  status: 0,
  publishTime: '',
  accessLevel: 0,
  remark: '',
  categoryIds: [],
  tagIds: [],
  accessList: [],
})

const formRules: FormRules<ArticleSaveRequest> = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
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
        const validIds = new Set(props.tags.map(item => item.id))
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
  // 抽屉通过 destroy-on-close 销毁，但切换不同文章时仍会复用同一个 setup 实例，需要手动回到初始值。
  Object.assign(formData, {
    title: '',
    summary: '',
    content: '',
    coverImage: '',
    isTop: 0,
    isOriginal: 1,
    sourceUrl: '',
    status: 0,
    publishTime: '',
    accessLevel: 0,
    remark: '',
    categoryIds: [],
    tagIds: [],
    accessList: [],
  })
  formRef.value?.clearValidate()
}

async function loadArticleDetail(articleId: number): Promise<void> {
  detailLoading.value = true
  try {
    const response = await articleApi.getArticleById(articleId)
    const detail = response.data.data

    Object.assign(formData, {
      title: detail.title,
      summary: detail.summary ?? '',
      content: detail.content ?? '',
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
  } catch {
    ElMessage.error('获取文章详情失败')
  } finally {
    detailLoading.value = false
  }
}

async function handleSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const payload: ArticleSaveRequest = {
      title: formData.title.trim(),
      summary: formData.summary?.trim() || undefined,
      content: formData.content?.trim() || undefined,
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
    drawerVisible.value = false
  } catch {
    // 表单校验失败或请求失败
  } finally {
    submitting.value = false
  }
}

function handleClosed(): void {
  resetForm()
}

watch(
  () => [props.visible, props.articleId] as const,
  async ([visible, articleId]) => {
    if (!visible) {
      return
    }

    // 每次重新打开都先清旧数据，避免上一次编辑残留在“新建文章”场景中。
    resetForm()

    if (articleId) {
      await loadArticleDetail(articleId)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.article-form {
  padding: 0 16px 16px;
}

.article-form :deep(.el-select),
.article-form :deep(.el-date-editor) {
  width: 100%;
}

.status-group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 16px;
}

:deep(.status-group .el-radio) {
  margin-right: 0;
}

:deep(.status-group .el-radio__label) {
  color: var(--el-text-color-primary);
}

.access-alert {
  margin-top: 8px;
}

.drawer-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  width: 100%;
}

:deep(.article-form-drawer .el-drawer__header) {
  margin-bottom: 0;
}

:deep(.article-form-drawer .el-drawer__body) {
  overflow-y: auto;
}

:deep(.article-form-drawer .el-drawer__footer) {
  padding-top: 12px;
}

@media (max-width: 768px) {
  .article-form {
    padding: 0 4px 12px;
  }
}
</style>
