<template>
  <div class="author-apply-page">
    <h1 class="page-title">申请成为作者</h1>

    <div class="benefits-card">
      <div class="benefits-title">成为作者后你可以</div>
      <div class="benefits-list">
        <div class="benefit-item">
          <el-icon :size="20" color="var(--el-color-primary)"><EditPen /></el-icon>
          <span>创建专栏</span>
        </div>
        <div class="benefit-item">
          <el-icon :size="20" color="var(--el-color-primary)"><FolderOpened /></el-icon>
          <span>获得更高配额</span>
        </div>
        <div class="benefit-item">
          <el-icon :size="20" color="var(--el-color-primary)"><Medal /></el-icon>
          <span>专属标识</span>
        </div>
        <div class="benefit-item">
          <el-icon :size="20" color="var(--el-color-primary)"><Unlock /></el-icon>
          <span>更多权限</span>
        </div>
      </div>
    </div>

    <template v-if="existingApplication && existingApplication.status === 'pending'">
      <div class="status-card">
        <el-icon :size="48" color="var(--el-color-warning)"><Clock /></el-icon>
        <div class="status-info">
          <div class="status-text">你已提交申请，正在审核中</div>
          <div class="status-time">提交时间：{{ existingApplication.createdAt }}</div>
        </div>
      </div>
    </template>

    <template v-else-if="existingApplication">
      <div class="status-card">
        <el-icon
          :size="48"
          :color="
            existingApplication.status === 'approved'
              ? 'var(--el-color-success)'
              : 'var(--el-color-danger)'
          "
        >
          <component :is="existingApplication.status === 'approved' ? 'Select' : 'CloseBold'" />
        </el-icon>
        <div class="status-info">
          <div class="status-text">{{ existingApplication.status === 'approved' ? '已通过' : '已拒绝' }}</div>
          <div class="status-time">提交时间：{{ existingApplication.createdAt }}</div>
        </div>
      </div>
    </template>

    <template v-else>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="apply-form">
        <el-form-item label="真实姓名" prop="realName">
          <el-input
            v-model="form.realName"
            placeholder="请输入真实姓名"
          />
        </el-form-item>

        <el-form-item label="笔名" prop="penName">
          <el-input
            v-model="form.penName"
            placeholder="请输入笔名"
          />
        </el-form-item>

        <el-form-item label="个人简介">
          <el-input
            v-model="form.introduction"
            type="textarea"
            :rows="3"
            placeholder="简单介绍一下自己（选填）"
          />
        </el-form-item>

        <el-form-item label="作品集链接">
          <el-input
            v-model="form.portfolioUrl"
            placeholder="请输入作品集链接（选填）"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">提交申请</el-button>
        </el-form-item>
      </el-form>
    </template>
  </div>
</template>

<script lang="ts" setup>
/**
 * 作者申请页面
 * @description 用户申请成为作者，需填写申请说明和擅长方向
 * @module front/author/AuthorApply
 * @see ../../api/user/author.ts
 */
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  EditPen,
  FolderOpened,
  Medal,
  Unlock,
  Clock,
  Select,
  CloseBold,
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserAuthorApplicationStore } from '@/stores'
import type { UserAuthorApplicationVO } from '@/types/api-types'

const store = useUserAuthorApplicationStore()
const formRef = ref<FormInstance>()
const existingApplication = ref<UserAuthorApplicationVO | null>(null)
const submitting = ref(false)

// 表单数据
const form = reactive({
  realName: '',
  penName: '',
  introduction: '',
  portfolioUrl: '',
})

const rules = reactive<FormRules>({})

/** 提交作者申请 */
async function handleSubmit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const success = await store.submitApplication({
      realName: form.realName || undefined,
      penName: form.penName || undefined,
      introduction: form.introduction || undefined,
      portfolioUrl: form.portfolioUrl || undefined,
    })
    if (success) {
      ElMessage.success('申请已提交，请等待审核')
      existingApplication.value = await store.fetchLatestApplication()
    } else {
      ElMessage.error('提交失败，请稍后重试')
    }
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  existingApplication.value = await store.fetchLatestApplication()
})
</script>

<style scoped>
.author-apply-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  margin: 0 0 24px;
  font-size: 22px;
  font-weight: 700;
}

.benefits-card {
  padding: 20px;
  margin-bottom: 24px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.benefits-title {
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 600;
}

.benefits-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.status-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  margin-bottom: 24px;
  background: var(--color-bg-base);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-text {
  font-size: 16px;
  font-weight: 600;
}

.status-time {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.apply-form {
  padding: 24px;
  background: var(--color-bg-base);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.works-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.work-link-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.work-input {
  flex: 1;
}
</style>
