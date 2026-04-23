<template>
  <div class="menu-management-page">
    <el-card class="search-card" shadow="never">
      <div class="search-toolbar">
        <el-input
          v-model="keyword"
          class="search-input"
          clearable
          placeholder="搜索菜单名称、权限标识、路由路径"
        />
        <div class="search-actions">
          <el-button v-permission="'sys:menu:create'" type="primary" @click="handleAddRoot">
            <el-icon><Plus /></el-icon>
            新增根菜单
          </el-button>
          <el-button v-permission="'sys:menu:query'" @click="fetchMenuTree">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>菜单树</span>
          <span class="card-header__meta">{{ menuCount }} 个节点</span>
        </div>
      </template>

      <div ref="tableWrapperRef" class="table-wrapper">
        <el-table
          v-loading="menuStore.loading"
          :data="filteredMenuTree"
          :height="tableHeight"
          :size="isCompactTable ? 'small' : 'default'"
          row-key="id"
          :expand-row-keys="expandedRowKeys"
          :tree-props="{ children: 'children' }"
          table-layout="auto"
          class="menu-table"
          border
          stripe
          @expand-change="handleExpandChange"
        >
          <el-table-column label="菜单名称" min-width="200" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="menu-name-cell">
                <span>{{ row.name }}</span>
                <el-tag size="small" effect="plain">{{ formatMenuType(row.type) }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="routeName" label="路由名称" min-width="140" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatOptionalText(row.routeName) }}
            </template>
          </el-table-column>
          <el-table-column prop="routePath" label="路由路径" min-width="180" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatOptionalText(row.routePath) }}
            </template>
          </el-table-column>
          <el-table-column prop="component" label="组件路径" min-width="180" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatOptionalText(row.component) }}
            </template>
          </el-table-column>
          <el-table-column prop="perm" label="权限标识" min-width="180" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatOptionalText(row.perm) }}
            </template>
          </el-table-column>
          <el-table-column prop="icon" label="图标" min-width="120" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatOptionalText(row.icon) }}
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" min-width="90" align="center" />
          <el-table-column label="显示" min-width="90" align="center">
            <template #default="{ row }">
              {{ formatMenuVisible(row.visible) }}
            </template>
          </el-table-column>
          <el-table-column label="始终显示" min-width="110" align="center">
            <template #default="{ row }">
              {{ formatSystemFlag(row.alwaysShow ?? 0) }}
            </template>
          </el-table-column>
          <el-table-column label="缓存" min-width="90" align="center">
            <template #default="{ row }">
              {{ formatSystemFlag(row.keepAlive ?? 0) }}
            </template>
          </el-table-column>
          <el-table-column prop="redirect" label="重定向" min-width="160" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatOptionalText(row.redirect) }}
            </template>
          </el-table-column>
          <el-table-column label="路由参数" min-width="160" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatMenuParams(row.params) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            :min-width="isCompactTable ? 140 : 220"
            :fixed="isCompactTable ? false : 'right'"
            align="center"
          >
            <template #default="{ row }">
              <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
                <el-button v-permission="'sys:menu:create'" link type="primary" @click="handleAddChild(row)">
                  新增子菜单
                </el-button>
                <el-button v-permission="'sys:menu:update'" link type="primary" @click="handleEdit(row)">
                  编辑
                </el-button>
                <el-button v-permission="'sys:menu:delete'" link type="danger" @click="handleDelete(row)">
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <MenuFormDialog
      v-model:visible="formDialogVisible"
      :menu-id="editingMenuId"
      :parent-id="currentParentId"
      :menu-tree="menuStore.menuTree"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import type { SysMenuAdminVO } from '@/api/types'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useAuthStore, useMenuStore } from '@/stores'
import {
  formatMenuType,
  formatMenuVisible,
  formatOptionalText,
  formatSystemFlag,
} from '@/utils'
import MenuFormDialog from './components/MenuFormDialog.vue'

const menuStore = useMenuStore()
const authStore = useAuthStore()
const keyword = ref('')
const formDialogVisible = ref(false)
const editingMenuId = ref<number | null>(null)
const currentParentId = ref(0)

const { tableWrapperRef, tableHeight, isCompactTable } = useContentAdmin({
  minHeight: 420,
  bottomOffset: 24,
})

// 表格展开状态持久化
const MENU_EXPAND_KEY = 'menu_table_expanded'
const expandedRowKeys = ref<string[]>([])

function toExpandedRowKey(id: number): string {
  return String(id)
}

function collectMenuKeys(tree: SysMenuAdminVO[]): string[] {
  return tree.flatMap(item => [toExpandedRowKey(item.id), ...collectMenuKeys(item.children ?? [])])
}

function collectDescendantKeys(children: SysMenuAdminVO[] = []): string[] {
  return children.flatMap(item => [toExpandedRowKey(item.id), ...collectDescendantKeys(item.children ?? [])])
}

// 保存展开状态到 localStorage
function saveExpandedState(keys: string[]): void {
  try {
    localStorage.setItem(MENU_EXPAND_KEY, JSON.stringify(keys))
  } catch {
    // ignore
  }
}

// 处理展开/收起变化
function handleExpandChange(row: SysMenuAdminVO, expanded: boolean): void {
  const rowKey = toExpandedRowKey(row.id)

  if (expanded) {
    if (!expandedRowKeys.value.includes(rowKey)) {
      expandedRowKeys.value = [...expandedRowKeys.value, rowKey]
    }
  } else {
    const collapsedKeys = new Set([rowKey, ...collectDescendantKeys(row.children)])
    expandedRowKeys.value = expandedRowKeys.value.filter(id => !collapsedKeys.has(id))
  }

  saveExpandedState(expandedRowKeys.value)
}

// 恢复展开状态
async function restoreExpandedState(): Promise<void> {
  try {
    const saved = localStorage.getItem(MENU_EXPAND_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as unknown
      const availableKeys = new Set(collectMenuKeys(menuStore.menuTree))
      expandedRowKeys.value = Array.isArray(parsed)
        ? parsed.map(id => String(id)).filter(id => availableKeys.has(id))
        : []
      return
    }

    expandedRowKeys.value = []
  } catch {
    expandedRowKeys.value = []
  }
}

const menuCount = computed(() => countMenus(menuStore.menuTree))
const filteredMenuTree = computed(() => filterMenuTree(menuStore.menuTree, keyword.value))

function countMenus(tree: SysMenuAdminVO[]): number {
  return tree.reduce((total, item) => total + 1 + countMenus(item.children ?? []), 0)
}

function filterMenuTree(tree: SysMenuAdminVO[], value: string): SysMenuAdminVO[] {
  const normalized = value.trim().toLowerCase()
  if (!normalized) {
    return tree
  }

  const result: SysMenuAdminVO[] = []

  tree.forEach(item => {
    const children = filterMenuTree(item.children ?? [], value)
    const matched = [item.name, item.routePath, item.perm, item.routeName, item.component]
      .filter(Boolean)
      .some(field => String(field).toLowerCase().includes(normalized))

    if (!matched && children.length === 0) {
      return
    }

    result.push({
      ...item,
      children,
    })
  })

  return result
}

function formatMenuParams(params?: Record<string, string> | null): string {
  if (!params || Object.keys(params).length === 0) {
    return '-'
  }

  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ')
}

async function fetchMenuTree(): Promise<void> {
  try {
    await menuStore.fetchMenuTree()
    // 数据加载完成后恢复展开状态
    await restoreExpandedState()
  } catch {
    ElMessage.error('获取菜单树失败')
  }
}

function handleAddRoot(): void {
  editingMenuId.value = null
  currentParentId.value = 0
  formDialogVisible.value = true
}

function handleAddChild(row: SysMenuAdminVO): void {
  editingMenuId.value = null
  currentParentId.value = row.id
  formDialogVisible.value = true
}

function handleEdit(row: SysMenuAdminVO): void {
  editingMenuId.value = row.id
  currentParentId.value = row.parentId
  formDialogVisible.value = true
}

async function handleDelete(row: SysMenuAdminVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除菜单 "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await menuStore.deleteMenu(row.id)
    if (!success) {
      throw new Error('delete failed')
    }

    ElMessage.success('菜单删除成功')
    await fetchMenuTree()
  } catch {
    // 用户取消或删除失败
  }
}

function handleFormSuccess(): void {
  void fetchMenuTree()
}

onMounted(() => {
  void fetchMenuTree()
})
</script>

<style scoped>
.menu-management-page {
  padding: 0;
  max-width: 1680px;
  margin: 0 auto;
}

.search-card {
  margin-bottom: 16px;
}

.search-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
}

.search-input {
  width: 360px;
  max-width: 100%;
}

.search-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.table-card {
  min-height: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}

.card-header__meta {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.table-wrapper {
  min-height: 0;
}

.menu-table {
  width: 100%;
}

.menu-table :deep(.el-table__cell .cell) {
  text-align: center;
}

.menu-name-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
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

@media (max-width: 768px) {
  .search-input {
    width: 100%;
  }

  .search-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
