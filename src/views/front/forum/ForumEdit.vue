<template>
  <div class="forum-edit-page">
    <div class="forum-edit-container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/forum' }">论坛</el-breadcrumb-item>
        <el-breadcrumb-item>编辑帖子</el-breadcrumb-item>
      </el-breadcrumb>

      <div v-if="pageLoading" class="edit-loading">
        <el-skeleton :rows="6" animated />
      </div>

      <div v-else class="edit-card">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleSubmit"
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
            <el-input
              v-model="form.content"
              type="textarea"
              placeholder="请输入帖子内容"
              :rows="12"
              maxlength="50000"
            />
          </el-form-item>

          <el-form-item label="可见范围">
            <el-radio-group v-model="form.visibilityScope">
              <el-radio :value="0">公开</el-radio>
              <el-radio :value="1">登录可见</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item>
            <div class="form-actions">
              <el-button @click="router.back()">取消</el-button>
              <el-button plain :loading="submitting" @click="handleSubmit(0)">
                存草稿
              </el-button>
              <el-button type="primary" :loading="submitting" @click="handleSubmit(1)">
                更新
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

const postId = Number(route.params.postId)
const formRef = ref<FormInstance>()
const submitting = ref(false)
const pageLoading = ref(true)

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

function populateForm(): void {
  const post = store.currentPost
  if (!post) return
  form.sectionId = post.sectionId
  form.title = post.title
  form.content = post.content
  form.visibilityScope = post.visibilityScope
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
    const ok = await store.updatePost(postId, data)
    if (ok) {
      ElMessage.success('更新成功')
      router.push(`/forum/posts/${postId}`)
    }
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    await Promise.all([store.fetchSections(), store.fetchPostById(postId)])
    populateForm()
  } finally {
    pageLoading.value = false
  }
})
</script>

<style scoped>
.forum-edit-page {
  min-height: 100vh;
  background: var(--el-fill-color-lighter, #f5f5f5);
}

.forum-edit-container {
  width: min(800px, 100%);
  margin: 0 auto;
  padding: 32px 24px 48px;
}

.edit-loading {
  margin-top: 20px;
  background: var(--el-bg-color, #fff);
  border-radius: 12px;
  padding: 28px;
}

.edit-card {
  margin-top: 20px;
  background: var(--el-bg-color, #fff);
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  width: 100%;
}

@media (max-width: 768px) {
  .forum-edit-container {
    padding: 16px 16px 32px;
  }

  .edit-card {
    padding: 20px;
  }
}
</style>
