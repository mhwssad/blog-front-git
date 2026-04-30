<template>
  <el-dialog
    v-model="dialogVisible"
    title="分配角色"
    class="assign-roles-dialog"
    width="500px"
    :close-on-click-modal="false"
    align-center
    center
    @close="handleClose"
  >
    <div class="role-assign-content">
      <p class="tips">为用户 <strong>{{ username }}</strong> 分配角色</p>

      <el-checkbox-group v-model="selectedRoleIds" v-loading="loading">
        <el-checkbox
          v-for="role in allRoles"
          :key="role.id"
          :label="role.id"
          :disabled="!role.status"
        >
          <div class="role-item">
            <span class="role-name">{{ role.name }}</span>
            <span class="role-code">{{ role.code }}</span>
            <el-tag
              :type="role.status === 1 ? 'success' : 'info'"
              size="small"
            >
              {{ role.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </div>
        </el-checkbox>
      </el-checkbox-group>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        v-permission="'sys:user:assign-role'"
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UserApi } from '@/api/sys/user'
import { RoleApi } from '@/api/sys/role'
import type { SysRoleAdminVO } from '@/types/api-types'

interface Props {
  visible: boolean
  userId: number
  username: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const submitting = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 所有角色
const allRoles = ref<SysRoleAdminVO[]>([])

// 已选择的角色ID
const selectedRoleIds = ref<number[]>([])

// 获取角色列表
async function fetchRoles() {
  loading.value = true
  try {
    const response = await RoleApi.getRoles({ size: 1000 })
    allRoles.value = response.data.data.records
  } catch {
    ElMessage.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// 获取用户已分配的角色
async function fetchUserRoles() {
  if (!props.userId) return

  try {
    const response = await UserApi.getUserRoles(props.userId)
    selectedRoleIds.value = response.data.data
  } catch {
    ElMessage.error('获取用户角色失败')
  }
}

// 提交分配
async function handleSubmit() {
  submitting.value = true
  try {
    await UserApi.assignUserRoles(props.userId, {
      roleIds: selectedRoleIds.value
    })
    ElMessage.success('角色分配成功')
    emit('success')
    handleClose()
  } catch {
    ElMessage.error('角色分配失败')
  } finally {
    submitting.value = false
  }
}

// 关闭对话框
function handleClose() {
  selectedRoleIds.value = []
  emit('update:visible', false)
}

// 监听对话框打开
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      fetchRoles()
      fetchUserRoles()
    }
  }
)
</script>

<style scoped>
.role-assign-content {
  padding: 0 20px;
}

.tips {
  margin-bottom: 20px;
  color: var(--color-text-regular);
}

.el-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.role-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

.role-code {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-family: 'Courier New', monospace;
}

:deep(.assign-roles-dialog) {
  max-width: calc(100vw - 32px);
  margin: 0 auto;
}

:deep(.assign-roles-dialog .el-dialog__header) {
  text-align: center;
}

:deep(.assign-roles-dialog .el-dialog__body) {
  text-align: center;
  padding-top: 12px;
}

:deep(.assign-roles-dialog .el-dialog__footer) {
  text-align: center;
}

@media (max-width: 768px) {
  .role-assign-content {
    padding: 0;
  }

  :deep(.assign-roles-dialog) {
    width: calc(100vw - 24px) !important;
  }
}
</style>
