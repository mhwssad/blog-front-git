<template>
  <el-dialog
    :model-value="modelValue"
    title="身份验证"
    width="400px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="verify-hint">请输入验证码以继续操作</div>

    <div class="code-inputs">
      <el-input
        v-for="(_, index) in codeDigits"
        :key="index"
        :ref="(el: any) => setInputRef(el, index)"
        v-model="codeDigits[index]"
        maxlength="1"
        class="code-digit"
        size="large"
        @input="handleInput(index)"
        @keydown.backspace="handleBackspace(index, $event as KeyboardEvent)"
      />
    </div>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :disabled="!isComplete" @click="handleConfirm">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

defineProps<{ modelValue: boolean }>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [code: string]
}>()

const CODE_LENGTH = 6
const codeDigits = ref<string[]>(Array(CODE_LENGTH).fill(''))
const inputRefs: (HTMLElement | null)[] = []

const isComplete = computed(() => codeDigits.value.every((d) => d.length === 1))

function setInputRef(el: HTMLElement | null, index: number): void {
  inputRefs[index] = el
}

function handleInput(index: number): void {
  codeDigits.value[index] = (codeDigits.value[index] ?? '').replace(/\D/g, '').slice(-1)
  if (codeDigits.value[index] && index < CODE_LENGTH - 1) {
    inputRefs[index + 1]?.querySelector('input')?.focus()
  }
}

function handleBackspace(index: number, event: KeyboardEvent): void {
  if (!codeDigits.value[index] && index > 0) {
    codeDigits.value[index - 1] = ''
    inputRefs[index - 1]?.querySelector('input')?.focus()
    event.preventDefault()
  }
}

function handleConfirm(): void {
  if (!isComplete.value) return
  emit('confirm', codeDigits.value.join(''))
  ElMessage.success('验证成功')
  emit('update:modelValue', false)
}

watch(
  () => codeDigits.value,
  () => {
    codeDigits.value = Array(CODE_LENGTH).fill('')
  },
)
</script>

<style scoped>
.verify-hint {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 20px;
}

.code-inputs {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.code-digit {
  width: 48px;
  text-align: center;
}

.code-digit :deep(.el-input__inner) {
  text-align: center;
  font-size: 20px;
  font-weight: 700;
}
</style>
