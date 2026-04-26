<template>
  <div class="user-management-page">
    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="用户名" class="filter-item">
          <el-input
            v-model="searchForm.username"
            class="filter-control"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="昵称" class="filter-item">
          <el-input
            v-model="searchForm.nickname"
            class="filter-control"
            placeholder="请输入昵称"
            clearable
          />
        </el-form-item>
        <el-form-item label="邮箱" class="filter-item">
          <el-input
            v-model="searchForm.email"
            class="filter-control"
            placeholder="请输入邮箱"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态" class="filter-item">
          <el-select
            v-model="searchForm.status"
            class="filter-control filter-control--status"
            placeholder="请选择状态"
            clearable
          >
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button v-permission="'sys:user:query'" type="primary" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button v-permission="'sys:user:create'" type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
        </div>
      </template>

      <div ref="tableWrapperRef" class="table-wrapper">
        <el-table
          v-loading="loading"
          :data="tableData"
          :height="tableHeight"
          :size="isCompactTable ? 'small' : 'default'"
          table-layout="auto"
          class="user-table"
          border
          stripe
        >
          <el-table-column v-if="isCompactTable" label="用户信息" min-width="320" align="center">
            <template #default="{ row }">
              <div class="user-summary">
                <div class="user-summary__header">
                  <span class="user-summary__name">{{ row.nickname || row.username }}</span>
                  <span class="user-summary__id">ID: {{ row.id }}</span>
                </div>
                <div class="user-summary__line">用户名：{{ row.username || '-' }}</div>
                <div class="user-summary__line">邮箱：{{ row.email || '-' }}</div>
                <div class="user-summary__line">手机号：{{ row.phone || '-' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column v-else prop="id" label="ID" min-width="80" align="center" />
          <el-table-column
            v-if="!isCompactTable"
            prop="username"
            label="用户名"
            min-width="140"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            v-if="!isCompactTable"
            prop="nickname"
            label="昵称"
            min-width="140"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            v-if="!isCompactTable"
            prop="email"
            label="邮箱"
            min-width="220"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            v-if="!isCompactTable"
            prop="phone"
            label="手机号"
            min-width="150"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column prop="status" label="状态" :width="isCompactTable ? 112 : 124" align="center">
            <template #default="{ row }">
              <el-switch
                v-permission.disable="'sys:user:update'"
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                active-text="正常"
                inactive-text="禁用"
                inline-prompt
                @change="handleStatusChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            :min-width="isCompactTable ? 156 : 280"
            :fixed="isCompactTable ? false : 'right'"
            align="center"
          >
            <template #default="{ row }">
              <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
                <el-button v-permission="'sys:user:update'" link type="primary" @click="handleEdit(row)">
                  编辑
                </el-button>
                <el-button
                  v-permission="'sys:user:assign-role'"
                  link
                  type="primary"
                  @click="handleAssignRoles(row)"
                >
                  分配角色
                </el-button>
                <el-button
                  v-permission="'sys:user:reset-password'"
                  link
                  type="warning"
                  @click="handleResetPassword(row)"
                >
                  重置密码
                </el-button>
                <el-button v-permission="'sys:user:delete'" link type="danger" @click="handleDelete(row)">
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div ref="paginationRef" class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          :layout="paginationLayout"
          :small="isCompactTable"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑用户对话框 -->
    <UserFormDialog
      v-model:visible="formDialogVisible"
      :user-id="editingUserId"
      @success="handleFormSuccess"
    />

    <!-- 分配角色对话框 -->
    <AssignRolesDialog
      v-model:visible="rolesDialogVisible"
      :user-id="currentUserId"
      :username="currentUsername"
      @success="handleRolesSuccess"
    />

    <!-- 重置密码对话框 -->
    <ResetPasswordDialog
      v-model:visible="passwordDialogVisible"
      :user-id="currentUserId"
      :username="currentUsername"
      @success="handlePasswordSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { UserApi } from '@/api/sys/user'
import type { SysUserAdminVO, UserQueryRequest } from '@/api/types'
import { useContentAdmin } from '@/composables/useContentAdmin'
import UserFormDialog from './components/UserFormDialog.vue'
import AssignRolesDialog from './components/AssignRolesDialog.vue'
import ResetPasswordDialog from './components/ResetPasswordDialog.vue'

// 搜索表单
const searchForm = reactive<UserQueryRequest>({
  current: 1,
  size: 10,
  username: undefined,
  nickname: undefined,
  email: undefined,
  status: undefined
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 表格数据
const tableData = ref<SysUserAdminVO[]>([])
const loading = ref(false)

// 对话框状态
const formDialogVisible = ref(false)
const rolesDialogVisible = ref(false)
const passwordDialogVisible = ref(false)

// 当前操作的用户
const editingUserId = ref<number | null>(null)
const currentUserId = ref<number>(0)
const currentUsername = ref('')

const {
  tableWrapperRef,
  paginationRef,
  tableHeight,
  paginationLayout,
  isCompactTable,
} = useContentAdmin({
  minHeight: 360,
  bottomOffset: 16,
})

// 获取用户列表
async function fetchUsers() {
  loading.value = true
  try {
    const response = await UserApi.getUsers({
      ...searchForm,
      current: pagination.current,
      size: pagination.size
    })
    const data = response.data.data
    tableData.value = data.records
    pagination.total = data.total
  } catch {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  pagination.current = 1
  fetchUsers()
}

// 重置
function handleReset() {
  Object.assign(searchForm, {
    current: 1,
    size: 10,
    username: undefined,
    nickname: undefined,
    email: undefined,
    status: undefined
  })
  pagination.current = 1
  fetchUsers()
}

// 分页变化
function handleSizeChange(size: number) {
  pagination.size = size
  pagination.current = 1
  fetchUsers()
}

function handleCurrentChange(current: number) {
  pagination.current = current
  fetchUsers()
}

// 新增用户
function handleAdd() {
  editingUserId.value = null
  formDialogVisible.value = true
}

// 编辑用户
function handleEdit(row: SysUserAdminVO) {
  editingUserId.value = row.id
  formDialogVisible.value = true
}

// 状态变更
async function handleStatusChange(row: SysUserAdminVO) {
  try {
    await UserApi.updateUserStatus(row.id, { status: row.status })
    ElMessage.success('状态更新成功')
  } catch {
    row.status = row.status === 1 ? 0 : 1 // 回滚
    ElMessage.error('状态更新失败')
  }
}

// 分配角色
function handleAssignRoles(row: SysUserAdminVO) {
  currentUserId.value = row.id
  currentUsername.value = row.username
  rolesDialogVisible.value = true
}

// 重置密码
function handleResetPassword(row: SysUserAdminVO) {
  currentUserId.value = row.id
  currentUsername.value = row.username
  passwordDialogVisible.value = true
}

// 删除用户
async function handleDelete(row: SysUserAdminVO) {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await UserApi.deleteUser(row.id)
    ElMessage.success('删除成功')
    fetchUsers()
  } catch {
    // 用户取消或删除失败
  }
}

// 表单提交成功
function handleFormSuccess() {
  fetchUsers()
}

// 角色分配成功
function handleRolesSuccess() {
  fetchUsers()
}

// 密码重置成功
function handlePasswordSuccess() {
  ElMessage.success('密码重置成功')
}

// 初始化
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management-page {
  padding: 0;
  max-width: 1440px;
  margin: 0 auto;
}

.search-card {
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px 0;
}

.search-card :deep(.el-form-item) {
  margin-bottom: 0;
}

.filter-item {
  margin-right: 16px;
}

.filter-control {
  width: 220px;
}

.filter-control--status {
  width: 160px;
}

.search-actions {
  margin-left: 0;
  margin-right: 0;
}

.table-card {
  min-height: 0;
}

.user-table {
  width: 100%;
}

.user-table :deep(.el-table__cell .cell) {
  text-align: center;
}

.table-wrapper {
  min-height: 0;
}

.user-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  line-height: 1.5;
  text-align: center;
}

.user-summary__header {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.user-summary__name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.user-summary__id {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.user-summary__line {
  color: var(--el-text-color-regular);
  word-break: break-all;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
  font-weight: 500;
}

.table-actions {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px 8px;
}

.table-actions--compact {
  flex-direction: column;
  align-items: center;
}

.table-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .filter-item,
  .search-actions {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
  }

  .filter-control,
  .filter-control--status {
    width: 100%;
  }

  .search-actions :deep(.el-form-item__content) {
    width: 100%;
    justify-content: center;
  }
}
</style>
