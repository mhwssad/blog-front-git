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
          <el-button @click="handleReset">重置</el-button>
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
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-header__left">
            <span>用户列表</span>
            <div v-if="!userStore.loading && userStore.total > 0" class="stats-bar">
              <span class="stats-item">
                共 <strong>{{ userStore.total }}</strong> 人
              </span>
              <span class="stats-item stats-item--success"> 正常 {{ activeCount }} </span>
              <span class="stats-item stats-item--danger"> 禁用 {{ disabledCount }} </span>
            </div>
          </div>
          <el-button v-permission="'sys:user:create'" type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
        </div>
      </template>

      <!-- 批量操作栏 -->
      <transition name="el-fade-in">
        <div v-if="selectedRows.length > 0" class="batch-bar">
          <span class="batch-bar__text">
            已选择 <strong>{{ selectedRows.length }}</strong> 项
          </span>
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
        </div>
      </transition>

      <el-table
        ref="tableRef"
        v-loading="userStore.loading"
        :data="userStore.users"
        :size="isCompactTable ? 'small' : 'default'"
        :row-class-name="getRowClassName"
        table-layout="auto"
        class="user-table"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <!-- 空数据 -->
        <template #empty>
          <div class="table-empty">
            <el-empty description="暂无用户数据" :image-size="80" />
          </div>
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
                    <el-dropdown-item v-permission="'sys:user:adjust-experience'" command="adjust-exp">
                      调整经验
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="userStore.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
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

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown, Male, Female } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { useContentAdmin } from '@/composables/useContentAdmin'
import UserLevelBadge from '@/components/common/UserLevelBadge.vue'
import type { SysUserAdminVO, UserQueryRequest } from '@/types/api-types'
import UserFormDialog from './components/UserFormDialog.vue'
import AssignRolesDialog from './components/AssignRolesDialog.vue'
import ResetPasswordDialog from './components/ResetPasswordDialog.vue'
import UserDetailDialog from './components/UserDetailDialog.vue'
import SuperAdminActionDialog from './components/SuperAdminActionDialog.vue'

const userStore = useUserStore()

const tableRef = ref()

// 搜索表单
const searchForm = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  status: undefined as number | undefined,
})
const searchExpanded = ref(false)

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
})

// 批量选择
const selectedRows = ref<SysUserAdminVO[]>([])

// 对话框状态
const formDialogVisible = ref(false)
const rolesDialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const superAdminDialogVisible = ref(false)
const superAdminAction = ref<'ban' | 'unban' | 'adjust-level' | 'adjust-exp' | null>(null)

// 当前操作的用户
const editingUserId = ref<number | null>(null)
const currentUserId = ref(0)
const currentUsername = ref('')
const viewingUser = ref<SysUserAdminVO | null>(null)

const { isCompactTable } = useContentAdmin()

// 统计
const activeCount = computed(() => userStore.users.filter(u => u.status === 1).length)
const disabledCount = computed(() => userStore.users.filter(u => u.status === 0).length)

// 构建查询参数，只发送有值的筛选条件
function buildParams(): UserQueryRequest {
  const params: UserQueryRequest = {
    current: pagination.current,
    size: pagination.size,
  }
  if (searchForm.username.trim()) params.username = searchForm.username.trim()
  if (searchForm.nickname.trim()) params.nickname = searchForm.nickname.trim()
  if (searchForm.email.trim()) params.email = searchForm.email.trim()
  if (searchForm.phone.trim()) params.phone = searchForm.phone.trim()
  if (searchForm.status !== undefined) params.status = searchForm.status
  return params
}

// 获取用户列表
async function fetchUsers() {
  await userStore.fetchUsers(buildParams())
  pagination.current = userStore.current
  pagination.size = userStore.size
}

// 搜索
function handleSearch() {
  pagination.current = 1
  fetchUsers()
}

// 重置
function handleReset() {
  Object.assign(searchForm, {
    username: '',
    nickname: '',
    email: '',
    phone: '',
    status: undefined,
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

// 多选处理
function handleSelectionChange(rows: SysUserAdminVO[]) {
  selectedRows.value = rows
}

function clearSelection() {
  tableRef.value?.clearSelection()
}

// 新增用户
function handleAdd() {
  editingUserId.value = null
  formDialogVisible.value = true
}

// 查看详情
function handleView(row: SysUserAdminVO) {
  viewingUser.value = row
  detailDialogVisible.value = true
}

// 编辑用户
function handleEdit(row: SysUserAdminVO) {
  editingUserId.value = row.id
  formDialogVisible.value = true
}

// 状态变更
async function handleStatusChange(row: SysUserAdminVO, newVal: number) {
  const oldVal = row.status
  row.status = newVal
  const ok = await userStore.updateUserStatus(row.id, { status: newVal })
  if (ok) {
    ElMessage.success('状态更新成功')
  } else {
    row.status = oldVal
    ElMessage.error('状态更新失败')
  }
}

// 行样式：禁用用户置灰
function getRowClassName({ row }: { row: SysUserAdminVO }): string {
  return row.status === 0 ? 'row-disabled' : ''
}

// 操作下拉菜单统一入口
function handleAction(command: string, row: SysUserAdminVO) {
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

// 删除用户
async function confirmDelete(row: SysUserAdminVO) {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const ok = await userStore.deleteUser(row.id)
    if (ok) {
      ElMessage.success('删除成功')
      fetchUsers()
    } else {
      ElMessage.error('删除失败')
    }
  } catch {
    // 用户取消
  }
}

// 批量状态变更
async function handleBatchStatus(status: number) {
  const label = status === 1 ? '启用' : '禁用'
  const ids = selectedRows.value.map(r => r.id)
  try {
    await ElMessageBox.confirm(`确定要批量${label} ${ids.length} 个用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const results = await Promise.allSettled(
      ids.map(id => userStore.updateUserStatus(id, { status }))
    )
    const failed = results.filter(r => r.status === 'fulfilled' && !r.value).length
    if (failed === 0) {
      ElMessage.success(`批量${label}成功`)
    } else {
      ElMessage.warning(`${label}完成，${failed} 个失败`)
    }
    clearSelection()
    fetchUsers()
  } catch {
    // 用户取消
  }
}

// 批量删除
async function handleBatchDelete() {
  const ids = selectedRows.value.map(r => r.id)
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
    const results = await Promise.allSettled(ids.map(id => userStore.deleteUser(id)))
    const failed = results.filter(r => r.status === 'fulfilled' && !r.value).length
    if (failed === 0) {
      ElMessage.success('批量删除成功')
    } else {
      ElMessage.warning(`删除完成，${failed} 个失败`)
    }
    clearSelection()
    fetchUsers()
  } catch {
    // 用户取消
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

/* 批量操作栏 */
.batch-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
}

.batch-bar__text {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-right: auto;
}

.table-card {
  display: flex;
  flex-direction: column;
}

.table-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
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

/* 空数据 */
.table-empty {
  padding: 24px 0;
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
  font-weight: 500;
}

.card-header__left {
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

.pagination {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 12px 0 8px;
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
