<template>
  <div class="forum-create-page">
    <div class="forum-create-container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/forum' }">论坛</el-breadcrumb-item>
        <el-breadcrumb-item>发布帖子</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="create-card">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleSubmit(1)"
        >
          <el-form-item label="版块" prop="sectionId">
            <el-select
              v-model="form.sectionId"
              placeholder="请选择版块"
              style="width: 100%"
            >
              <el-option
                v-for="section in store.sections"
                :key="section.id"
                :label="section.name"
                :value="section.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="标题" prop="title">
            <el-input
              v-model="form.title"
              placeholder="请输入帖子标题"
              maxlength="128"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="正文" prop="content">
            <div class="editor-tabs">
              <button
                type="button"
                class="editor-tab"
                :class="{ 'editor-tab--active': editorMode === 'edit' }"
                @click="editorMode = 'edit'"
              >
                编辑
              </button>
              <button
                type="button"
                class="editor-tab"
                :class="{ 'editor-tab--active': editorMode === 'preview' }"
                @click="editorMode = 'preview'"
              >
                预览
              </button>
            </div>
            <el-input
              v-if="editorMode === 'edit'"
              v-model="form.content"
              type="textarea"
              placeholder="请输入帖子内容"
              :rows="14"
              maxlength="50000"
            />
            <div v-else class="content-preview">
              <div v-if="form.content" class="preview-body" v-html="form.content"></div>
              <div v-else class="preview-empty">暂无内容，请先在编辑模式输入</div>
            </div>
          </el-form-item>

          <el-form-item label="可见范围">
            <el-radio-group v-model="form.visibilityScope">
              <el-radio :value="0">公开</el-radio>
              <el-radio :value="1">登录可见</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item>
            <div class="form-actions">
              <el-button plain :loading="submitting" @click="handleSubmit(0)">
                存草稿
              </el-button>
              <el-button type="primary" :loading="submitting" @click="handleSubmit(1)">
                发布
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserForumStore } from '@/stores'
import type { ForumPostSaveRequest } from '@/types/api-types'

const route = useRoute()
const router = useRouter()
const store = useUserForumStore()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const editorMode = ref<'edit' | 'preview'>('edit')

const form = reactive({
  sectionId: undefined as number | undefined,
  title: '',
  content: '',
  visibilityScope: 0,
})

const rules: FormRules = {
  sectionId: [{ required: true, message: '请选择版块', trigger: 'change' }],
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { max: 128, message: '标题最多128个字符', trigger: 'blur' },
  ],
  content: [{ required: true, message: '请输入正文', trigger: 'blur' }],
}

async function handleSubmit(status: number): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const data: ForumPostSaveRequest = {
      sectionId: form.sectionId!,
      title: form.title,
      content: form.content,
      status,
      visibilityScope: form.visibilityScope,
    }
    const ok = await store.createPost(data)
    if (ok) {
      ElMessage.success(status === 0 ? '草稿已保存' : '发布成功')
      router.push('/forum')
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  const sectionId = route.query.sectionId
  if (sectionId) {
    form.sectionId = Number(sectionId)
  }
  store.fetchSections()
})
</script>

<style scoped>
.forum-create-page {
  min-height: 100vh;
  background: var(--el-fill-color-lighter);
}

.forum-create-container {
  width: min(800px, 100%);
  margin: 0 auto;
  padding: 32px 24px 48px;
}

.create-card {
  margin-top: 20px;
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border-top: 3px solid var(--el-color-primary);
}

.editor-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.editor-tab {
  padding: 8px 20px;
  border: none;
  background: transparent;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.editor-tab:hover {
  color: var(--el-color-primary);
}

.editor-tab--active {
  color: var(--el-color-primary);
  border-bottom-color: var(--el-color-primary);
  font-weight: 500;
}

.content-preview {
  min-height: 300px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 16px;
  background: var(--el-fill-color-lighter);
}

.preview-body {
  font-size: 15px;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  word-break: break-word;
}

.preview-empty {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
  text-align: center;
  padding: 80px 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  width: 100%;
}

@media (max-width: 768px) {
  .forum-create-container {
    padding: 16px 16px 32px;
  }

  .create-card {
    padding: 20px;
  }
}
</style>
