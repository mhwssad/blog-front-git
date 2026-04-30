<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h1>用户注册</h1>
        <p>创建您的账号，完善基础信息后即可开始使用</p>
      </div>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        size="large"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
            maxlength="50"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            clearable
            maxlength="20"
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请确认密码"
            :prefix-icon="Lock"
            show-password
            clearable
            maxlength="20"
            @keyup.enter="handleRegister"
          />
        </el-form-item>

        <el-form-item prop="nickname">
          <el-input
            v-model="formData.nickname"
            placeholder="请输入昵称（选填）"
            :prefix-icon="User"
            clearable
            maxlength="50"
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入邮箱（选填）"
            :prefix-icon="Message"
            clearable
            maxlength="100"
          />
        </el-form-item>

        <el-form-item prop="phone">
          <el-input
            v-model="formData.phone"
            placeholder="请输入手机号（选填）"
            :prefix-icon="Iphone"
            clearable
            maxlength="20"
          />
        </el-form-item>

        <el-form-item prop="agreement">
          <el-checkbox v-model="formData.agreement">
            我已阅读并同意
            <el-link type="primary" :underline="false">用户协议</el-link>
            和
            <el-link type="primary" :underline="false">隐私政策</el-link>
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="authStore.loading"
            style="width: 100%"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-button size="large" style="width: 100%" @click="router.push('/login')">
            返回登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Message, Iphone } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { RegisterRequest } from '@/types/api-types'

const router = useRouter()
const authStore = useAuthStore()

interface RegisterFormData {
  username: string
  password: string
  confirmPassword: string
  nickname: string
  email: string
  phone: string
  agreement: boolean
}

const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<RegisterFormData>({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  email: '',
  phone: '',
  agreement: false,
})

function isBlank(value: string): boolean {
  return !value.trim()
}

// 自定义验证：用户名
const validateUsername = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  const normalized = value.trim()

  if (!normalized) {
    callback(new Error('请输入用户名'))
    return
  }

  if (normalized.length < 3 || normalized.length > 50) {
    callback(new Error('用户名长度在 3 到 50 个字符'))
    return
  }

  callback()
}

// 自定义验证：确认密码
const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value !== formData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 自定义验证：用户协议
const validateAgreement = (_rule: unknown, value: boolean, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议和隐私政策'))
  } else {
    callback()
  }
}

// 自定义验证：昵称
const validateNickname = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (isBlank(value)) {
    callback()
    return
  }

  const normalized = value.trim()
  if (normalized.length < 2 || normalized.length > 50) {
    callback(new Error('昵称长度在 2 到 50 个字符'))
    return
  }

  callback()
}

// 自定义验证：邮箱
const validateEmail = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (isBlank(value)) {
    callback()
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    callback(new Error('请输入正确的邮箱地址'))
    return
  }

  callback()
}

// 自定义验证：手机号
const validatePhone = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (isBlank(value)) {
    callback()
    return
  }

  if (!/^1\d{10}$/.test(value.trim())) {
    callback(new Error('请输入正确的手机号'))
    return
  }

  callback()
}

// 表单验证规则
const formRules: FormRules<RegisterFormData> = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
  nickname: [{ validator: validateNickname, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  agreement: [{ validator: validateAgreement, trigger: 'change' }],
}

function normalizeOptionalField(value: string): string | undefined {
  const normalized = value.trim()
  return normalized ? normalized : undefined
}

function buildRegisterPayload(): RegisterRequest {
  return {
    username: formData.username.trim(),
    password: formData.password,
    nickname: normalizeOptionalField(formData.nickname),
    email: normalizeOptionalField(formData.email),
    phone: normalizeOptionalField(formData.phone),
  }
}

// 注册
async function handleRegister() {
  try {
    const isValid = await formRef.value?.validate().catch(() => false)
    if (!isValid) return

    const result = await authStore.register(buildRegisterPayload())

    if (result.autoLoggedIn) {
      ElMessage.success('注册成功，已自动登录')
      router.push('/admin')
      return
    }

    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error: any) {
    // API 调用失败时显示错误消息
    const message = error?.response?.data?.message || error?.message || '注册失败，请稍后重试'
    ElMessage.error(message)
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-box {
  width: 480px;
  max-width: 100%;
  padding: 40px;
  background: var(--color-white);
  border-radius: var(--border-radius-xlarge);
  box-shadow: var(--shadow-xlarge);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  font-size: var(--font-size-3xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.register-header p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}
</style>
