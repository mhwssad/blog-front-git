<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑渠道配置' : '新增渠道配置'"
    width="640px"
    :close-on-click-modal="false"
    align-center
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      v-loading="detailLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-divider content-position="left">基本信息</el-divider>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="渠道编码" prop="channelCode">
            <el-input v-model="formData.channelCode" maxlength="64" placeholder="如 openai-gpt4o" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="渠道名称" prop="channelName">
            <el-input v-model="formData.channelName" maxlength="64" placeholder="如 OpenAI GPT-4o" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="提供方" prop="provider">
            <el-input v-model="formData.provider" maxlength="64" placeholder="如 openai、deepseek" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模型名称" prop="modelName">
            <el-input v-model="formData.modelName" maxlength="128" placeholder="如 gpt-4o" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">API 配置</el-divider>
      <el-form-item label="API 地址" prop="apiBaseUrl">
        <el-input v-model="formData.apiBaseUrl" placeholder="https://api.openai.com/v1" />
      </el-form-item>
      <el-form-item label="API Key" prop="apiKeyEncrypted">
        <el-input
          v-model="formData.apiKeyEncrypted"
          type="password"
          show-password
          placeholder="请输入 API Key"
        />
      </el-form-item>

      <el-divider content-position="left">额度配置</el-divider>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="全局日限额" prop="dailyQuota">
            <el-input-number v-model="formData.dailyQuota" :min="0" :max="1000000" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="用户日限额" prop="userDailyQuota">
            <el-input-number v-model="formData.userDailyQuota" :min="0" :max="100000" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="上下文长度" prop="maxContextTokens">
            <el-input-number v-model="formData.maxContextTokens" :min="0" :max="1000000" :step="1024" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">高级设置</el-divider>
      <el-form-item label="数据范围">
        <el-input v-model="formData.dataScopeJson" type="textarea" :rows="3" placeholder='["public_article","public_profile"]' />
      </el-form-item>
      <el-form-item label="提示词模板">
        <el-input v-model="formData.systemPromptTemplate" type="textarea" :rows="4" placeholder="请输入系统提示词模板" />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="状态">
            <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="停用" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="默认渠道">
            <el-switch v-model="formData.isDefault" :active-value="1" :inactive-value="0" active-text="是" inactive-text="否" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button v-permission="submitPermission" type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEdit ? '保存' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { aiSysApi } from '@/api/sys/ai'
import type { AiChannelConfigSaveRequest } from '@/types/api-types'

interface Props {
  visible: boolean
  channelId: number | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const detailLoading = ref(false)
const submitting = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

const isEdit = computed(() => !!props.channelId)
const submitPermission = computed(() =>
  isEdit.value ? 'ai:channel-config:update' : 'ai:channel-config:create',
)

const formData = reactive<AiChannelConfigSaveRequest>({
  channelCode: '',
  channelName: '',
  provider: '',
  modelName: '',
  apiBaseUrl: '',
  apiKeyEncrypted: '',
  dailyQuota: 0,
  userDailyQuota: 0,
  maxContextTokens: 4096,
  dataScopeJson: '[]',
  systemPromptTemplate: '',
  status: 1,
  isDefault: 0,
})

const formRules: FormRules<AiChannelConfigSaveRequest> = {
  channelCode: [{ required: true, message: '请输入渠道编码', trigger: 'blur' }],
  channelName: [{ required: true, message: '请输入渠道名称', trigger: 'blur' }],
  provider: [{ required: true, message: '请输入提供方', trigger: 'blur' }],
  modelName: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
}

function resetForm(): void {
  Object.assign(formData, {
    channelCode: '',
    channelName: '',
    provider: '',
    modelName: '',
    apiBaseUrl: '',
    apiKeyEncrypted: '',
    dailyQuota: 0,
    userDailyQuota: 0,
    maxContextTokens: 4096,
    dataScopeJson: '[]',
    systemPromptTemplate: '',
    status: 1,
    isDefault: 0,
  })
  formRef.value?.clearValidate()
}

async function loadChannelDetail(id: number): Promise<void> {
  detailLoading.value = true
  try {
    const response = await aiSysApi.getChannelById(id)
    const detail = response.data.data
    Object.assign(formData, {
      channelCode: detail.channelCode,
      channelName: detail.channelName,
      provider: detail.provider,
      modelName: detail.modelName,
      apiBaseUrl: detail.apiBaseUrl ?? '',
      apiKeyEncrypted: detail.apiKeyEncrypted ?? '',
      dailyQuota: detail.dailyQuota,
      userDailyQuota: detail.userDailyQuota,
      maxContextTokens: detail.maxContextTokens,
      dataScopeJson: detail.dataScopeJson ?? '[]',
      systemPromptTemplate: detail.systemPromptTemplate ?? '',
      status: detail.status,
      isDefault: detail.isDefault,
    })
  } catch {
    ElMessage.error('获取渠道详情失败')
  } finally {
    detailLoading.value = false
  }
}

async function handleSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const payload: AiChannelConfigSaveRequest = {
      channelCode: formData.channelCode.trim(),
      channelName: formData.channelName.trim(),
      provider: formData.provider.trim(),
      modelName: formData.modelName.trim(),
      apiBaseUrl: formData.apiBaseUrl?.trim() || undefined,
      apiKeyEncrypted: formData.apiKeyEncrypted?.trim() || undefined,
      dailyQuota: formData.dailyQuota,
      userDailyQuota: formData.userDailyQuota,
      maxContextTokens: formData.maxContextTokens,
      dataScopeJson: formData.dataScopeJson?.trim() || undefined,
      systemPromptTemplate: formData.systemPromptTemplate?.trim() || undefined,
      status: formData.status,
      isDefault: formData.isDefault,
    }

    if (isEdit.value && props.channelId) {
      await aiSysApi.updateChannel(props.channelId, payload)
      ElMessage.success('渠道更新成功')
    } else {
      await aiSysApi.createChannel(payload)
      ElMessage.success('渠道创建成功')
    }

    emit('success')
    dialogVisible.value = false
  } catch {
    // 校验失败或请求失败
  } finally {
    submitting.value = false
  }
}

function handleClosed(): void {
  resetForm()
}

watch(
  () => [props.visible, props.channelId] as const,
  async ([visible, channelId]) => {
    if (!visible) return
    resetForm()
    if (channelId) await loadChannelDetail(channelId)
  },
  { immediate: true },
)
</script>
