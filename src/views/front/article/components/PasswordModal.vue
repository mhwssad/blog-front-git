<template>
  <el-dialog
    v-model="dialogVisible"
    title="访问验证"
    width="380px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <p class="password-hint">该文章需要密码才能访问，请输入密码</p>
    <el-input
      v-model="password"
      type="password"
      placeholder="请输入访问密码"
      show-password
      @keyup.enter="handleVerify"
    />

    <template #footer>
      <el-button type="primary" :disabled="!password.trim()" @click="handleVerify">
        验证
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
  verify: []
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const password = ref('')

function handleVerify(): void {
  if (!password.value.trim()) return
  emit('verify')
}
</script>

<style scoped>
.password-hint {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}
</style>
