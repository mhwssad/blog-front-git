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

    <template v-if="existingApplication">
      <div class="status-card">
        <el-icon :size="48" color="var(--el-color-warning)"><Clock /></el-icon>
        <div class="status-info">
          <div class="status-text">你已提交申请，正在审核中</div>
          <div class="status-time">提交时间：{{ existingApplication.submitTime }}</div>
        </div>
      </div>
    </template>

    <template v-else>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="apply-form"
      >
        <el-form-item label="申请说明" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="4"
            placeholder="请说明你为什么想成为作者"
          />
        </el-form-item>

        <el-form-item label="擅长方向" prop="expertise">
          <el-input
            v-model="form.expertise"
            type="textarea"
            :rows="3"
            placeholder="请描述你擅长的技术方向或领域"
          />
        </el-form-item>

        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="form.bio"
            type="textarea"
            :rows="3"
            placeholder="简单介绍一下自己（选填）"
          />
        </el-form-item>

        <el-form-item label="代表作品">
          <div class="works-list">
            <div v-for="(_, index) in workLinks" :key="index" class="work-link-row">
              <el-input
                v-model="workLinks[index]"
                placeholder="请输入作品链接"
                class="work-input"
              />
              <el-button
                v-if="workLinks.length > 1"
                type="danger"
                link
                @click="removeWorkLink(index)"
              >
                删除
              </el-button>
            </div>
            <el-button type="primary" link @click="addWorkLink">
              + 添加更多
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交申请</el-button>
        </el-form-item>
      </el-form>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { EditPen, FolderOpened, Medal, Unlock, Clock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

interface ExistingApplication {
  submitTime: string
}

const formRef = ref<FormInstance>()
const existingApplication = ref<ExistingApplication | null>(null)

const form = reactive({
  reason: '',
  expertise: '',
  bio: '',
})

const rules = reactive<FormRules>({
  reason: [{ required: true, message: '请填写申请说明', trigger: 'blur' }],
  expertise: [{ required: true, message: '请填写擅长方向', trigger: 'blur' }],
})

const workLinks = ref<string[]>([''])

function addWorkLink(): void {
  workLinks.value.push('')
}

function removeWorkLink(index: number): void {
  workLinks.value.splice(index, 1)
}

async function handleSubmit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  ElMessage.success('申请已提交，请等待审核')
}

onMounted(() => {
  existingApplication.value = null
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
  background: #fff;
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
  background: #fff;
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
