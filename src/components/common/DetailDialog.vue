<script lang="ts" setup>
import EmptyState from './EmptyState.vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  detail?: any
  width?: string
  destroyOnClose?: boolean
  loading?: boolean
}>(), {
  width: '520px',
  destroyOnClose: true,
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :destroy-on-close="destroyOnClose"
  >
    <div v-loading="loading">
      <slot v-if="detail" :detail="detail" />
      <slot v-else name="empty">
        <EmptyState description="暂无详情" />
      </slot>
    </div>
    <template #footer>
      <slot name="footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </slot>
    </template>
  </el-dialog>
</template>
