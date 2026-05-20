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
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="昵称" class="filter-item">
          <el-input
            v-model="searchForm.nickname"
            class="filter-control"
            placeholder="请输入昵称"
            clearable
            @keyup.enter="handleSearch"
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
        <template v-if="searchExpanded">
          <el-form-item label="邮箱" class="filter-item">
            <el-input
              v-model="searchForm.email"
              class="filter-control"
              placeholder="请输入邮箱"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="手机号" class="filter-item">
            <el-input
              v-model="searchForm.phone"
              class="filter-control"
              placeholder="请输入手机号"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
        </template>
        <el-form-item class="search-actions">
          <el-button v-permission="'sys:user:query'" type="primary" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="handleResetForm">重置</el-button>
          <el-button link type="primary" @click="searchExpanded = !searchExpanded">
            {{ searchExpanded ? '收起' : '更多' }}
            <el-icon class="expand-icon" :class="{ 'is-expanded': searchExpanded }">
              <ArrowDown />
            </el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <DataTable
      ref="dataTableRef"
      title="用户列表"
      :data="userStore.users"
      :loading="userStore.loading"
      :total="userStore.total"
      :current-page="pagination.current"
      :page-size="pagination.size"
      :compact="isCompactTable"
      :row-class-name="getRowClassName"
      class="user-table"
      @update:current-page="handleCurrentChange"
      @update:page-size="handleSizeChange"
      @selection-change="handleSelectionChange"
    >
      <template #header-extra>
        <div class="stats-bar-wrapper">
          <div v-if="!userStore.loading && userStore.total > 0" class="stats-bar">
            <span class="stats-item">
              共 <strong>{{ userStore.total }}</strong> 人
            </span>
            <span class="stats-item stats-item--success"> 正常 {{ activeCount }} </span>
            <span class="stats-item stats-item--danger"> 禁用 {{ disabledCount }} </span>
          </div>
          <el-button v-permission="'sys:user:create'" type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
        </div>
      </template>

      <!-- 批量操作栏 -->
      <template #toolbar>
        <BatchToolbar :selected-count="selectedRows.length">
          <el-button size="small" @click="clearSelection">取消选择</el-button>
          <el-button
            v-permission="'sys:user:update'"
            size="small"
            type="success"
            plain
            @click="handleBatchStatus(1)"
          >
            批量启用
          </el-button>
          <el-button
            v-permission="'sys:user:update'"
            size="small"
            type="warning"
            plain
            @click="handleBatchStatus(0)"
          >
            批量禁用
          </el-button>
          <el-button
            v-permission="'sys:user:delete'"
            size="small"
            type="danger"
            plain
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </BatchToolbar>
      </template>

      <template #empty>
        <el-empty description="暂无用户数据" :image-size="80" />
      </template>

      <!-- 多选列 -->
      <el-table-column v-if="!isCompactTable" type="selection" width="44" align="center" />

        <!-- 紧凑模式：合并用户信息列 -->
        <el-table-column v-if="isCompactTable" label="用户信息" min-width="300" align="center">
          <template #default="{ row }">
            <div class="user-summary">
              <div class="user-summary__header">
                <el-avatar :src="row.avatar" :size="28">
                  {{ (row.nickname || row.username).charAt(0) }}
                </el-avatar>
                <span class="user-summary__name">{{ row.nickname || row.username }}</span>
                <el-icon v-if="row.gender === 1" :size="14" color="#409eff"><Male /></el-icon>
                <el-icon v-else-if="row.gender === 2" :size="14" color="#f56c6c"
                  ><Female
                /></el-icon>
                <UserLevelBadge :level="row.userLevel" size="small" />
                <span class="user-summary__id">ID: {{ row.id }}</span>
              </div>
              <div class="user-summary__line">用户名：{{ row.username || '-' }}</div>
              <div v-if="row.email" class="user-summary__line">{{ row.email }}</div>
              <div class="user-summary__line">
                经验：{{ row.experiencePoints }} XP
                <template v-if="row.lastLoginTime"> · 最后登录：{{ row.lastLoginTime }}</template>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 桌面端：头像 + 用户信息 -->
        <el-table-column v-if="!isCompactTable" label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :src="row.avatar" :size="36">
                {{ (row.nickname || row.username).charAt(0) }}
              </el-avatar>
              <div class="user-cell__content">
                <div class="user-cell__top">
                  <span class="user-cell__name">{{ row.nickname || '-' }}</span>
                  <el-icon v-if="row.gender === 1" :size="14" color="#409eff"><Male /></el-icon>
                  <el-icon v-else-if="row.gender === 2" :size="14" color="#f56c6c"
                    ><Female
                  /></el-icon>
                </div>
                <div class="user-cell__bottom">
                  <span class="user-cell__sub">@{{ row.username }}</span>
                  <span class="user-cell__id">ID {{ row.id }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 邮箱 -->
        <el-table-column
          v-if="!isCompactTable"
          label="邮箱"
          min-width="160"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">{{ row.email || '-' }}</template>
        </el-table-column>

        <!-- 等级 -->
        <el-table-column v-if="!isCompactTable" label="等级" min-width="100" align="center">
          <template #default="{ row }">
            <UserLevelBadge :level="row.userLevel" size="small" />
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column
          prop="status"
          label="状态"
          :width="isCompactTable ? 100 : 100"
          align="center"
        >
          <template #default="{ row }">
            <el-switch
              v-permission.disable="'sys:user:update'"
              :model-value="row.status"
              :active-value="1"
              :inactive-value="0"
              active-text="正常"
              inactive-text="禁用"
              inline-prompt
              @change="handleStatusChange(row, $event as number)"
            />
          </template>
        </el-table-column>

        <!-- 注册时间 -->
        <el-table-column
          v-if="!isCompactTable"
          label="注册时间"
          min-width="140"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">{{ row.createTime || '-' }}</template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" :width="isCompactTable ? 90 : 110" align="center">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" @click="handleView(row)">查看</el-button>
              <el-button
                v-permission="'sys:user:update'"
                link
                type="primary"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-dropdown trigger="click" @command="(cmd: string) => handleAction(cmd, row)">
                <el-button link type="primary">
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-permission="'sys:user:assign-role'" command="assign-role">
                      分配角色
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-permission="'sys:user:reset-password'"
                      command="reset-password"
                    >
                      重置密码
                    </el-dropdown-item>
                    <el-dropdown-item v-permission="'sys:user:delete'" command="delete" divided>
                      <span class="dropdown-danger">删除</span>
                    </el-dropdown-item>
                    <el-dropdown-item v-permission="'sys:user:ban'" command="ban">
                      封禁用户
                    </el-dropdown-item>
                    <el-dropdown-item v-permission="'sys:user:unban'" command="unban">
                      解封用户
                    </el-dropdown-item>
                    <el-dropdown-item v-permission="'sys:user:adjust-level'" command="adjust-level">
                      调整等级
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-permission="'sys:user:adjust-experience'"
                      command="adjust-exp"
                    >
                      调整经验
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
    </DataTable>

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

    <!-- 查看详情对话框 -->
    <UserDetailDialog v-model:visible="detailDialogVisible" :user="viewingUser" />

    <!-- 超管安全操作对话框 -->
    <SuperAdminActionDialog
      v-model:visible="superAdminDialogVisible"
      :user-id="currentUserId"
      :username="currentUsername"
      :action="superAdminAction"
      @success="fetchUsers"
    />
  </div>
</template>

/** * 用户管理页面 * 提供用户列表查询、状态管理、批量操作等功能 *
支持单个用户的编辑、删除、封禁/解封、角色分配、密码重置等操作 * 支持批量启用/禁用/删除 */ /** *
用户管理页面（后台） * @description
后台用户管理，支持用户查询、编辑、状态切换、角色分配、密码重置、封禁/解封等完整功能 * @module
admin/user/Users * @see api/sys/user.ts */
<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown, Male, Female } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useAdminPagination } from '@/composables/useAdminPagination'
import DataTable from '@/components/common/DataTable.vue'
import UserLevelBadge from '@/components/common/UserLevelBadge.vue'
import type { SysUserAdminVO } from '@/types/api-types'
import UserFormDialog from './components/UserFormDialog.vue'
import AssignRolesDialog from './components/AssignRolesDialog.vue'
import ResetPasswordDialog from './components/ResetPasswordDialog.vue'
import UserDetailDialog from './components/UserDetailDialog.vue'
import SuperAdminActionDialog from './components/SuperAdminActionDialog.vue'

// 日志前缀
const LOG_PREFIX = '[UserManagement]'

const userStore = useUserStore()

const dataTableRef = ref<InstanceType<typeof DataTable>>()

// 搜索表单数据
const searchForm = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  status: undefined as number | undefined,
})
const searchExpanded = ref(false)

// 已选择的行（用于批量操作）
const selectedRows = ref<SysUserAdminVO[]>([])

// 对话框显示状态
const formDialogVisible = ref(false) // 用户表单对话框
const rolesDialogVisible = ref(false) // 角色分配对话框
const passwordDialogVisible = ref(false) // 密码重置对话框
const detailDialogVisible = ref(false) // 用户详情对话框
const superAdminDialogVisible = ref(false) // 超级操作（封禁/解封等）对话框
const superAdminAction = ref<'ban' | 'unban' | 'adjust-level' | 'adjust-exp' | null>(null)

// 当前操作用户信息
const editingUserId = ref<number | null>(null)
const currentUserId = ref(0)
const currentUsername = ref('')
const viewingUser = ref<SysUserAdminVO | null>(null)

// 响应式布局辅助：判断是否为紧凑表格模式
const { isCompactTable } = useContentAdmin()

// 计算统计数据
const activeCount = computed(() => userStore.users.filter(u => u.status === 1).length)
const disabledCount = computed(() => userStore.users.filter(u => u.status === 0).length)

const { pagination, fetch: fetchUsers, handleSearch, handleReset, handleSizeChange, handleCurrentChange } = useAdminPagination({
  fetchFn: userStore.fetchUsers,
  buildParams: () => {
    const params: Record<string, unknown> = {}
    if (searchForm.username.trim()) params.username = searchForm.username.trim()
    if (searchForm.nickname.trim()) params.nickname = searchForm.nickname.trim()
    if (searchForm.email.trim()) params.email = searchForm.email.trim()
    if (searchForm.phone.trim()) params.phone = searchForm.phone.trim()
    if (searchForm.status !== undefined) params.status = searchForm.status
    return params
  },
  persistSizeKey: 'user-page-size',
})

function resetSearchParams() {
  Object.assign(searchForm, {
    username: '',
    nickname: '',
    email: '',
    phone: '',
    status: undefined,
  })
}

/** 模板重置按钮：先清空搜索条件，再调用 composable 的 handleReset */
function handleResetForm(): void {
  handleReset(resetSearchParams)
}

/**
 * 表格选择变更
 * @param rows 选中的行数据
 */
function handleSelectionChange(rows: SysUserAdminVO[]) {
  console.debug(`${LOG_PREFIX} Selection changed, selected: ${rows.length} rows`)
  selectedRows.value = rows
}

/**
 * 清空表格选择
 */
function clearSelection() {
  console.debug(`${LOG_PREFIX} Clearing selection`)
  dataTableRef.value?.tableRef?.clearSelection()
}

/**
 * 打开新增用户对话框
 */
function handleAdd() {
  console.log(`${LOG_PREFIX} Opening add user dialog`)
  editingUserId.value = null
  formDialogVisible.value = true
}

/**
 * 查看用户详情
 * @param row 用户数据行
 */
function handleView(row: SysUserAdminVO) {
  console.log(`${LOG_PREFIX} Viewing user detail: ${row.username} (id: ${row.id})`)
  viewingUser.value = row
  detailDialogVisible.value = true
}

/**
 * 打开编辑用户对话框
 * @param row 用户数据行
 */
function handleEdit(row: SysUserAdminVO) {
  console.log(`${LOG_PREFIX} Opening edit dialog for user: ${row.username} (id: ${row.id})`)
  editingUserId.value = row.id
  formDialogVisible.value = true
}

/**
 * 用户状态变更
 * @param row 用户数据行
 * @param newVal 新的状态值
 */
async function handleStatusChange(row: SysUserAdminVO, newVal: number) {
  const oldVal = row.status
  console.log(`${LOG_PREFIX} Status change for user ${row.id}: ${oldVal} -> ${newVal}`)
  row.status = newVal
  const ok = await userStore.updateUserStatus(row.id, { status: newVal })
  if (ok) {
    console.log(`${LOG_PREFIX} Status updated successfully for user ${row.id}`)
    ElMessage.success('状态更新成功')
  } else {
    console.warn(`${LOG_PREFIX} Status update failed for user ${row.id}, reverting`)
    row.status = oldVal
    ElMessage.error('状态更新失败')
  }
}

/**
 * 获取行样式类名
 * 禁用用户显示为灰色
 */
function getRowClassName({ row }: { row: SysUserAdminVO }): string {
  return row.status === 0 ? 'row-disabled' : ''
}

/**
 * 操作下拉菜单统一入口
 * 根据 command 分发到具体处理函数
 * @param command 操作命令
 * @param row 用户数据行
 */
function handleAction(command: string, row: SysUserAdminVO) {
  console.log(
    `${LOG_PREFIX} Action triggered: ${command} for user: ${row.username} (id: ${row.id})`
  )
  switch (command) {
    case 'assign-role':
      currentUserId.value = row.id
      currentUsername.value = row.username
      rolesDialogVisible.value = true
      break
    case 'reset-password':
      currentUserId.value = row.id
      currentUsername.value = row.username
      passwordDialogVisible.value = true
      break
    case 'delete':
      confirmDelete(row)
      break
    case 'ban':
    case 'unban':
    case 'adjust-level':
    case 'adjust-exp':
      currentUserId.value = row.id
      currentUsername.value = row.username
      superAdminAction.value = command as 'ban' | 'unban' | 'adjust-level' | 'adjust-exp'
      superAdminDialogVisible.value = true
      break
  }
}

/**
 * 删除用户确认
 * @param row 用户数据行
 */
async function confirmDelete(row: SysUserAdminVO) {
  console.log(`${LOG_PREFIX} Delete confirmation for user: ${row.username} (id: ${row.id})`)
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    console.log(`${LOG_PREFIX} Delete confirmed, proceeding...`)
    const ok = await userStore.deleteUser(row.id)
    if (ok) {
      console.log(`${LOG_PREFIX} User deleted successfully: ${row.id}`)
      ElMessage.success('删除成功')
      fetchUsers()
    } else {
      console.warn(`${LOG_PREFIX} User deletion failed: ${row.id}`)
      ElMessage.error('删除失败')
    }
  } catch {
    console.debug(`${LOG_PREFIX} Delete cancelled by user`)
    // 用户取消
  }
}

/**
 * 批量状态变更（启用/禁用）
 * @param status 目标状态
 */
async function handleBatchStatus(status: number) {
  const label = status === 1 ? '启用' : '禁用'
  const ids = selectedRows.value.map(r => r.id)
  console.log(`${LOG_PREFIX} Batch ${label} request for ${ids.length} users:`, ids)
  try {
    await ElMessageBox.confirm(`确定要批量${label} ${ids.length} 个用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    console.log(`${LOG_PREFIX} Batch ${label} confirmed, executing...`)
    const results = await Promise.allSettled(
      ids.map(id => userStore.updateUserStatus(id, { status }))
    )
    const failed = results.filter(r => r.status === 'fulfilled' && !r.value).length
    if (failed === 0) {
      console.log(`${LOG_PREFIX} Batch ${label} succeeded for all ${ids.length} users`)
      ElMessage.success(`批量${label}成功`)
    } else {
      console.warn(
        `${LOG_PREFIX} Batch ${label} completed with ${failed} failures out of ${ids.length}`
      )
      ElMessage.warning(`${label}完成，${failed} 个失败`)
    }
    clearSelection()
    fetchUsers()
  } catch {
    console.debug(`${LOG_PREFIX} Batch ${label} cancelled by user`)
    // 用户取消
  }
}

/**
 * 批量删除用户
 * 此操作不可撤销，需二次确认
 */
async function handleBatchDelete() {
  const ids = selectedRows.value.map(r => r.id)
  console.warn(`${LOG_PREFIX} Batch delete request for ${ids.length} users:`, ids)
  try {
    await ElMessageBox.confirm(
      `确定要批量删除 ${ids.length} 个用户吗？此操作不可撤销。`,
      '危险操作',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
      }
    )
    console.log(`${LOG_PREFIX} Batch delete confirmed, executing...`)
    const results = await Promise.allSettled(ids.map(id => userStore.deleteUser(id)))
    const failed = results.filter(r => r.status === 'fulfilled' && !r.value).length
    if (failed === 0) {
      console.log(`${LOG_PREFIX} Batch delete succeeded for all ${ids.length} users`)
      ElMessage.success('批量删除成功')
    } else {
      console.warn(
        `${LOG_PREFIX} Batch delete completed with ${failed} failures out of ${ids.length}`
      )
      ElMessage.warning(`删除完成，${failed} 个失败`)
    }
    clearSelection()
    fetchUsers()
  } catch {
    console.debug(`${LOG_PREFIX} Batch delete cancelled by user`)
    // 用户取消
  }
}

/**
 * 用户表单提交成功回调
 * 刷新列表以反映最新数据
 */
function handleFormSuccess() {
  console.log(`${LOG_PREFIX} User form submitted successfully, refreshing list`)
  fetchUsers()
}

/**
 * 角色分配成功回调
 * 刷新列表以反映最新数据
 */
function handleRolesSuccess() {
  console.log(`${LOG_PREFIX} Roles assigned successfully, refreshing list`)
  fetchUsers()
}

/**
 * 密码重置成功回调
 * 仅显示成功提示，无需刷新列表
 */
function handlePasswordSuccess() {
  console.log(`${LOG_PREFIX} Password reset successfully for user ${currentUserId.value}`)
  ElMessage.success('密码重置成功')
}

</script>

<style scoped>
.user-management-page {
  display: flex;
  flex-direction: column;
  padding: 0;
  max-width: 1440px;
  margin: 0 auto;
}

.search-card {
  flex-shrink: 0;
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

.expand-icon {
  transition: transform 0.3s;
  margin-left: 2px;
}

.expand-icon.is-expanded {
  transform: rotate(180deg);
}

.user-table {
  width: 100%;
}

.user-table :deep(.el-table__cell .cell) {
  text-align: center;
}

/* 禁用用户行置灰 */
.user-table :deep(.row-disabled) {
  --el-table-tr-bg-color: var(--el-fill-color-lighter);
  color: var(--el-text-color-placeholder);
}

.user-table :deep(.row-disabled .el-avatar) {
  opacity: 0.5;
}

/* 下拉菜单危险操作 */
.dropdown-danger {
  color: var(--el-color-danger);
}

/* 用户信息单元格 */
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}

.user-cell__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.user-cell__top {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-cell__bottom {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-cell__name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-cell__sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-cell__id {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

/* 等级单元格 */
.level-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.level-cell__xp {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

/* 子文本 */
.sub-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 紧凑模式 - 用户摘要 */
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
  gap: 8px;
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

.stats-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-weight: 400;
}

.stats-item strong {
  color: var(--el-text-color-primary);
}

.stats-item--success {
  color: var(--el-color-success);
}

.stats-item--danger {
  color: var(--el-color-danger);
}

.table-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
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

  .batch-bar {
    flex-wrap: wrap;
  }
}
</style>
