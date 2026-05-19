<template>
  <div class="role-management-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input v-model="searchForm.code" placeholder="请输入角色编码" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            class="filter-control filter-control--status"
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button v-permission="'sys:role:query'" type="primary" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <DataTable
      :data="tableData"
      :loading="loading"
      :total="pagination.total"
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :page-sizes="[10, 20, 50, 100]"
      :pagination-layout="paginationLayout"
      title="角色列表"
      :compact="isCompactTable"
      @page-change="fetchRoles"
      @size-change="() => { pagination.current = 1; fetchRoles() }"
    >
      <template #header-extra>
        <el-button v-permission="'sys:role:create'" type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增角色
        </el-button>
      </template>

      <el-table-column prop="id" label="ID" min-width="80" align="center" />
      <el-table-column
        prop="name"
        label="角色名称"
        min-width="160"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column
        prop="code"
        label="角色编码"
        min-width="180"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column prop="sort" label="排序" min-width="90" align="center" />
      <el-table-column label="状态" min-width="100" align="center">
        <template #default="{ row }">
          <el-switch
            v-permission.disable="'sys:role:update'"
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="remark"
        label="备注"
        min-width="220"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column label="操作" min-width="250" fixed="right" align="center">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button link type="primary" @click="handleView(row)"> 查看 </el-button>
            <el-button
              v-permission="'sys:role:update'"
              link
              type="primary"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-permission="'sys:role:assign-menu'"
              link
              type="primary"
              @click="handleAssignMenus(row)"
            >
              分配菜单
            </el-button>
            <el-button
              v-permission="'sys:role:delete'"
              link
              type="danger"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </DataTable>

    <RoleFormDialog
      v-model:visible="formDialogVisible"
      :role-id="editingRoleId"
      @success="handleFormSuccess"
    />

    <AssignMenusDialog
      v-model:visible="menusDialogVisible"
      :role-id="currentRoleId"
      :role-name="currentRoleName"
      @success="handleMenusSuccess"
    />

    <RoleDetailDialog v-model:visible="detailDialogVisible" :role="viewingRole" />
  </div>
</template>

/** * 角色管理页面（后台） * @description
后台角色管理，支持角色的增删改查、状态切换、菜单分配、查看详情 * @module admin/role/Roles * @see
api/sys/role.ts */
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { RoleApi } from '@/api/sys/role'
import type { RoleQueryRequest, SysRoleAdminVO } from '@/types/api-types'
import { useContentAdmin } from '@/composables/useContentAdmin'
import DataTable from '@/components/common/DataTable.vue'
import RoleFormDialog from './components/RoleFormDialog.vue'
import AssignMenusDialog from './components/AssignMenusDialog.vue'
import RoleDetailDialog from './components/RoleDetailDialog.vue'
const searchForm = reactive<RoleQueryRequest>({
  current: 1,
  size: 10,
  name: undefined,
  code: undefined,
  status: undefined,
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const tableData = ref<SysRoleAdminVO[]>([])
const loading = ref(false)

const formDialogVisible = ref(false)
const menusDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const editingRoleId = ref<number | null>(null)
const currentRoleId = ref<number>(0)
const currentRoleName = ref('')
const viewingRole = ref<SysRoleAdminVO | null>(null)

const { paginationLayout, isCompactTable } = useContentAdmin({
  minHeight: 280,
  bottomOffset: 32,
})

async function fetchRoles(): Promise<void> {
  loading.value = true
  try {
    const response = await RoleApi.getRoles({
      ...searchForm,
      current: pagination.current,
      size: pagination.size,
    })
    const data = response.data.data
    tableData.value = data.records
    pagination.total = data.total
  } catch {
    ElMessage.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch(): void {
  pagination.current = 1
  void fetchRoles()
}

function handleReset(): void {
  Object.assign(searchForm, {
    current: 1,
    size: 10,
    name: undefined,
    code: undefined,
    status: undefined,
  })
  pagination.current = 1
  pagination.size = 10
  void fetchRoles()
}

function handleAdd(): void {
  editingRoleId.value = null
  formDialogVisible.value = true
}

function handleView(row: SysRoleAdminVO): void {
  viewingRole.value = row
  detailDialogVisible.value = true
}

function handleEdit(row: SysRoleAdminVO): void {
  editingRoleId.value = row.id
  formDialogVisible.value = true
}

async function handleStatusChange(row: SysRoleAdminVO): Promise<void> {
  const previousStatus = row.status === 1 ? 0 : 1

  try {
    await RoleApi.updateRoleStatus(row.id, { status: row.status })
    ElMessage.success('状态更新成功')
  } catch {
    row.status = previousStatus
    ElMessage.error('状态更新失败')
  }
}

function handleAssignMenus(row: SysRoleAdminVO): void {
  currentRoleId.value = row.id
  currentRoleName.value = row.name
  menusDialogVisible.value = true
}

async function handleDelete(row: SysRoleAdminVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除角色 "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await RoleApi.deleteRole(row.id)
    ElMessage.success('删除成功')
    void fetchRoles()
  } catch {
    // 用户取消或删除失败
  }
}

function handleFormSuccess(): void {
  void fetchRoles()
}

function handleMenusSuccess(): void {
  ElMessage.success('菜单分配成功')
}

onMounted(() => {
  void fetchRoles()
})
</script>

<style scoped>
.role-management-page {
  padding: 0;
  max-width: 1440px;
  margin: 0 auto;
}

.search-card {
  margin-bottom: 16px;
}

.search-card :deep(.el-form-item) {
  margin-bottom: 0;
}

.table-actions {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px 8px;
}

.table-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

.filter-control {
  width: 220px;
}

.filter-control--status {
  width: 160px;
}
</style>
