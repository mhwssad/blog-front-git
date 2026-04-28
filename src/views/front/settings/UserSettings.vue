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
                  {{ profileForm.nickname[0] }}
                </el-avatar>
              </el-upload>
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="profileForm.nickname" maxlength="20" show-word-limit />
            </el-form-item>
            <el-form-item label="个人简介">
              <el-input v-model="profileForm.bio" type="textarea" :rows="3" maxlength="200" show-word-limit />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="profileForm.email" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="handleSaveProfile">保存修改</el-button>
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
              <el-button type="primary" :loading="saving" @click="handleSavePassword">修改密码</el-button>
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
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="handleSavePref">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'

const activeTab = ref('profile')
const saving = ref(false)

const profileForm = reactive({
  avatar: '',
  nickname: '测试用户',
  bio: '这个人很懒，什么都没写。',
  email: 'test@example.com',
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const prefForm = reactive({
  darkMode: false,
})

function handleAvatarChange(file: UploadFile): void {
  if (file.raw) {
    profileForm.avatar = URL.createObjectURL(file.raw)
  }
}

async function handleSaveProfile(): Promise<void> {
  saving.value = true
  await new Promise((r) => setTimeout(r, 500))
  saving.value = false
  ElMessage.success('基本信息已保存')
}

async function handleSavePassword(): Promise<void> {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  saving.value = true
  await new Promise((r) => setTimeout(r, 500))
  saving.value = false
  ElMessage.success('密码已修改')
}

async function handleSavePref(): Promise<void> {
  saving.value = true
  await new Promise((r) => setTimeout(r, 500))
  saving.value = false
  ElMessage.success('偏好设置已保存')
}
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
