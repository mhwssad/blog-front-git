<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑 Agent' : '新增 Agent'"
    width="680px"
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
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="名称" prop="name">
            <el-input v-model="formData.name" maxlength="64" placeholder="请输入 Agent 名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关联渠道" prop="channelConfigId">
            <el-select v-model="formData.channelConfigId" placeholder="请选择渠道" style="width: 100%">
              <el-option
                v-for="ch in channelStore.channels"
                :key="ch.id"
                :label="ch.channelName"
                :value="ch.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述" prop="description">
        <el-input v-model="formData.description" maxlength="256" placeholder="请输入描述" />
      </el-form-item>

      <el-form-item label="系统提示词" prop="systemPrompt">
        <el-input
          v-model="formData.systemPrompt"
          type="textarea"
          :rows="5"
          placeholder="请输入系统提示词"
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="最大轮次" prop="maxTurns">
            <el-input-number
              v-model="formData.maxTurns"
              :min="1"
              :max="100"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="数据范围">
        <el-input
          v-model="formData.dataScopeJson"
          type="textarea"
          :rows="3"
          placeholder='JSON 数组，如 ["public_article"]'
        />
      </el-form-item>

      <el-form-item label="扩展配置">
        <el-input
          v-model="formData.extraConfigJson"
          type="textarea"
          :rows="3"
          placeholder="JSON 对象，可选"
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
import { useAiAgentStore, useAiChannelStore } from '@/stores'
import type { AiAgentDefinitionSaveRequest } from '@/types/api-types'

interface Props {
  visible: boolean
  agentId: number | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const agentStore = useAiAgentStore()
const channelStore = useAiChannelStore()

const formRef = ref<FormInstance>()
const detailLoading = ref(false)
const submitting = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

const isEdit = computed(() => !!props.agentId)
const submitPermission = computed(() =>
  isEdit.value ? 'ai:agent:update' : 'ai:agent:create'
)

const formData = reactive<AiAgentDefinitionSaveRequest>({
  name: '',
  description: '',
  systemPrompt: '',
  channelConfigId: undefined as unknown as number,
  dataScopeJson: '',
  maxTurns: 10,
  extraConfigJson: '',
})

const formRules: FormRules<AiAgentDefinitionSaveRequest> = {
  name: [{ required: true, message: '请输入 Agent 名称', trigger: 'blur' }],
  systemPrompt: [{ required: true, message: '请输入系统提示词', trigger: 'blur' }],
  channelConfigId: [{ required: true, message: '请选择关联渠道', trigger: 'change' }],
}

function resetForm(): void {
  Object.assign(formData, {
    name: '',
    description: '',
    systemPrompt: '',
    channelConfigId: undefined as unknown as number,
    dataScopeJson: '',
    maxTurns: 10,
    extraConfigJson: '',
  })
  formRef.value?.clearValidate()
}

async function loadDetail(id: number): Promise<void> {
  detailLoading.value = true
  try {
    const detail = await agentStore.fetchDefinitionById(id)
    if (!detail) {
      ElMessage.error('获取 Agent 详情失败')
      return
    }
    Object.assign(formData, {
      name: detail.name,
      description: detail.description ?? '',
      systemPrompt: detail.systemPrompt,
      channelConfigId: detail.channelConfigId,
      dataScopeJson: detail.dataScopeJson ?? '',
      maxTurns: detail.maxTurns,
      extraConfigJson: detail.extraConfigJson ?? '',
    })
  } catch {
    ElMessage.error('获取 Agent 详情失败')
  } finally {
    detailLoading.value = false
  }
}

async function handleSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const payload: AiAgentDefinitionSaveRequest = {
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      systemPrompt: formData.systemPrompt.trim(),
      channelConfigId: formData.channelConfigId,
      dataScopeJson: formData.dataScopeJson?.trim() || undefined,
      maxTurns: formData.maxTurns,
      extraConfigJson: formData.extraConfigJson?.trim() || undefined,
    }

    let success: boolean
    if (isEdit.value && props.agentId) {
      success = await agentStore.updateDefinition(props.agentId, payload)
      if (success) ElMessage.success('Agent 更新成功')
    } else {
      success = await agentStore.createDefinition(payload)
      if (success) ElMessage.success('Agent 创建成功')
    }

    if (!success) {
      ElMessage.error('操作失败，请重试')
      return
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
  () => [props.visible, props.agentId] as const,
  async ([visible, agentId]) => {
    if (!visible) return
    resetForm()
    if (agentId) await loadDetail(agentId)
  },
  { immediate: true }
)
</script>
