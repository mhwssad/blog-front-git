<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="480px"
    :close-on-click-modal="false"
    align-center
    @closed="handleClosed"
  >
    <!-- MFA 验证步骤 -->
    <div v-if="step === 'mfa'" class="mfa-step">
      <p class="mfa-hint">此操作需要二次验证，验证码已发送至您的邮箱。</p>
      <div class="code-inputs">
        <el-input
          v-for="(_, index) in mfaDigits"
          :key="index"
          :ref="(el: any) => setInputRef(el, index)"
          v-model="mfaDigits[index]"
          maxlength="1"
          class="code-digit"
          size="large"
          @input="handleDigitInput(index)"
          @keydown.backspace="handleDigitBackspace(index, $event as KeyboardEvent)"
        />
      </div>
    </div>

    <!-- 操作表单步骤 -->
    <el-form v-else label-width="90px">
      <el-form-item v-if="action === 'ban'" label="封禁原因">
        <el-input v-model="form.reason" type="textarea" :rows="3" placeholder="请输入封禁原因" />
      </el-form-item>

      <el-form-item v-if="action === 'adjust-level'" label="目标等级">
        <el-input-number v-model="form.level" :min="0" :max="100" style="width: 100%" />
      </el-form-item>

      <el-form-item v-if="action === 'adjust-exp'" label="调整经验">
        <el-input-number v-model="form.experience" :min="-100000" :max="100000" style="width: 100%" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button
        v-if="step === 'mfa'"
        :disabled="!mfaComplete"
        :loading="mfaLoading"
        @click="handleVerifyMfa"
      >
        验证
      </el-button>
      <el-button
        v-else
        type="primary"
        :loading="submitLoading"
        @click="handleSubmit"
      >
        确认{{ actionLabel }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { AdminApi } from '@/api/sys/admin'
import { useUserStore } from '@/stores/modules/user'

type ActionType = 'ban' | 'unban' | 'adjust-level' | 'adjust-exp'

interface Props {
  visible: boolean
  userId: number
  username: string
  action: ActionType | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const userStore = useUserStore()

const step = ref<'mfa' | 'form'>('mfa')
const mfaTicket = ref('')
const mfaLoading = ref(false)
const submitLoading = ref(false)

const MFA_LENGTH = 6
const mfaDigits = ref<string[]>(Array(MFA_LENGTH).fill(''))
const inputRefs: (HTMLElement | null)[] = []

const form = reactive({
  reason: '',
  level: 1,
  experience: 0,
})

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const mfaComplete = computed(() => mfaDigits.value.every((d) => d.length === 1))

const title = computed(() => {
  const map: Record<ActionType, string> = {
    ban: '封禁用户',
    unban: '解封用户',
    'adjust-level': '调整等级',
    'adjust-exp': '调整经验',
  }
  return map[props.action!] ?? '安全操作'
})

const actionLabel = computed(() => {
  const map: Record<ActionType, string> = {
    ban: '封禁',
    unban: '解封',
    'adjust-level': '调整',
    'adjust-exp': '调整',
  }
  return map[props.action!] ?? '操作'
})

function setInputRef(el: HTMLElement | null, index: number): void {
  inputRefs[index] = el
}

function handleDigitInput(index: number): void {
  mfaDigits.value[index] = (mfaDigits.value[index] ?? '').replace(/\D/g, '').slice(-1)
  if (mfaDigits.value[index] && index < MFA_LENGTH - 1) {
    inputRefs[index + 1]?.querySelector('input')?.focus()
  }
}

function handleDigitBackspace(index: number, event: KeyboardEvent): void {
  if (!mfaDigits.value[index] && index > 0) {
    mfaDigits.value[index - 1] = ''
    inputRefs[index - 1]?.querySelector('input')?.focus()
    event.preventDefault()
  }
}

async function handleVerifyMfa(): Promise<void> {
  mfaLoading.value = true
  try {
    const code = mfaDigits.value.join('')
    const resp = await AdminApi.verifyMfa({ code })
    mfaTicket.value = resp.data.data.ticket
    step.value = 'form'
  } catch {
    ElMessage.error('验证码错误或已过期')
  } finally {
    mfaLoading.value = false
  }
}

async function handleSubmit(): Promise<void> {
  if (!props.action) return
  submitLoading.value = true

  let ok = false
  try {
    switch (props.action) {
      case 'ban':
        ok = await userStore.banUser(props.userId, {
          mfaTicket: mfaTicket.value,
          banReason: form.reason || undefined,
        })
        break
      case 'unban':
        ok = await userStore.unbanUser(props.userId, {
          mfaTicket: mfaTicket.value,
          unbanReason: form.reason || undefined,
        })
        break
      case 'adjust-level':
        ok = await userStore.adjustUserLevel(props.userId, {
          level: form.level,
          mfaTicket: mfaTicket.value,
        })
        break
      case 'adjust-exp':
        ok = await userStore.adjustUserExperience(props.userId, {
          experience: form.experience,
          mfaTicket: mfaTicket.value,
        })
        break
    }

    if (ok) {
      ElMessage.success(`${actionLabel.value}成功`)
      emit('success')
      dialogVisible.value = false
    } else {
      ElMessage.error(`${actionLabel.value}失败`)
    }
  } finally {
    submitLoading.value = false
  }
}

function resetState(): void {
  step.value = 'mfa'
  mfaTicket.value = ''
  mfaDigits.value = Array(MFA_LENGTH).fill('')
  form.reason = ''
  form.level = 1
  form.experience = 0
}

function handleClosed(): void {
  resetState()
}

watch(
  () => props.visible,
  async (visible) => {
    if (!visible || !props.action) return
    resetState()
    try {
      await AdminApi.sendMfaCode()
    } catch {
      ElMessage.error('发送验证码失败')
    }
  },
)
</script>

<style scoped>
.mfa-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.mfa-hint {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.code-inputs {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.code-digit {
  width: 48px;
}

.code-digit :deep(.el-input__inner) {
  text-align: center;
  font-size: 20px;
  font-weight: 700;
}
</style>
