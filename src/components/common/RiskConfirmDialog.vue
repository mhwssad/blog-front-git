<template>
  <el-dialog
    :model-value="modelValue"
    title="危险操作确认"
    width="460px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="risk-content">
      <div class="risk-warning">
        <el-icon :size="32" color="var(--el-color-danger)"><WarningFilled /></el-icon>
        <div>
          <div class="risk-title">{{ title }}</div>
          <div class="risk-desc">{{ description }}</div>
        </div>
      </div>

      <div v-if="requireInput" class="risk-confirm">
        <div class="confirm-label">
          请输入 <span class="confirm-keyword">{{ confirmKeyword }}</span> 确认:
        </div>
        <el-input v-model="confirmInput" :placeholder="`请输入 ${confirmKeyword}`" />
      </div>
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="danger" :disabled="!canConfirm" @click="handleConfirm">
        确认执行
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    description: string
    confirmKeyword?: string
    requireInput?: boolean
  }>(),
  {
    confirmKeyword: 'DELETE',
    requireInput: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const confirmInput = ref('')

const canConfirm = computed(() =>
  props.requireInput ? confirmInput.value === props.confirmKeyword : true,
)

function handleCancel(): void {
  emit('update:modelValue', false)
}

function handleConfirm(): void {
  if (!canConfirm.value) return
  emit('confirm')
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) confirmInput.value = ''
  },
)
</script>

<style scoped>
.risk-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.risk-warning {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background: var(--el-color-danger-light-9);
}

.risk-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.risk-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.confirm-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}

.confirm-keyword {
  font-weight: 700;
  color: var(--el-color-danger);
  font-family: monospace;
}
</style>
