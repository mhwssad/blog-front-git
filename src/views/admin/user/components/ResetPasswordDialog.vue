<template>
  <el-dialog
    v-model="dialogVisible"
    title="重置密码"
    class="reset-password-dialog"
    width="450px"
    :close-on-click-modal="false"
    align-center
    center
    @close="handleClose"
  >
    <div class="password-reset-content">
      <p class="tips">为用户 <strong>{{ username }}</strong> 重置密码</p>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>

        <el-alert
          title="密码要求"
          type="info"
          :closable="false"
          show-icon
        >
          <ul class="password-tips">
            <li>长度在 6 到 20 个字符</li>
            <li>建议包含字母、数字和特殊字符</li>
          </ul>
        </el-alert>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        v-permission="'sys:user:reset-password'"
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api/sys/user'
import type { PasswordResetRequest } from '@/api/types'

interface Props {
  visible: boolean
  userId: number
  username: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref()
const submitting = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 表单数据
const formData = reactive({
  password: '',
  confirmPassword: ''
})

// 自定义验证：确认密码
const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== formData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const formRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const data: PasswordResetRequest = {
      password: formData.password
    }

    await userApi.resetUserPassword(props.userId, data)
    ElMessage.success('密码重置成功')
    emit('success')
    handleClose()
  } catch {
    // 验证失败或请求失败
  } finally {
    submitting.value = false
  }
}

// 重置表单
function resetForm() {
  formData.password = ''
  formData.confirmPassword = ''
  formRef.value?.clearValidate()
}

// 关闭对话框
function handleClose() {
  resetForm()
  emit('update:visible', false)
}
</script>

<style scoped>
.password-reset-content {
  padding: 0 20px;
}

.tips {
  margin-bottom: 20px;
  color: var(--color-text-regular);
}

.password-tips {
  margin: 8px 0 0 0;
  padding-left: 20px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.password-tips li {
  list-style: decimal;
}

:deep(.reset-password-dialog) {
  max-width: calc(100vw - 32px);
  margin: 0 auto;
}

:deep(.reset-password-dialog .el-dialog__header) {
  text-align: center;
}

:deep(.reset-password-dialog .el-dialog__body) {
  text-align: center;
  padding-top: 12px;
}

:deep(.reset-password-dialog .el-dialog__footer) {
  text-align: center;
}

@media (max-width: 768px) {
  .password-reset-content {
    padding: 0;
  }

  :deep(.reset-password-dialog) {
    width: calc(100vw - 24px) !important;
  }
}
</style>
