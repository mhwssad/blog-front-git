<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑账号' : '新增账号'"
    width="600px"
    :close-on-click-modal="false"
    align-center
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      v-loading="detailLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="账号名称" prop="accountName">
            <el-input
              v-model="formData.accountName"
              maxlength="64"
              placeholder="如 OpenAI-主账号"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="服务商" prop="provider">
            <el-input v-model="formData.provider" maxlength="32" placeholder="如 openai" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="模型名称" prop="modelName">
            <el-input
              v-model="formData.modelName"
              maxlength="64"
              placeholder="如 gpt-4o"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="权重" prop="weight">
            <el-input-number
              v-model="formData.weight"
              :min="1"
              :max="100"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="API 地址" prop="apiBaseUrl">
        <el-input
          v-model="formData.apiBaseUrl"
          placeholder="如 https://api.openai.com/v1"
        />
      </el-form-item>

      <el-form-item label="API Key" prop="apiKeyEncrypted">
        <el-input
          v-model="formData.apiKeyEncrypted"
          type="password"
          show-password
          placeholder="请输入 API Key"
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="日调用限额" prop="dailyQuota">
            <el-input-number
              v-model="formData.dailyQuota"
              :min="0"
              :max="100000"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最大连续错误" prop="maxConsecutiveErrors">
            <el-input-number
              v-model="formData.maxConsecutiveErrors"
              :min="1"
              :max="100"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="状态">
        <el-switch
          v-model="formData.status"
          :active-value="1"
          :inactive-value="0"
          active-text="启用"
          inactive-text="停用"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button
        v-permission="submitPermission"
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ isEdit ? '保存' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAiChannelStore } from '@/stores'
import type { AiChannelAccountSaveRequest } from '@/types/api-types'

interface Props {
  visible: boolean
  channelId: number | null
  accountId: number | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const channelStore = useAiChannelStore()

const formRef = ref<FormInstance>()
const detailLoading = ref(false)
const submitting = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

const isEdit = computed(() => !!props.accountId)
const submitPermission = computed(() =>
  isEdit.value ? 'ai:channel-account:update' : 'ai:channel-account:create'
)

const formData = reactive<AiChannelAccountSaveRequest>({
  accountName: '',
  provider: '',
  modelName: '',
  apiBaseUrl: '',
  apiKeyEncrypted: '',
  weight: 1,
  status: 1,
  dailyQuota: 0,
  maxConsecutiveErrors: 5,
})

const formRules: FormRules<AiChannelAccountSaveRequest> = {
  accountName: [{ required: true, message: '请输入账号名称', trigger: 'blur' }],
  provider: [{ required: true, message: '请输入服务商', trigger: 'blur' }],
  modelName: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  apiBaseUrl: [{ required: true, message: '请输入 API 地址', trigger: 'blur' }],
}

function resetForm(): void {
  Object.assign(formData, {
    accountName: '',
    provider: '',
    modelName: '',
    apiBaseUrl: '',
    apiKeyEncrypted: '',
    weight: 1,
    status: 1,
    dailyQuota: 0,
    maxConsecutiveErrors: 5,
  })
  formRef.value?.clearValidate()
}

async function loadAccountDetail(channelId: number, id: number): Promise<void> {
  detailLoading.value = true
  try {
    const detail = await channelStore.fetchChannelAccountById(channelId, id)
    if (!detail) {
      ElMessage.error('获取账号详情失败')
      return
    }
    Object.assign(formData, {
      accountName: detail.accountName,
      provider: detail.provider,
      modelName: detail.modelName,
      apiBaseUrl: detail.apiBaseUrl,
      apiKeyEncrypted: '',
      weight: detail.weight,
      status: detail.status,
      dailyQuota: detail.dailyQuota,
      maxConsecutiveErrors: detail.maxConsecutiveErrors,
    })
  } catch {
    ElMessage.error('获取账号详情失败')
  } finally {
    detailLoading.value = false
  }
}

async function handleSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const payload: AiChannelAccountSaveRequest = {
      accountName: formData.accountName.trim(),
      provider: formData.provider.trim(),
      modelName: formData.modelName.trim(),
      apiBaseUrl: formData.apiBaseUrl.trim(),
      apiKeyEncrypted: formData.apiKeyEncrypted,
      weight: formData.weight,
      status: formData.status,
      dailyQuota: formData.dailyQuota,
      maxConsecutiveErrors: formData.maxConsecutiveErrors,
    }

    let success = false
    if (isEdit.value && props.accountId && props.channelId) {
      success = await channelStore.updateChannelAccount(props.channelId, props.accountId, payload)
      if (success) ElMessage.success('账号更新成功')
    } else if (props.channelId) {
      success = await channelStore.createChannelAccount(props.channelId, payload)
      if (success) ElMessage.success('账号创建成功')
    }

    if (success) {
      emit('success')
      dialogVisible.value = false
    }
  } catch {
    // 校验失败
  } finally {
    submitting.value = false
  }
}

function handleClosed(): void {
  resetForm()
}

watch(
  () => [props.visible, props.channelId, props.accountId] as const,
  async ([visible, channelId, accountId]) => {
    if (!visible || !channelId) return
    resetForm()
    if (accountId) await loadAccountDetail(channelId, accountId)
  },
  { immediate: true }
)
</script>
