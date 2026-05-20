<template>
  <div class="channel-apply-page">
    <h1 class="page-title">申请创建频道</h1>

    <div v-if="pageLoading" class="loading-wrapper">
      <el-skeleton :rows="5" animated />
    </div>

    <template v-else-if="existingApplication && existingApplication.applyStatus === 1">
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
            existingApplication.applyStatus === 2
              ? 'var(--el-color-success)'
              : 'var(--el-color-danger)'
          "
        >
          <component :is="existingApplication.applyStatus === 2 ? 'Select' : 'CloseBold'" />
        </el-icon>
        <div class="status-info">
          <div class="status-text">
            {{ existingApplication.applyStatus === 2 ? '申请已通过' : '申请被拒绝' }}
          </div>
          <div v-if="existingApplication.reviewComment" class="status-time">
            审核意见：{{ existingApplication.reviewComment }}
          </div>
          <div class="status-time">提交时间：{{ existingApplication.createdAt }}</div>
        </div>
      </div>
    </template>

    <template v-else>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" class="apply-form">
        <el-form-item label="频道名称" prop="desiredName">
          <el-input v-model="form.desiredName" placeholder="请输入期望的频道名称" />
        </el-form-item>

        <el-form-item label="频道描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请描述频道用途和内容方向"
          />
        </el-form-item>

        <el-form-item label="频道类型" prop="desiredSceneType">
          <el-select v-model="form.desiredSceneType" placeholder="请选择频道类型">
            <el-option label="主题频道" value="topic_channel" />
          </el-select>
        </el-form-item>

        <el-form-item label="分类编码" prop="desiredCategoryCode">
          <el-input v-model="form.desiredCategoryCode" placeholder="请输入频道分类编码" />
        </el-form-item>

        <el-form-item label="申请理由" prop="applyReason">
          <el-input
            v-model="form.applyReason"
            type="textarea"
            :rows="4"
            placeholder="请说明你为什么想创建该频道"
          />
        </el-form-item>

        <el-form-item>
          <el-button @click="$router.back()">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            提交申请
          </el-button>
        </el-form-item>
      </el-form>
    </template>
  </div>
</template>

<script lang="ts" setup>
/**
 * 频道创建申请页面
 * @description 用户申请创建新的频道，需填写频道名称、描述等信息
 * @module front/channel/ChannelApply
 * @see ../../api/user/chat.ts
 */
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Clock, Select, CloseBold } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserChatStore } from '@/stores'
import type { ChannelApplicationVO } from '@/types/api-types'

const store = useUserChatStore()
const formRef = ref<FormInstance>()
// 现有的申请记录
const existingApplication = ref<ChannelApplicationVO | null>(null)
const pageLoading = ref(true)
const submitting = ref(false)

const form = reactive({
  desiredName: '',
  description: '',
  desiredSceneType: 'topic_channel',
  desiredCategoryCode: '',
  applyReason: '',
})

const rules = reactive<FormRules>({
  desiredName: [{ required: true, message: '请输入频道名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入频道描述', trigger: 'blur' }],
  desiredSceneType: [{ required: true, message: '请选择频道类型', trigger: 'change' }],
  desiredCategoryCode: [{ required: true, message: '请输入分类编码', trigger: 'blur' }],
})

/** 提交频道创建申请 */
async function handleSubmit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const success = await store.submitChannelApplication({
      desiredName: form.desiredName,
      desiredSceneType: form.desiredSceneType,
      desiredCategoryCode: form.desiredCategoryCode,
      description: form.description || undefined,
    })
    if (success) {
      ElMessage.success('申请已提交，请耐心等待审核')
      existingApplication.value = await store.fetchLatestChannelApplication()
    } else {
      ElMessage.error('提交失败，请稍后重试')
    }
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    existingApplication.value = await store.fetchLatestChannelApplication()
  } finally {
    pageLoading.value = false
  }
})
</script>

<style scoped>
.channel-apply-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  margin: 0 0 24px;
  font-size: 22px;
  font-weight: 700;
}

.loading-wrapper {
  padding: 24px;
  background: var(--color-bg-base);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
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
</style>
