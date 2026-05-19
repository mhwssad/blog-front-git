<template>
  <div class="lobby-settings-page">
    <el-card v-loading="chatStore.lobbyInfoLoading" shadow="never">
      <template #header>
        <div class="card-header">
          <span>大厅设置</span>
          <el-button
            v-permission="'content:chat:update'"
            type="primary"
            size="small"
            :loading="saving"
            @click="handleSave"
          >
            保存设置
          </el-button>
        </div>
      </template>

      <el-form :model="form" label-width="100px" class="settings-form">
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="大厅名称">
              <el-input v-model="form.name" placeholder="聊天大厅" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="发言等级">
              <el-input-number
                v-model="form.speakLevelLimit"
                :min="0"
                :max="100"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="慢速模式">
              <el-input-number
                v-model="form.slowModeSeconds"
                :min="0"
                :max="3600"
                controls-position="right"
              >
                <template #suffix>秒</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="游客发言">
              <el-switch
                v-model="form.allowGuestSpeak"
                inline-prompt
                active-text="允许"
                inactive-text="禁止"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="公告">
              <el-input
                v-model="form.notice"
                type="textarea"
                :rows="2"
                placeholder="大厅公告内容"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useLobbyAdmin } from '@/composables/useLobbyAdmin'

const { chatStore } = useLobbyAdmin()

const saving = ref(false)
const form = reactive({
  name: '',
  speakLevelLimit: 0,
  slowModeSeconds: 0,
  allowGuestSpeak: false,
  notice: '',
})

function populate(): void {
  const info = chatStore.lobbyInfo
  if (!info) return
  form.name = info.name ?? ''
  form.speakLevelLimit = info.speakLevelLimit ?? 0
  form.slowModeSeconds = info.slowModeSeconds ?? 0
  form.allowGuestSpeak = !!info.allowGuestView
  form.notice = info.notice ?? ''
}

async function handleSave(): Promise<void> {
  saving.value = true
  try {
    const success = await chatStore.updateLobbySettings({
      name: form.name,
      notice: form.notice,
      speakLevelLimit: form.speakLevelLimit,
      slowModeSeconds: form.slowModeSeconds,
      allowGuestSpeak: form.allowGuestSpeak,
    })
    if (success) {
      ElMessage.success('大厅设置已保存')
    } else {
      ElMessage.error('保存失败')
    }
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const ok = await chatStore.fetchLobbyInfo()
  if (ok) populate()
})
</script>

<style scoped>
.lobby-settings-page {
  max-width: 800px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
}
</style>
