<template>
  <div class="forgot-container">
    <div class="forgot-card">
      <h2 class="card-title">找回密码</h2>
      <p class="card-desc">输入注册邮箱，我们将发送验证码到您的邮箱</p>

      <el-form label-position="top" class="forgot-form">
        <el-form-item label="邮箱">
          <div class="code-input-group">
            <el-input v-model="form.email" placeholder="请输入注册邮箱" />
            <el-button :disabled="countdown > 0" @click="handleSendCode">
              {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="验证码">
          <el-input v-model="form.code" placeholder="请输入验证码" maxlength="6" />
        </el-form-item>

        <el-form-item label="新密码">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入新密码（6-20位）" />
        </el-form-item>

        <el-form-item label="确认密码">
          <el-input v-model="form.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>

        <el-button type="primary" :loading="loading" class="submit-btn" @click="handleReset">
          重置密码
        </el-button>
      </el-form>

      <div class="card-footer">
        <router-link to="/login">返回登录</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const countdown = ref(0)

const form = reactive({
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
})

let timer: ReturnType<typeof setInterval> | null = null

function handleSendCode(): void {
  if (!form.email) {
    ElMessage.warning('请输入邮箱')
    return
  }
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
  ElMessage.success('验证码已发送')
}

async function handleReset(): Promise<void> {
  if (form.password !== form.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  loading.value = true
  await new Promise((r) => setTimeout(r, 1000))
  loading.value = false
  ElMessage.success('密码重置成功，请重新登录')
  router.push('/login')
}
</script>

<style scoped>
.forgot-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.forgot-card {
  width: 420px;
  padding: 40px 36px;
  background: #fff;
  border-radius: var(--el-border-radius-round, 16px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.card-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
}

.card-desc {
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.code-input-group {
  display: flex;
  gap: 8px;
  width: 100%;
}

.code-input-group .el-input {
  flex: 1;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
}

.card-footer {
  margin-top: 20px;
  text-align: center;
}

.card-footer a {
  font-size: 14px;
  color: var(--el-color-primary);
  text-decoration: none;
}
</style>
