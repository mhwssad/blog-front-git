<template>
  <div class="settings-page">
    <h1 class="page-title">账号设置</h1>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本信息" name="profile">
        <el-card shadow="never">
          <el-form label-position="top" class="settings-form">
            <el-form-item label="头像">
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                accept="image/*"
                :on-change="handleAvatarChange"
              >
                <el-avatar :size="72" :src="profileForm.avatar">
                  {{ profileForm.nickname?.charAt(0) ?? '?' }}
                </el-avatar>
              </el-upload>
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="profileForm.nickname" maxlength="20" show-word-limit />
            </el-form-item>
            <el-form-item label="个人简介">
              <el-input
                v-model="profileForm.bio"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="profileForm.email" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="handleSaveProfile"
                >保存修改</el-button
              >
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="修改密码" name="password">
        <el-card shadow="never">
          <el-form label-position="top" class="settings-form">
            <el-form-item label="当前密码">
              <el-input v-model="passwordForm.oldPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="passwordForm.newPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认新密码">
              <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="handleSavePassword"
                >修改密码</el-button
              >
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="偏好设置" name="preference">
        <el-card shadow="never">
          <el-form label-position="top" class="settings-form">
            <el-form-item label="暗色模式">
              <el-switch v-model="prefForm.darkMode" disabled />
              <span class="form-hint">即将推出</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
/**
 * 账号设置页面
 * @description 管理用户的基本信息、修改密码和偏好设置
 * @module front/settings/UserSettings
 * @see ../../api/user/profile.ts
 */
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()

// 当前激活的标签页（profile/password/preference）
const activeTab = ref('profile')
// 是否正在保存
const saving = ref(false)

// 基本信息表单
const profileForm = reactive({
  avatar: '',
  nickname: '',
  bio: '',
  email: '',
})

// 密码修改表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 偏好设置表单
const prefForm = reactive({
  darkMode: false,
})

// 从全局状态加载用户资料到表单
function loadProfile(): void {
  const user = authStore.currentUser
  if (user) {
    profileForm.avatar = user.avatar ?? ''
    profileForm.nickname = user.nickname ?? ''
    profileForm.email = user.email ?? ''
  }
}

// 处理头像选择变化（预览本地图片）
function handleAvatarChange(file: UploadFile): void {
  if (file.raw) {
    profileForm.avatar = URL.createObjectURL(file.raw)
  }
}

/** 保存基本信息 */
async function handleSaveProfile(): Promise<void> {
  if (!profileForm.nickname.trim()) {
    ElMessage.warning('昵称不能为空')
    return
  }
  saving.value = true
  try {
    // TODO: 调用用户资料更新接口 (待后端提供)
    await new Promise(r => setTimeout(r, 300))
    ElMessage.success('基本信息已保存')
  } finally {
    saving.value = false
  }
}

/** 修改密码 */
async function handleSavePassword(): Promise<void> {
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    ElMessage.warning('请填写密码')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  if (passwordForm.newPassword.length < 6) {
    ElMessage.warning('密码长度至少 6 位')
    return
  }
  saving.value = true
  try {
    // TODO: 调用修改密码接口 (待后端提供)
    await new Promise(r => setTimeout(r, 300))
    ElMessage.success('密码已修改')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } finally {
    saving.value = false
  }
}

onMounted(loadProfile)
</script>

<style scoped>
.settings-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  margin: 0 0 24px;
  font-size: 22px;
  font-weight: 700;
}

.settings-form {
  max-width: 480px;
}

.form-hint {
  margin-left: 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
