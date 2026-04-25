<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    class="user-form-dialog"
    width="600px"
    :close-on-click-modal="false"
    align-center
    center
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      class="user-form"
      label-width="100px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="formData.username"
          placeholder="请输入用户名"
          :disabled="isEdit"
        />
      </el-form-item>

      <el-form-item label="密码" prop="password" v-if="!isEdit">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          show-password
        />
      </el-form-item>

      <el-form-item label="昵称" prop="nickname">
        <el-input
          v-model="formData.nickname"
          placeholder="请输入昵称"
        />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="formData.email"
          placeholder="请输入邮箱"
        />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="formData.phone"
          placeholder="请输入手机号"
        />
      </el-form-item>

      <el-form-item label="头像" prop="avatar">
        <el-input
          v-model="formData.avatar"
          placeholder="请输入头像URL"
        />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="formData.gender" class="option-group">
          <el-radio :value="1">男</el-radio>
          <el-radio :value="2">女</el-radio>
          <el-radio :value="0">保密</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="生日" prop="birthday">
        <el-date-picker
          v-model="formData.birthday"
          type="date"
          placeholder="请选择生日"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status" class="option-group">
          <el-radio :value="1">正常</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button v-permission="submitPermission" type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEdit ? '保存' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { UserApi } from '@/api/sys/user'
import type { SysUserSaveRequest } from '@/api/types'

interface Props {
  visible: boolean
  userId: number | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref()
const submitting = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const isEdit = computed(() => !!props.userId)
const submitPermission = computed(() => (isEdit.value ? 'sys:user:update' : 'sys:user:create'))

// 表单数据
const formData = reactive<SysUserSaveRequest>({
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  avatar: '',
  gender: 0,
  birthday: '',
  status: 1,
  remark: ''
})

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 监听 userId 变化，获取用户详情
watch(
  () => props.userId,
  async (id) => {
    if (id) {
      try {
        const response = await UserApi.getUserById(id)
        const user = response.data.data
        Object.assign(formData, {
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          gender: user.gender,
          birthday: user.birthday,
          status: user.status,
          remark: user.remark
        })
      } catch {
        ElMessage.error('获取用户详情失败')
      }
    } else {
      // 重置表单
      Object.assign(formData, {
        username: '',
        password: '',
        nickname: '',
        email: '',
        phone: '',
        avatar: '',
        gender: 0,
        birthday: '',
        status: 1,
        remark: ''
      })
    }
  },
  { immediate: true }
)

// 重置表单
function resetForm() {
  Object.assign(formData, {
    username: '',
    password: '',
    nickname: '',
    email: '',
    phone: '',
    avatar: '',
    gender: 0,
    birthday: '',
    status: 1,
    remark: ''
  })
  formRef.value?.clearValidate()
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true

    if (isEdit.value && props.userId) {
      await UserApi.updateUser(props.userId, formData)
      ElMessage.success('更新成功')
    } else {
      await UserApi.createUser(formData)
      ElMessage.success('创建成功')
    }

    emit('success')
    handleClose()
  } catch {
    // 验证失败或请求失败
  } finally {
    submitting.value = false
  }
}

// 关闭对话框
function handleClose() {
  resetForm()
  emit('update:visible', false)
}
</script>

<style scoped>
.user-form {
  padding: 0 4px;
}

.option-group {
  display: inline-flex;
  align-items: center;
  gap: 20px;
}

:deep(.option-group .el-radio) {
  margin-right: 0;
}

:deep(.option-group .el-radio__label) {
  color: var(--color-text-primary);
}

:deep(.user-form-dialog) {
  max-width: calc(100vw - 32px);
  margin: 0 auto;
}

:deep(.user-form-dialog .el-dialog__header) {
  text-align: center;
}

:deep(.user-form-dialog .el-dialog__body) {
  padding-top: 12px;
}

:deep(.user-form-dialog .el-dialog__footer) {
  text-align: center;
}

@media (max-height: 900px) {
  :deep(.user-form-dialog .el-dialog__body) {
    max-height: calc(100vh - 220px);
    overflow-y: auto;
  }
}

@media (max-width: 768px) {
  .user-form {
    padding: 0;
  }

  :deep(.user-form-dialog) {
    width: calc(100vw - 24px) !important;
  }
}
</style>
