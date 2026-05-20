<template>
  <FormDialog
    v-model="dialogVisible"
    add-title="新增工具"
    edit-title="编辑工具"
    :is-edit="isEdit"
    width="760px"
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
      label-width="110px"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="工具编码" prop="toolCode">
            <el-input
              v-model="formData.toolCode"
              maxlength="128"
              placeholder="请输入工具编码"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工具名称" prop="toolName">
            <el-input
              v-model="formData.toolName"
              maxlength="128"
              placeholder="请输入工具名称"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="来源类型" prop="sourceType">
            <el-select v-model="formData.sourceType" placeholder="请选择来源类型" style="width: 100%">
              <el-option
                v-for="opt in AI_TOOL_SOURCE_TYPE_OPTIONS"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="风险等级" prop="riskLevel">
            <el-select v-model="formData.riskLevel" placeholder="请选择风险等级" style="width: 100%">
              <el-option
                v-for="opt in AI_TOOL_RISK_LEVEL_OPTIONS"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="MCP 服务 ID">
            <el-input-number
              v-model="formData.mcpServerId"
              :min="1"
              placeholder="可选"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="MCP 工具名">
            <el-input
              v-model="formData.mcpToolName"
              maxlength="128"
              placeholder="可选"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          maxlength="512"
          placeholder="请输入描述"
        />
      </el-form-item>

      <el-form-item label="参数 Schema">
        <el-input
          v-model="formData.parametersSchema"
          type="textarea"
          :rows="4"
          placeholder="JSON Schema，可选"
        />
      </el-form-item>

      <el-form-item label="结果 Schema">
        <el-input
          v-model="formData.resultSchema"
          type="textarea"
          :rows="4"
          placeholder="JSON Schema，可选"
        />
      </el-form-item>

      <el-form-item label="使用场景">
        <el-input
          v-model="formData.useScenarios"
          type="textarea"
          :rows="3"
          placeholder="描述工具的使用场景，可选"
        />
      </el-form-item>

      <el-form-item label="启用">
        <el-switch v-model="formData.enabled" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>
  </FormDialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAiToolStore } from '@/stores'
import { AI_TOOL_SOURCE_TYPE_OPTIONS, AI_TOOL_RISK_LEVEL_OPTIONS } from '@/utils'
import type { AiToolSaveRequest } from '@/types/api-types'

interface Props {
  visible: boolean
  toolId: number | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toolStore = useAiToolStore()

const formRef = ref<FormInstance>()
const detailLoading = ref(false)
const submitting = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const isEdit = computed(() => !!props.toolId)
const submitPermission = computed(() =>
  isEdit.value ? 'ai:tool:update' : 'ai:tool:create'
)

const formData = reactive<AiToolSaveRequest>({
  toolCode: '',
  toolName: '',
  sourceType: '',
  mcpServerId: undefined,
  mcpToolName: '',
  description: '',
  parametersSchema: '',
  resultSchema: '',
  riskLevel: '',
  useScenarios: '',
  enabled: 1,
})

const formRules: FormRules<AiToolSaveRequest> = {
  toolCode: [{ required: true, message: '请输入工具编码', trigger: 'blur' }],
  toolName: [{ required: true, message: '请输入工具名称', trigger: 'blur' }],
  sourceType: [{ required: true, message: '请选择来源类型', trigger: 'change' }],
  riskLevel: [{ required: true, message: '请选择风险等级', trigger: 'change' }],
}

function resetForm(): void {
  Object.assign(formData, {
    toolCode: '',
    toolName: '',
    sourceType: '',
    mcpServerId: undefined,
    mcpToolName: '',
    description: '',
    parametersSchema: '',
    resultSchema: '',
    riskLevel: '',
    useScenarios: '',
    enabled: 1,
  })
  formRef.value?.clearValidate()
}

async function loadDetail(id: number): Promise<void> {
  detailLoading.value = true
  try {
    const detail = await toolStore.fetchToolById(id)
    if (!detail) {
      ElMessage.error('获取工具详情失败')
      return
    }
    Object.assign(formData, {
      toolCode: detail.toolCode,
      toolName: detail.toolName,
      sourceType: detail.sourceType,
      mcpServerId: detail.mcpServerId,
      mcpToolName: detail.mcpToolName ?? '',
      description: detail.description ?? '',
      parametersSchema: detail.parametersSchema ?? '',
      resultSchema: detail.resultSchema ?? '',
      riskLevel: detail.riskLevel,
      useScenarios: detail.useScenarios ?? '',
      enabled: detail.enabled,
    })
  } catch {
    ElMessage.error('获取工具详情失败')
  } finally {
    detailLoading.value = false
  }
}

async function handleSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const payload: AiToolSaveRequest = {
      toolCode: formData.toolCode.trim(),
      toolName: formData.toolName.trim(),
      sourceType: formData.sourceType,
      mcpServerId: formData.mcpServerId,
      mcpToolName: formData.mcpToolName?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      parametersSchema: formData.parametersSchema?.trim() || undefined,
      resultSchema: formData.resultSchema?.trim() || undefined,
      riskLevel: formData.riskLevel,
      useScenarios: formData.useScenarios?.trim() || undefined,
      enabled: formData.enabled,
    }

    let success: boolean
    if (isEdit.value && props.toolId) {
      success = await toolStore.updateTool(props.toolId, payload)
      if (success) ElMessage.success('工具更新成功')
    } else {
      success = await toolStore.createTool(payload)
      if (success) ElMessage.success('工具创建成功')
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
  () => [props.visible, props.toolId] as const,
  async ([visible, toolId]) => {
    if (!visible) return
    resetForm()
    if (toolId) await loadDetail(toolId)
  },
  { immediate: true }
)
</script>
