<template>
  <FormDialog
    v-model="dialogVisible"
    add-title="新增用户"
    edit-title="编辑用户"
    :is-edit="isEdit"
    width="680px"
    :loading="submitting"
    :confirm-permission="submitPermission"
    :confirm-text="isEdit ? '保存' : '创建'"
    @submit="handleSubmit"
  >
    <div v-if="detailLoading" class="form-loading">
      <el-icon class="is-loading" :size="28"><Loading /></el-icon>
      <span>加载用户信息...</span>
    </div>

    <el-form
      v-else
      ref="formRef"
      :model="formData"
      :rules="formRules"
      class="user-form"
      label-width="90px"
    >
      <!-- 账号信息 -->
      <div class="form-section">
        <div class="form-section__title">账号信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="formData.username" placeholder="请输入用户名" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="!isEdit" label="密码" prop="password">
              <el-input
                v-model="formData.password"
                type="password"
                placeholder="请输入密码"
                show-password
              />
            </el-form-item>
            <el-form-item v-else label="昵称" prop="nickname">
              <el-input v-model="formData.nickname" placeholder="请输入昵称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="!isEdit" :gutter="20">
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="formData.nickname" placeholder="请输入昵称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-else :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 个人信息 -->
      <div class="form-section">
        <div class="form-section__title">个人信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="formData.gender">
                <el-radio :value="1">男</el-radio>
                <el-radio :value="2">女</el-radio>
                <el-radio :value="0">保密</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生日" prop="birthday">
              <el-date-picker
                v-model="formData.birthday"
                type="date"
                placeholder="请选择生日"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="头像" prop="avatar">
              <ImageUpload v-model="formData.avatar" mode="avatar" category="avatar" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 状态与备注 -->
      <div class="form-section">
        <div class="form-section__title">状态与备注</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio :value="1">正常</el-radio>
                <el-radio :value="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
            show-word-limit
            maxlength="200"
          />
        </el-form-item>
      </div>
    </el-form>
  </FormDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { UserApi } from '@/api/sys/user'
import ImageUpload from '@/components/common/ImageUpload.vue'
import type { SysUserSaveRequest } from '@/types/api-types'

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

const LOG_PREFIX = '[UserFormDialog]'

const formRef = ref()
const submitting = ref(false)
const detailLoading = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val),
})

const isEdit = computed(() => !!props.userId)
const submitPermission = computed(() => (isEdit.value ? 'sys:user:update' : 'sys:user:create'))

const defaultFormData = (): SysUserSaveRequest => ({
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  avatar: '',
  gender: 0,
  birthday: '',
  status: 1,
  remark: '',
})

const formData = reactive<SysUserSaveRequest>(defaultFormData())

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }],
}

// 监听 userId 变化，获取用户详情
watch(
  () => [props.visible, props.userId] as const,
  async ([visible, id]) => {
    if (!visible) return
    console.log(`${LOG_PREFIX} Dialog visibility changed: visible=${visible}, userId=${id}`)
    if (id) {
      detailLoading.value = true
      console.log(`${LOG_PREFIX} Loading user details for id: ${id}`)
      try {
        const response = await UserApi.getUserById(id)
        const user = response.data.data
        Object.assign(formData, {
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          gender: user.gender ?? 0,
          birthday: user.birthday ?? '',
          status: user.status,
          remark: user.remark ?? '',
        })
        console.log(`${LOG_PREFIX} User details loaded successfully`)
      } catch (error) {
        console.error(`${LOG_PREFIX} Failed to load user details:`, error)
        ElMessage.error('获取用户详情失败')
      } finally {
        detailLoading.value = false
      }
    } else {
      console.log(`${LOG_PREFIX} Resetting form for new user`)
      resetForm()
    }
  }
)

function resetForm() {
  Object.assign(formData, defaultFormData())
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  console.log(`${LOG_PREFIX} Submit form, isEdit=${isEdit.value}`)
  try {
    await formRef.value?.validate()
    submitting.value = true

    if (isEdit.value && props.userId) {
      console.log(`${LOG_PREFIX} Updating user id: ${props.userId}`)
      await UserApi.updateUser(props.userId, formData)
      ElMessage.success('更新成功')
    } else {
      console.log(`${LOG_PREFIX} Creating new user`)
      await UserApi.createUser(formData)
      ElMessage.success('创建成功')
    }

    emit('success')
    dialogVisible.value = false
  } catch (error) {
    console.error(`${LOG_PREFIX} Submit failed:`, error)
    // 验证失败或请求失败
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.user-form {
  padding: 0 12px;
}

.form-section {
  margin-bottom: 4px;
}

.form-section__title {
  margin-bottom: 16px;
  padding-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.user-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.user-form :deep(.el-radio-group) {
  display: inline-flex;
  align-items: center;
  gap: 16px;
}

.user-form :deep(.el-radio) {
  margin-right: 0;
}

:deep(.el-dialog__header) {
  text-align: center;
}

:deep(.el-dialog__body) {
  padding-top: 12px;
}

:deep(.el-dialog__footer) {
  text-align: center;
}

@media (max-height: 900px) {
  :deep(.el-dialog__body) {
    max-height: calc(100vh - 220px);
    overflow-y: auto;
  }
}

@media (max-width: 768px) {
  .user-form {
    padding: 0;
  }
}
</style>
