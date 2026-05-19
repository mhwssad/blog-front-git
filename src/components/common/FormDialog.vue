<script lang="ts" setup>
const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  addTitle?: string
  editTitle?: string
  isEdit?: boolean
  width?: string
  confirmPermission?: string
  confirmText?: string
  closeOnClickModal?: boolean
  destroyOnClose?: boolean
  loading?: boolean
}>(), {
  addTitle: '新增',
  editTitle: '编辑',
  isEdit: false,
  width: '520px',
  confirmText: '保存',
  closeOnClickModal: false,
  destroyOnClose: true,
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: []
  cancel: []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const dialogTitle = computed(() => {
  if (props.title) return props.title
  return props.isEdit ? props.editTitle : props.addTitle
})

const handleSubmit = () => emit('submit')

const handleCancel = () => {
  emit('cancel')
  dialogVisible.value = false
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :destroy-on-close="destroyOnClose"
  >
    <slot />
    <template #footer>
      <slot name="footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          v-if="confirmPermission"
          v-permission="confirmPermission"
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ confirmText }}
        </el-button>
        <el-button
          v-else
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ confirmText }}
        </el-button>
      </slot>
    </template>
  </el-dialog>
</template>
