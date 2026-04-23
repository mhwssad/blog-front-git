<template>
  <el-dialog
    v-model="dialogVisible"
    title="分配菜单"
    width="720px"
    :close-on-click-modal="false"
    center
    @close="handleClose"
  >
    <div class="assign-menus-content">
      <div class="toolbar">
        <div class="toolbar-main">
          <p class="tips">为角色 <strong>{{ roleName }}</strong> 分配菜单权限</p>
          <el-input
            v-model="filterKeyword"
            class="filter-input"
            placeholder="搜索菜单名称、权限标识或路由"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="toolbar-actions">
          <el-checkbox v-model="checkStrictly">父子节点不联动</el-checkbox>
          <el-button text @click="handleCheckAll">全选</el-button>
          <el-button text @click="handleClearSelection">清空</el-button>
        </div>
      </div>

      <el-skeleton v-if="loading" :rows="10" animated />
      <el-empty v-else-if="menuTree.length === 0" description="暂无可分配菜单" />
      <el-tree
        v-else
        ref="treeRef"
        class="menu-tree"
        :data="menuTree"
        :default-checked-keys="checkedMenuIds"
        node-key="id"
        show-checkbox
        default-expand-all
        :expand-on-click-node="false"
        :check-strictly="checkStrictly"
        :filter-node-method="filterNode"
        :props="treeProps"
      >
        <template #default="{ data }">
          <div class="tree-node">
            <div class="tree-node-main">
              <span class="tree-node-title">{{ data.name }}</span>
              <el-tag size="small" effect="plain">{{ resolveMenuTypeLabel(data.type) }}</el-tag>
            </div>
            <div class="tree-node-meta">
              <span v-if="data.routePath" class="tree-node-route">{{ data.routePath }}</span>
              <span v-if="data.perm" class="tree-node-perm">{{ data.perm }}</span>
            </div>
          </div>
        </template>
      </el-tree>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        v-permission="'sys:role:assign-menu'"
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { menuApi } from '@/api/sys/menu'
import { roleApi } from '@/api/sys/role'
import type { SysMenuAdminVO } from '@/api/types'

interface Props {
  visible: boolean
  roleId: number
  roleName: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

interface MenuTreeRef {
  filter: (value: string) => void
  setCheckedKeys: (keys: number[]) => void
  getCheckedKeys: () => number[]
  getHalfCheckedKeys: () => number[]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const treeRef = ref<MenuTreeRef | null>(null)
const loading = ref(false)
const submitting = ref(false)
const filterKeyword = ref('')
const checkStrictly = ref(false)
const menuTree = ref<SysMenuAdminVO[]>([])
const checkedMenuIds = ref<number[]>([])

const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

const treeProps = {
  label: 'name',
  children: 'children',
}

function resolveMenuTypeLabel(type: string): string {
  if (type === 'C') {
    return '目录'
  }

  if (type === 'M') {
    return '菜单'
  }

  if (type === 'B') {
    return '按钮'
  }

  return type
}

function filterNode(value: string, data: Record<string, unknown>): boolean {
  if (!value) {
    return true
  }

  const keyword = value.trim().toLowerCase()
  return [data.name, data.routePath, data.perm]
    .filter(Boolean)
    .some(field => String(field).toLowerCase().includes(keyword))
}

function collectAllMenuIds(tree: SysMenuAdminVO[]): number[] {
  const ids: number[] = []

  const traverse = (nodes: SysMenuAdminVO[]) => {
    for (const node of nodes) {
      ids.push(node.id)
      if (node.children?.length) {
        traverse(node.children)
      }
    }
  }

  traverse(tree)
  return ids
}

function applyCheckedKeys(keys: number[]): void {
  checkedMenuIds.value = [...keys]
  void nextTick(() => {
    treeRef.value?.setCheckedKeys(checkedMenuIds.value)
  })
}

async function loadDialogData(): Promise<void> {
  if (!props.roleId) {
    return
  }

  loading.value = true
  try {
    const [menuResponse, roleMenuResponse] = await Promise.all([
      menuApi.getMenuTree(),
      roleApi.getRoleMenus(props.roleId),
    ])

    menuTree.value = menuResponse.data.data ?? []
    applyCheckedKeys(roleMenuResponse.data.data ?? [])
  } catch {
    ElMessage.error('加载角色菜单失败')
  } finally {
    loading.value = false
  }
}

function handleCheckAll(): void {
  applyCheckedKeys(collectAllMenuIds(menuTree.value))
}

function handleClearSelection(): void {
  applyCheckedKeys([])
}

async function handleSubmit(): Promise<void> {
  if (!props.roleId) {
    return
  }

  submitting.value = true
  try {
    const checkedKeys = treeRef.value?.getCheckedKeys() ?? []
    const halfCheckedKeys = checkStrictly.value ? [] : treeRef.value?.getHalfCheckedKeys() ?? []
    const menuIds = [...new Set([...checkedKeys, ...halfCheckedKeys])]

    await roleApi.assignRoleMenus(props.roleId, { menuIds })
    ElMessage.success('菜单分配成功')
    emit('success')
    handleClose()
  } catch {
    ElMessage.error('菜单分配失败')
  } finally {
    submitting.value = false
  }
}

function handleClose(): void {
  filterKeyword.value = ''
  checkStrictly.value = false
  checkedMenuIds.value = []
  treeRef.value?.setCheckedKeys([])
  emit('update:visible', false)
}

watch(filterKeyword, keyword => {
  treeRef.value?.filter(keyword)
})

watch(checkStrictly, () => {
  treeRef.value?.setCheckedKeys(checkedMenuIds.value)
})

watch(
  () => [props.visible, loading.value, menuTree.value.length] as const,
  async ([visible, isLoading, menuCount]) => {
    if (!visible || isLoading || menuCount === 0) {
      return
    }

    await nextTick()
    treeRef.value?.setCheckedKeys(checkedMenuIds.value)
  }
)

watch(
  () => props.visible,
  visible => {
    if (visible) {
      void loadDialogData()
    }
  }
)
</script>

<style scoped>
.assign-menus-content {
  min-height: 420px;
  padding: 0 12px;
}

.toolbar {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.toolbar-main {
  flex: 1;
}

.tips {
  margin: 0 0 12px;
  color: var(--color-text-regular);
}

.filter-input {
  max-width: 360px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.menu-tree {
  max-height: min(calc(100vh - 280px), 840px);
  overflow: auto;
  padding: 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  background-color: #fff;
}

.tree-node {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding: 4px 0;
}

.tree-node-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tree-node-title {
  font-weight: 500;
  color: var(--color-text-primary);
}

.tree-node-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.tree-node-route,
.tree-node-perm {
  padding: 2px 8px;
  border-radius: 999px;
  background-color: var(--el-fill-color-light);
}

:deep(.menu-tree .el-tree-node__content) {
  height: auto;
  min-height: 34px;
  align-items: flex-start;
  padding: 6px 0;
}

:deep(.menu-tree .el-tree-node__expand-icon) {
  margin-top: 8px;
}

:deep(.menu-tree .el-checkbox) {
  margin-top: 6px;
}

:deep(.menu-tree .el-tree-node) {
  white-space: normal;
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

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
  }

  .filter-input {
    max-width: 100%;
  }
}
</style>
