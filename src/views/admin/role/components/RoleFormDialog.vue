<template>
  <FormDialog
    v-model="dialogVisible"
    add-title="新增角色"
    edit-title="编辑角色"
    :is-edit="isEdit"
    width="520px"
    :loading="submitting"
    :confirm-permission="submitPermission"
    :confirm-text="isEdit ? '保存' : '创建'"
    @submit="handleSubmit"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入角色名称" />
      </el-form-item>

      <el-form-item label="角色编码" prop="code">
        <el-input
          v-model="formData.code"
          placeholder="请输入角色编码"
          :disabled="isEdit"
          @input="handleCodeInput"
        />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" :max="9999" style="width: 100%" />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status" class="status-group">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" :rows="4" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
  </FormDialog>
</template>

/** * 角色表单对话框 * @description
新增/编辑角色的弹窗表单，包含角色名称、编码、排序、状态、备注等配置 * @module
admin/role/components/RoleFormDialog * @see api/sys/role.ts */
<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { RoleApi } from '@/api/sys/role'
import type { SysRoleSaveRequest } from '@/types/api-types'

interface Props {
  visible: boolean
  roleId: number | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

const isEdit = computed(() => !!props.roleId)
const submitPermission = computed(() => (isEdit.value ? 'sys:role:update' : 'sys:role:create'))

const formData = reactive<SysRoleSaveRequest>({
  name: '',
  code: '',
  sort: 0,
  status: 1,
  remark: '',
})

const formRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 30, message: '角色名称长度在 2 到 30 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { min: 2, max: 50, message: '角色编码长度在 2 到 50 个字符', trigger: 'blur' },
  ],
}

function resetForm(): void {
  Object.assign(formData, {
    name: '',
    code: '',
    sort: 0,
    status: 1,
    remark: '',
  })
  formRef.value?.clearValidate()
}

function handleCodeInput(value: string | number): void {
  formData.code = String(value).replace(/\s+/g, '').toUpperCase()
}

async function loadRoleDetail(roleId: number): Promise<void> {
  try {
    const response = await RoleApi.getRoleById(roleId)
    const role = response.data.data

    Object.assign(formData, {
      name: role.name,
      code: role.code,
      sort: role.sort ?? 0,
      status: role.status,
      remark: role.remark ?? '',
    })
  } catch {
    ElMessage.error('获取角色详情失败')
  }
}

async function handleSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
    submitting.value = true

    if (isEdit.value && props.roleId) {
      await RoleApi.updateRole(props.roleId, formData)
      ElMessage.success('更新成功')
    } else {
      await RoleApi.createRole(formData)
      ElMessage.success('创建成功')
    }

    emit('success')
    dialogVisible.value = false
  } catch {
    // 验证失败或请求失败
  } finally {
    submitting.value = false
  }
}

watch(
  () => [props.visible, props.roleId] as const,
  async ([visible, roleId]) => {
    if (!visible) {
      return
    }

    resetForm()

    if (roleId) {
      await loadRoleDetail(roleId)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.el-form {
  padding: 0 20px;
}

.status-group {
  display: inline-flex;
  align-items: center;
  gap: 20px;
}

:deep(.status-group .el-radio) {
  margin-right: 0;
}

:deep(.status-group .el-radio__label) {
  color: var(--color-text-primary);
}

:deep(.el-dialog) {
  display: flex;
  flex-direction: column;
  margin: 0 auto !important;
}

:deep(.el-dialog .el-dialog__header) {
  text-align: center;
}

:deep(.el-dialog .el-dialog__footer) {
  text-align: center;
}
</style>
