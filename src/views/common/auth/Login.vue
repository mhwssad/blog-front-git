<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>Blog Front</h1>
        <p>欢迎回来</p>
      </div>

      <el-tabs v-model="activeTab" class="login-tabs">
        <!-- 账号密码登录 -->
        <el-tab-pane label="账号登录" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            size="large"
            @submit.prevent="handlePasswordLogin"
          >
            <el-form-item prop="username">
              <el-input
                v-model="passwordForm.username"
                placeholder="请输入用户名/邮箱/手机号"
                :prefix-icon="User"
                clearable
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="passwordForm.password"
                type="password"
                placeholder="请输入密码"
                :prefix-icon="Lock"
                show-password
                clearable
                @keyup.enter="handlePasswordLogin"
              />
            </el-form-item>

            <el-form-item>
              <div class="login-options">
                <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                <el-link type="primary" :underline="false">忘记密码？</el-link>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                style="width: 100%"
                @click="handlePasswordLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 邮箱验证码登录 -->
        <el-tab-pane label="邮箱登录" name="email">
          <el-form
            ref="emailFormRef"
            :model="emailForm"
            :rules="emailRules"
            size="large"
            @submit.prevent="handleEmailLogin"
          >
            <el-form-item prop="email">
              <el-input
                v-model="emailForm.email"
                placeholder="请输入邮箱"
                :prefix-icon="Message"
                clearable
              />
            </el-form-item>

            <el-form-item prop="code">
              <div class="code-input-group">
                <el-input
                  v-model="emailForm.code"
                  placeholder="请输入验证码"
                  :prefix-icon="Key"
                  clearable
                  maxlength="6"
                  @keyup.enter="handleEmailLogin"
                />
                <el-button :disabled="countdown > 0" :loading="sendingCode" @click="handleSendCode">
                  {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
                </el-button>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                style="width: 100%"
                @click="handleEmailLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <div class="login-footer">
        <span>还没有账号？</span>
        <router-link to="/register" class="register-link"> 立即注册 </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * 登录页面
 * @description 支持账号密码登录和邮箱验证码登录两种方式
 * @module common/auth/Login
 * @see ../../api/auth.ts
 */
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, Key } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 当前激活的标签页（password | email）
const activeTab = ref('password')

// 加载状态
const loading = ref(false)
const sendingCode = ref(false)

// 记住我复选框状态
const rememberMe = ref(false)

// 验证码倒计时（单位：秒）
const countdown = ref(0)
/** 倒计时定时器 ID */
let countdownTimer: number | null = null

// 账号密码表单
const passwordFormRef = ref()
const passwordForm = reactive({
  username: 'admin',
  password: 'QWEasdzxc123',
})

const passwordRules = {
  username: [
    { required: true, message: '请输入用户名/邮箱/手机号', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
}

// 邮箱登录表单
const emailFormRef = ref()
const emailForm = reactive({
  email: '',
  code: '',
})

const emailRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为 6 位数字', trigger: 'blur' },
  ],
}

/**
 * 解析登录后重定向目标
 * @description 优先使用 URL query 中的 redirect，否则默认跳转首页
 */
function resolvePostLoginTarget(): string {
  const redirect = route.query.redirect
  // 仅允许相对路径跳转，避免开放重定向漏洞
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/'
}

// 账号密码登录
/**
 * 处理账号密码登录
 * @description 验证表单后调用 authStore.login，完成后跳转到目标页
 */
async function handlePasswordLogin() {
  try {
    await passwordFormRef.value?.validate()
    loading.value = true

    await authStore.login({
      username: passwordForm.username,
      password: passwordForm.password,
    })

    ElMessage.success('登录成功')
    router.push(resolvePostLoginTarget())
  } catch (error: any) {
    // 如果是验证错误，不显示消息
    if (!error) return
  } finally {
    loading.value = false
  }
}

// 发送邮箱验证码
async function handleSendCode() {
  try {
    await emailFormRef.value?.validateField('email')

    sendingCode.value = true
    await authStore.sendEmailCode({ email: emailForm.email })

    ElMessage.success('验证码已发送，请查收邮箱')

    // 开始倒计时
    countdown.value = 60
    countdownTimer = window.setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer!)
        countdownTimer = null
      }
    }, 1000)
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || '发送失败'
    ElMessage.error(message)
  } finally {
    sendingCode.value = false
  }
}

// 邮箱验证码登录
async function handleEmailLogin() {
  try {
    await emailFormRef.value?.validate()
    loading.value = true

    await authStore.emailLogin({
      email: emailForm.email,
      code: emailForm.code,
    })

    ElMessage.success('登录成功')
    router.push(resolvePostLoginTarget())
  } catch (error: any) {
    if (!error) return

    const message = error?.response?.data?.message || error?.message || '登录失败'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

// 清理倒计时定时器
onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 420px;
  padding: 40px;
  background: var(--color-white);
  border-radius: var(--border-radius-xlarge);
  box-shadow: var(--shadow-xlarge);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: var(--font-size-3xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.login-header p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.login-tabs {
  margin-bottom: 20px;
}

:deep(.el-tabs__header) {
  margin-bottom: 30px;
}

:deep(.el-tabs__item) {
  font-size: var(--font-size-lg);
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.code-input-group {
  display: flex;
  gap: var(--spacing-sm);
  width: 100%;
}

.code-input-group .el-input {
  flex: 1;
}

.code-input-group .el-button {
  flex-shrink: 0;
  width: 120px;
}

.login-footer {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.register-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  margin-left: var(--spacing-xs);
}

.register-link:hover {
  text-decoration: underline;
}
</style>
