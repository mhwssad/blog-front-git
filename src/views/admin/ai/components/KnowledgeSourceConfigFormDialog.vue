<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑知识源配置"
    width="560px"
    :close-on-click-modal="false"
    align-center
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="同步间隔" prop="syncInterval">
        <el-input-number
          v-model="formData.syncInterval"
          :min="60"
          :max="86400"
          :step="60"
          style="width: 100%"
          placeholder="单位：秒"
        />
        <div class="form-tip">建议 300 秒以上，最小 60 秒</div>
      </el-form-item>
      <el-form-item label="配置 JSON">
        <el-input
          v-model="formData.configJson"
          type="textarea"
          :rows="4"
          placeholder='可选，JSON 格式配置参数'
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="可选，备注信息"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button
        v-permission="'ai:knowledge:update'"
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAiKnowledgeStore } from '@/stores'
import type { AiKnowledgeSourceConfigUpdateRequest } from '@/types/api-types'

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

const store = useAiKnowledgeStore()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

const formData = reactive<AiKnowledgeSourceConfigUpdateRequest>({
  syncInterval: 3600,
  configJson: '',
  remark: '',
})

const formRules: FormRules<AiKnowledgeSourceConfigUpdateRequest> = {
  syncInterval: [{ required: true, message: '请输入同步间隔', trigger: 'blur' }],
}

function resetForm(): void {
  formData.syncInterval = 3600
  formData.configJson = ''
  formData.remark = ''
  formRef.value?.clearValidate()
}

function loadFromStore(id: number): void {
  const config = store.sourceConfigs.find(c => c.id === id)
  if (config) {
    formData.syncInterval = config.syncInterval
    formData.configJson = config.configJson ?? ''
    formData.remark = config.remark ?? ''
  }
}

async function handleSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  if (!props.configId) return

  submitting.value = true
  try {
    const payload: AiKnowledgeSourceConfigUpdateRequest = {
      syncInterval: formData.syncInterval,
      configJson: formData.configJson?.trim() || undefined,
      remark: formData.remark?.trim() || undefined,
    }
    const success = await store.updateSourceConfig(props.configId, payload)
    if (success) {
      ElMessage.success('配置更新成功')
      emit('success')
      dialogVisible.value = false
    } else {
      ElMessage.error('配置更新失败')
    }
  } finally {
    submitting.value = false
  }
}

function handleClosed(): void {
  resetForm()
}

watch(
  () => [props.visible, props.configId] as const,
  ([visible, configId]) => {
    if (!visible) return
    resetForm()
    if (configId) loadFromStore(configId)
  },
  { immediate: true }
)
</script>

<style scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
