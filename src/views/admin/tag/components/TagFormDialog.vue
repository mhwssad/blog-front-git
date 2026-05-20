<template>
  <FormDialog
    v-model="modalVisible"
    add-title="新增标签"
    edit-title="编辑标签"
    :is-edit="isEdit"
    width="480px"
    :loading="submitting"
    :confirm-permission="submitPermission"
    @submit="handleSubmit"
  >
    <ElForm
      ref="formRef"
      class="tag-form"
      :model="formState"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="标签名称" prop="name">
        <el-input
          v-model="formState.name"
          placeholder="请输入标签名称"
          maxlength="64"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="颜色" prop="color">
        <div class="color-input">
          <el-input v-model="formState.color" placeholder="#409EFF" maxlength="32" />
          <el-color-picker v-model="formState.color" show-alpha />
        </div>
      </el-form-item>
    </ElForm>
  </FormDialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch, type PropType } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { useTagStore } from '@/stores'
import type { TagSaveRequest, TagVO } from '@/types/api-types'

const props = defineProps({
  visible: Boolean,
  tag: {
    type: Object as PropType<TagVO | null>,
    default: null,
  },
})

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'success'): void
}>()

const tagStore = useTagStore()
const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const submitting = ref(false)

const formState = reactive({
  name: '',
  color: '',
})

const formRules = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
}

const isEdit = computed(() => Boolean(props.tag?.id))
const submitPermission = computed(() =>
  isEdit.value ? 'content:tag:update' : 'content:tag:create'
)
const modalVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

function resetFormState(): void {
  formState.name = props.tag?.name ?? ''
  formState.color = props.tag?.color ?? ''
  formRef.value?.clearValidate()
}

watch(
  () => props.visible,
  visible => {
    if (visible) {
      resetFormState()
    }
  }
)

watch(
  () => props.tag,
  () => {
    if (props.visible) {
      resetFormState()
    }
  }
)

async function handleSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true
  const payload: TagSaveRequest = {
    name: formState.name.trim(),
    color: formState.color.trim() || undefined,
  }

  const success = isEdit.value
    ? await tagStore.updateTag(props.tag!.id, payload)
    : await tagStore.createTag(payload)

  submitting.value = false

  if (!success) {
    ElMessage.error(isEdit.value ? '更新标签失败' : '创建标签失败')
    return
  }

  ElMessage.success(isEdit.value ? '标签已更新' : '标签已创建')
  emit('success')
  emit('update:visible', false)
}

</script>

<style scoped>
:deep(.el-dialog__header) {
  text-align: center;
}

.tag-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.color-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light);
}
</style>
