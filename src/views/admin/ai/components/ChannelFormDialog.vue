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
            <el-input
              v-model="formData.channelName"
              maxlength="64"
              placeholder="如 OpenAI GPT-4o"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">额度配置</el-divider>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="全局日限额" prop="dailyQuota">
            <el-input-number
              v-model="formData.dailyQuota"
              :min="0"
              :max="1000000"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="用户日限额" prop="userDailyQuota">
            <el-input-number
              v-model="formData.userDailyQuota"
              :min="0"
              :max="100000"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="上下文长度" prop="maxContextTokens">
            <el-input-number
              v-model="formData.maxContextTokens"
              :min="0"
              :max="1000000"
              :step="1024"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">Token 预算</el-divider>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="输入上限" prop="maxInputTokens">
            <el-input-number
              v-model="formData.maxInputTokens"
              :min="0"
              :max="1000000"
              :step="256"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="历史上限" prop="maxHistoryTokens">
            <el-input-number
              v-model="formData.maxHistoryTokens"
              :min="0"
              :max="1000000"
              :step="256"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="RAG上限" prop="maxRagTokens">
            <el-input-number
              v-model="formData.maxRagTokens"
              :min="0"
              :max="1000000"
              :step="256"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="附件上限" prop="maxAttachmentTokens">
            <el-input-number
              v-model="formData.maxAttachmentTokens"
              :min="0"
              :max="1000000"
              :step="256"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="输出上限" prop="maxOutputTokens">
            <el-input-number
              v-model="formData.maxOutputTokens"
              :min="0"
              :max="1000000"
              :step="256"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">高级设置</el-divider>
      <el-form-item label="数据范围">
        <el-input
          v-model="formData.dataScopeJson"
          type="textarea"
          :rows="3"
          placeholder='["public_article","public_profile"]'
        />
      </el-form-item>
      <el-form-item label="提示词模板">
        <el-input
          v-model="formData.systemPromptTemplate"
          type="textarea"
          :rows="4"
          placeholder="请输入系统提示词模板"
        />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="状态">
            <el-switch
              v-model="formData.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="停用"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="默认渠道">
            <el-switch
              v-model="formData.isDefault"
              :active-value="1"
              :inactive-value="0"
              active-text="是"
              inactive-text="否"
            />
          </el-form-item>
        </el-col>
      </el-row>
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
import { AiSysApi } from '@/api/sys/ai'
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
  isEdit.value ? 'ai:channel-config:update' : 'ai:channel-config:create'
)

const formData = reactive<AiChannelConfigSaveRequest>({
  channelCode: '',
  channelName: '',
  dailyQuota: 0,
  userDailyQuota: 0,
  maxContextTokens: 4096,
  maxInputTokens: 0,
  maxHistoryTokens: 0,
  maxRagTokens: 0,
  maxAttachmentTokens: 0,
  maxOutputTokens: 0,
  dataScopeJson: '[]',
  systemPromptTemplate: '',
  status: 1,
  isDefault: 0,
})

const formRules: FormRules<AiChannelConfigSaveRequest> = {
  channelCode: [{ required: true, message: '请输入渠道编码', trigger: 'blur' }],
  channelName: [{ required: true, message: '请输入渠道名称', trigger: 'blur' }],
}

function resetForm(): void {
  Object.assign(formData, {
    channelCode: '',
    channelName: '',
    dailyQuota: 0,
    userDailyQuota: 0,
    maxContextTokens: 4096,
    maxInputTokens: 0,
    maxHistoryTokens: 0,
    maxRagTokens: 0,
    maxAttachmentTokens: 0,
    maxOutputTokens: 0,
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
    const response = await AiSysApi.getChannelById(id)
    const detail = response.data.data
    Object.assign(formData, {
      channelCode: detail.channelCode,
      channelName: detail.channelName,
      dailyQuota: detail.dailyQuota,
      userDailyQuota: detail.userDailyQuota,
      maxContextTokens: detail.maxContextTokens,
      maxInputTokens: detail.maxInputTokens,
      maxHistoryTokens: detail.maxHistoryTokens,
      maxRagTokens: detail.maxRagTokens,
      maxAttachmentTokens: detail.maxAttachmentTokens,
      maxOutputTokens: detail.maxOutputTokens,
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
      dailyQuota: formData.dailyQuota,
      userDailyQuota: formData.userDailyQuota,
      maxContextTokens: formData.maxContextTokens,
      maxInputTokens: formData.maxInputTokens,
      maxHistoryTokens: formData.maxHistoryTokens,
      maxRagTokens: formData.maxRagTokens,
      maxAttachmentTokens: formData.maxAttachmentTokens,
      maxOutputTokens: formData.maxOutputTokens,
      dataScopeJson: formData.dataScopeJson?.trim() || undefined,
      systemPromptTemplate: formData.systemPromptTemplate?.trim() || undefined,
      status: formData.status,
      isDefault: formData.isDefault,
    }

    if (isEdit.value && props.channelId) {
      await AiSysApi.updateChannel(props.channelId, payload)
      ElMessage.success('渠道更新成功')
    } else {
      await AiSysApi.createChannel(payload)
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
  { immediate: true }
)
</script>
