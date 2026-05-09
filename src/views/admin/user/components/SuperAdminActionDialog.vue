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
        <el-input-number
          v-model="form.experience"
          :min="-100000"
          :max="100000"
          style="width: 100%"
        />
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
      <el-button v-else type="primary" :loading="submitLoading" @click="handleSubmit">
        确认{{ actionLabel }}
      </el-button>
    </template>
  </el-dialog>
</template>

/** * 超级操作对话框 * 用于需要 MFA 二次验证的高危操作，如封禁/解封用户、调整等级/经验 *
操作流程：1. 发送验证码到邮箱 2. 用户输入验证码验证 3. 验证通过后填写操作表单 4. 提交执行 */
<script lang="ts" setup>
/**
 * 超级操作对话框
 * @description 用于需要 MFA 二次验证的高危操作，如封禁/解封用户、调整等级/经验，操作流程：1. 发送验证码到邮箱 2. 用户输入验证码验证 3. 验证通过后填写操作表单 4. 提交执行
 * @module admin/user/SuperAdminActionDialog
 * @see ../../api/sys/admin.ts
 */
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { AdminApi } from '@/api/sys/admin'
import { useUserStore } from '@/stores/modules/user'

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

// 日志前缀
const LOG_PREFIX = '[SuperAdminActionDialog]'

// MFA 验证码位数
const MFA_LENGTH = 6

type ActionType = 'ban' | 'unban' | 'adjust-level' | 'adjust-exp'

interface Props {
  visible: boolean
  userId: number
  username: string
  action: ActionType | null
}

const userStore = useUserStore()

// 初始化状态
const step = ref<'mfa' | 'form'>('mfa')
const mfaTicket = ref('')
const mfaLoading = ref(false)
const submitLoading = ref(false)

// MFA 验证码输入框
const mfaDigits = ref<string[]>(Array(MFA_LENGTH).fill(''))
const inputRefs: (HTMLElement | null)[] = []

// 操作表单数据
const form = reactive({
  reason: '',
  level: 1,
  experience: 0,
})

const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val),
})

const mfaComplete = computed(() => mfaDigits.value.every(d => d.length === 1))

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

// 设置输入框引用
function setInputRef(el: HTMLElement | null, index: number): void {
  inputRefs[index] = el
}

/**
 * 处理验证码输入
 * 自动聚焦下一个输入框
 */
function handleDigitInput(index: number): void {
  mfaDigits.value[index] = (mfaDigits.value[index] ?? '').replace(/\D/g, '').slice(-1)
  if (mfaDigits.value[index] && index < MFA_LENGTH - 1) {
    inputRefs[index + 1]?.querySelector('input')?.focus()
  }
}

/**
 * 处理退格键
 * 如果当前输入框为空，则聚焦到上一个输入框
 */
function handleDigitBackspace(index: number, event: KeyboardEvent): void {
  if (!mfaDigits.value[index] && index > 0) {
    mfaDigits.value[index - 1] = ''
    inputRefs[index - 1]?.querySelector('input')?.focus()
    event.preventDefault()
  }
}

/**
 * 验证 MFA 验证码
 */
async function handleVerifyMfa(): Promise<void> {
  console.log(`${LOG_PREFIX} Verifying MFA code`)
  mfaLoading.value = true
  try {
    const code = mfaDigits.value.join('')
    console.debug(`${LOG_PREFIX} MFA code length: ${code.length}`)
    const resp = await AdminApi.verifyMfa({ code })
    mfaTicket.value = resp.data.data.ticket
    console.log(`${LOG_PREFIX} MFA verified successfully, ticket obtained`)
    step.value = 'form'
  } catch (error) {
    console.error(`${LOG_PREFIX} MFA verification failed:`, error)
    ElMessage.error('验证码错误或已过期')
  } finally {
    mfaLoading.value = false
  }
}

/**
 * 执行超级操作
 */
async function handleSubmit(): Promise<void> {
  if (!props.action) return
  console.log(`${LOG_PREFIX} Submitting action: ${props.action} for user id: ${props.userId}`)
  submitLoading.value = true

  let ok = false
  try {
    switch (props.action) {
      case 'ban':
        console.log(`${LOG_PREFIX} Banning user, reason: ${form.reason || '未填写'}`)
        ok = await userStore.banUser(props.userId, {
          mfaTicket: mfaTicket.value,
          banReason: form.reason || undefined,
        })
        break
      case 'unban':
        console.log(`${LOG_PREFIX} Unbanning user, reason: ${form.reason || '未填写'}`)
        ok = await userStore.unbanUser(props.userId, {
          mfaTicket: mfaTicket.value,
          unbanReason: form.reason || undefined,
        })
        break
      case 'adjust-level':
        console.log(`${LOG_PREFIX} Adjusting user level to: ${form.level}`)
        ok = await userStore.adjustUserLevel(props.userId, {
          level: form.level,
          mfaTicket: mfaTicket.value,
        })
        break
      case 'adjust-exp':
        console.log(`${LOG_PREFIX} Adjusting user experience by: ${form.experience}`)
        ok = await userStore.adjustUserExperience(props.userId, {
          experience: form.experience,
          mfaTicket: mfaTicket.value,
        })
        break
    }

    if (ok) {
      console.log(`${LOG_PREFIX} Action ${props.action} succeeded`)
      ElMessage.success(`${actionLabel.value}成功`)
      emit('success')
      dialogVisible.value = false
    } else {
      console.warn(`${LOG_PREFIX} Action ${props.action} failed`)
      ElMessage.error(`${actionLabel.value}失败`)
    }
  } finally {
    submitLoading.value = false
  }
}

/**
 * 重置对话框状态
 */
function resetState(): void {
  console.debug(`${LOG_PREFIX} Resetting dialog state`)
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

// 监听对话框打开，发送 MFA 验证码
watch(
  () => props.visible,
  async visible => {
    if (!visible || !props.action) return
    console.log(`${LOG_PREFIX} Dialog opened, action: ${props.action}, user: ${props.username}`)
    resetState()
    try {
      console.log(`${LOG_PREFIX} Sending MFA code...`)
      await AdminApi.sendMfaCode()
      console.log(`${LOG_PREFIX} MFA code sent`)
    } catch (error) {
      console.error(`${LOG_PREFIX} Failed to send MFA code:`, error)
      ElMessage.error('发送验证码失败')
    }
  }
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
