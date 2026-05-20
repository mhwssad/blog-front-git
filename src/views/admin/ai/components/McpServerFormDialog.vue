<template>
  <FormDialog
    v-model="dialogVisible"
    add-title="新增 MCP 服务"
    edit-title="编辑 MCP 服务"
    :is-edit="isEdit"
    width="680px"
    :loading="submitting"
    :confirm-permission="submitPermission"
    :confirm-text="isEdit ? '保存' : '创建'"
    @submit="handleSubmit"
  >
    <el-form
      ref="formRef"
      v-loading="detailLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="服务名称" prop="serverName">
        <el-input
          v-model="formData.serverName"
          maxlength="128"
          placeholder="请输入 MCP 服务名称"
        />
      </el-form-item>

      <el-form-item label="传输类型" prop="transportType">
        <el-select
          v-model="formData.transportType"
          placeholder="请选择传输类型"
          style="width: 100%"
        >
          <el-option
            v-for="opt in AI_MCP_TRANSPORT_TYPE_OPTIONS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="连接配置" prop="connectionConfigJson">
        <el-input
          v-model="formData.connectionConfigJson"
          type="textarea"
          :rows="4"
          placeholder='JSON 格式，如 {"url": "https://example.com/mcp"}'
        />
      </el-form-item>

      <el-form-item label="认证配置">
        <el-input
          v-model="formData.authConfigJson"
          type="textarea"
          :rows="3"
          placeholder="JSON 格式，可选"
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="超时(秒)" prop="timeoutSeconds">
            <el-input-number
              v-model="formData.timeoutSeconds"
              :min="1"
              :max="3600"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="启用">
            <el-switch
              v-model="formData.enabled"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="停用"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </FormDialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAiMcpStore } from '@/stores'
import { AI_MCP_TRANSPORT_TYPE_OPTIONS } from '@/utils'
import type { AiMcpServerSaveRequest } from '@/types/api-types'

interface Props {
  visible: boolean
  serverId: number | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const store = useAiMcpStore()

const formRef = ref<FormInstance>()
const detailLoading = ref(false)
const submitting = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

const isEdit = computed(() => !!props.serverId)
const submitPermission = computed(() =>
  isEdit.value ? 'ai:mcp:update' : 'ai:mcp:create'
)

const formData = reactive<AiMcpServerSaveRequest>({
  serverName: '',
  transportType: '',
  connectionConfigJson: '',
  authConfigJson: '',
  timeoutSeconds: 30,
  enabled: 1,
})

const formRules: FormRules<AiMcpServerSaveRequest> = {
  serverName: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
  transportType: [{ required: true, message: '请选择传输类型', trigger: 'change' }],
  connectionConfigJson: [{ required: true, message: '请输入连接配置', trigger: 'blur' }],
}

function resetForm(): void {
  Object.assign(formData, {
    serverName: '',
    transportType: '',
    connectionConfigJson: '',
    authConfigJson: '',
    timeoutSeconds: 30,
    enabled: 1,
  })
  formRef.value?.clearValidate()
}

async function loadDetail(id: number): Promise<void> {
  detailLoading.value = true
  try {
    const detail = await store.fetchServerById(id)
    if (!detail) {
      ElMessage.error('获取 MCP 服务详情失败')
      return
    }
    Object.assign(formData, {
      serverName: detail.serverName,
      transportType: detail.transportType,
      connectionConfigJson: detail.connectionConfigJson,
      authConfigJson: '',
      timeoutSeconds: detail.timeoutSeconds,
      enabled: detail.enabled,
    })
  } catch {
    ElMessage.error('获取 MCP 服务详情失败')
  } finally {
    detailLoading.value = false
  }
}

async function handleSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const payload: AiMcpServerSaveRequest = {
      serverName: formData.serverName.trim(),
      transportType: formData.transportType,
      connectionConfigJson: formData.connectionConfigJson.trim(),
      authConfigJson: formData.authConfigJson?.trim() || undefined,
      timeoutSeconds: formData.timeoutSeconds,
      enabled: formData.enabled,
    }

    let success: boolean
    if (isEdit.value && props.serverId) {
      success = await store.updateServer(props.serverId, payload)
      if (success) ElMessage.success('MCP 服务更新成功')
    } else {
      success = await store.createServer(payload)
      if (success) ElMessage.success('MCP 服务创建成功')
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

watch(
  () => [props.visible, props.serverId] as const,
  async ([visible, serverId]) => {
    if (!visible) return
    resetForm()
    if (serverId) await loadDetail(serverId)
  },
  { immediate: true }
)
</script>
