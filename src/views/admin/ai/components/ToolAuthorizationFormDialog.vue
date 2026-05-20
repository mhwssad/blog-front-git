<template>
  <FormDialog
    v-model="dialogVisible"
    add-title="新增授权"
    edit-title="编辑授权"
    :is-edit="isEdit"
    width="560px"
    :loading="submitting"
    :confirm-permission="submitPermission"
    :confirm-text="isEdit ? '保存' : '创建'"
    @submit="handleSubmit"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="工具 ID" prop="toolId">
        <el-input-number
          v-model="formData.toolId"
          :min="1"
          placeholder="请输入工具 ID"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="授权类型" prop="authorizationType">
        <el-select
          v-model="formData.authorizationType"
          placeholder="请选择授权类型"
          style="width: 100%"
        >
          <el-option
            v-for="opt in AI_AUTHORIZATION_TYPE_OPTIONS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="授权标识" prop="authorizationKey">
        <el-input
          v-model="formData.authorizationKey"
          maxlength="256"
          placeholder="请输入授权标识"
        />
      </el-form-item>

      <el-form-item label="数据范围">
        <el-input
          v-model="formData.dataScope"
          type="textarea"
          :rows="3"
          placeholder="数据范围，可选"
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
import { AI_AUTHORIZATION_TYPE_OPTIONS } from '@/utils'
import type { AiToolAuthorizationVO, AiToolAuthorizationSaveRequest } from '@/types/api-types'

interface Props {
  visible: boolean
  auth: AiToolAuthorizationVO | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toolStore = useAiToolStore()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const isEdit = computed(() => !!props.auth)
const submitPermission = computed(() =>
  isEdit.value ? 'ai:tool:update' : 'ai:tool:create'
)

const formData = reactive<AiToolAuthorizationSaveRequest>({
  toolId: undefined as unknown as number,
  authorizationType: '',
  authorizationKey: '',
  dataScope: '',
  enabled: 1,
})

const formRules: FormRules<AiToolAuthorizationSaveRequest> = {
  toolId: [{ required: true, message: '请输入工具 ID', trigger: 'change' }],
  authorizationType: [{ required: true, message: '请选择授权类型', trigger: 'change' }],
  authorizationKey: [{ required: true, message: '请输入授权标识', trigger: 'blur' }],
}

function resetForm(): void {
  Object.assign(formData, {
    toolId: undefined as unknown as number,
    authorizationType: '',
    authorizationKey: '',
    dataScope: '',
    enabled: 1,
  })
  formRef.value?.clearValidate()
}

function populateForm(auth: AiToolAuthorizationVO): void {
  Object.assign(formData, {
    toolId: auth.toolId,
    authorizationType: auth.authorizationType,
    authorizationKey: auth.authorizationKey,
    dataScope: auth.dataScope ?? '',
    enabled: auth.enabled,
  })
}

async function handleSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const payload: AiToolAuthorizationSaveRequest = {
      toolId: formData.toolId,
      authorizationType: formData.authorizationType,
      authorizationKey: formData.authorizationKey.trim(),
      dataScope: formData.dataScope?.trim() || undefined,
      enabled: formData.enabled,
    }

    let success: boolean
    if (isEdit.value && props.auth) {
      success = await toolStore.updateAuthorization(props.auth.id, payload)
      if (success) ElMessage.success('授权更新成功')
    } else {
      success = await toolStore.createAuthorization(payload)
      if (success) ElMessage.success('授权创建成功')
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
  () => [props.visible, props.auth] as const,
  ([visible, auth]) => {
    if (!visible) return
    resetForm()
    if (auth) populateForm(auth)
  },
  { immediate: true }
)
</script>
