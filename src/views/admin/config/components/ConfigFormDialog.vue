<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑配置' : '新增配置'"
    width="560px"
    class="config-form-dialog"
    :close-on-click-modal="false"
    align-center
    center
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      v-loading="detailLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="配置名称" prop="configName">
        <el-input v-model="formData.configName" maxlength="64" placeholder="请输入配置名称" />
      </el-form-item>
      <el-form-item label="配置键" prop="configKey">
        <el-input v-model="formData.configKey" maxlength="128" placeholder="请输入配置键，如 sys.name" />
      </el-form-item>
      <el-form-item label="配置值" prop="configValue">
        <el-input
          v-model="formData.configValue"
          type="textarea"
          :rows="5"
          placeholder="请输入配置值"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          maxlength="255"
          show-word-limit
          placeholder="请输入备注"
        />
      </el-form-item>
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
import { configApi } from '@/api/sys/config'
import type { SysConfigSaveRequest } from '@/api/types'

interface Props {
  visible: boolean
  configId: number | null
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

const isEdit = computed(() => !!props.configId)
const submitPermission = computed(() => (isEdit.value ? 'sys:config:update' : 'sys:config:create'))

const formData = reactive<SysConfigSaveRequest>({
  configName: '',
  configKey: '',
  configValue: '',
  remark: '',
})

const formRules: FormRules<SysConfigSaveRequest> = {
  configName: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  configKey: [{ required: true, message: '请输入配置键', trigger: 'blur' }],
  configValue: [{ required: true, message: '请输入配置值', trigger: 'blur' }],
}

function resetForm(): void {
  Object.assign(formData, {
    configName: '',
    configKey: '',
    configValue: '',
    remark: '',
  })
  formRef.value?.clearValidate()
}

async function loadConfigDetail(configId: number): Promise<void> {
  detailLoading.value = true
  try {
    const response = await configApi.getConfigById(configId)
    const detail = response.data.data
    Object.assign(formData, {
      configName: detail.configName,
      configKey: detail.configKey,
      configValue: detail.configValue,
      remark: detail.remark ?? '',
    })
  } catch {
    ElMessage.error('获取配置详情失败')
  } finally {
    detailLoading.value = false
  }
}

async function handleSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const payload: SysConfigSaveRequest = {
      configName: formData.configName.trim(),
      configKey: formData.configKey.trim(),
      configValue: formData.configValue,
      remark: formData.remark?.trim() || undefined,
    }

    if (isEdit.value && props.configId) {
      await configApi.updateConfig(props.configId, payload)
      ElMessage.success('配置更新成功')
    } else {
      await configApi.createConfig(payload)
      ElMessage.success('配置创建成功')
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
  () => [props.visible, props.configId] as const,
  async ([visible, configId]) => {
    if (!visible) {
      return
    }

    resetForm()

    if (configId) {
      await loadConfigDetail(configId)
    }
  },
  { immediate: true }
)
</script>
