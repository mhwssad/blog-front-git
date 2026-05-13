<template>
  <el-dialog
    v-model="dialogVisible"
    title="触发知识同步"
    width="480px"
    :close-on-click-modal="false"
    align-center
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="来源类型">
        <el-tag>{{ formatAiSourceType(props.sourceType) }}</el-tag>
      </el-form-item>
      <el-form-item label="任务类型" prop="taskType">
        <el-select v-model="formData.taskType" placeholder="请选择任务类型" style="width: 100%">
          <el-option label="全量同步" value="full" />
          <el-option label="增量同步" value="incremental" />
        </el-select>
      </el-form-item>
      <el-form-item label="数据源 ID">
        <el-input-number
          v-model="formData.sourceId"
          :min="1"
          placeholder="可选，指定单个数据源"
          style="width: 100%"
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
        v-permission="'ai:knowledge:sync'"
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        触发同步
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAiKnowledgeStore } from '@/stores'
import { formatAiSourceType } from '@/utils'
import type { AiKnowledgeSyncRequest } from '@/types/api-types'

interface Props {
  visible: boolean
  sourceType: string
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

const formData = reactive({
  taskType: 'full',
  sourceId: undefined as number | undefined,
  remark: '',
})

const formRules: FormRules = {
  taskType: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
}

function resetForm(): void {
  formData.taskType = 'full'
  formData.sourceId = undefined
  formData.remark = ''
  formRef.value?.clearValidate()
}

async function handleSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const payload: AiKnowledgeSyncRequest = {
      sourceType: props.sourceType,
      taskType: formData.taskType,
      sourceId: formData.sourceId,
      remark: formData.remark?.trim() || undefined,
    }
    const success = await store.triggerSync(payload)
    if (success) {
      emit('success')
      dialogVisible.value = false
    } else {
      ElMessage.error('触发同步失败')
    }
  } finally {
    submitting.value = false
  }
}

function handleClosed(): void {
  resetForm()
}

watch(
  () => props.visible,
  visible => {
    if (visible) resetForm()
  }
)
</script>
