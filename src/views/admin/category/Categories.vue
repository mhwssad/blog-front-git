<template>
  <div class="category-management-page">
    <el-card class="search-card" shadow="never">
      <div class="search-toolbar">
        <el-input
          v-model="keyword"
          class="search-input"
          clearable
          placeholder="搜索分类名称、编码、类型或描述"
        />
        <div class="search-actions">
          <el-button v-permission="'content:category:create'" type="primary" @click="handleAddRoot">
            <el-icon><Plus /></el-icon>
            新增根分类
          </el-button>
          <el-button v-permission="'content:category:query'" @click="refreshCategories">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>分类树</span>
          <span class="card-header__meta">{{ categoryCount }} 个节点</span>
        </div>
      </template>

      <div>
        <el-table
          v-loading="categoryStore.loading"
          :data="filteredCategoryTree"
          :size="isCompactTable ? 'small' : 'default'"
          row-key="id"
          :tree-props="{ children: 'children' }"
          default-expand-all
          stripe
          border
          table-layout="auto"
          class="category-table"
        >
          <el-table-column
            label="分类名称"
            min-width="220"
            align="left"
            class-name="category-text-column"
          >
            <template #default="{ row }">
              <div class="category-name-cell">
                <span v-if="row.icon" class="category-icon">{{ row.icon }}</span>
                <span>{{ row.name }}</span>
                <el-tag size="small" effect="plain">{{ row.type }}</el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="code"
            label="编码"
            min-width="160"
            align="left"
            class-name="category-text-column"
          >
            <template #default="{ row }">
              {{ formatOptionalText(row.code) }}
            </template>
          </el-table-column>

          <el-table-column label="状态" width="150" align="center">
            <template #default="{ row }">
              <el-switch
                v-permission.disable="'content:category:update'"
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                inline-prompt
                active-text="正常"
                inactive-text="停用"
                @change="value => handleStatusChange(row, Number(value))"
              />
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            width="240"
            fixed="right"
            align="center"
          >
            <template #default="{ row }">
              <div class="table-actions">
                <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
                <el-button
                  v-permission="'content:category:create'"
                  link
                  type="primary"
                  @click="handleAddChild(row)"
                >
                  新增子分类
                </el-button>
                <el-button
                  v-permission="'content:category:update'"
                  link
                  type="primary"
                  @click="handleEdit(row)"
                >
                  编辑
                </el-button>
                <el-button
                  v-permission="'content:category:delete'"
                  link
                  type="danger"
                  @click="handleDelete(row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <CategoryFormDialog
      v-model:visible="formDialogVisible"
      :category="editingCategory"
      :parent-id="dialogParentId"
      :category-tree="categoryStore.categories"
      @success="handleDialogSuccess"
    />

    <CategoryDetailDialog
      v-model:visible="detailDialogVisible"
      :detail="detailCategory"
      :category-tree="categoryStore.categories"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { formatOptionalText } from '@/utils'
import { useCategoryStore } from '@/stores'
import CategoryFormDialog from './components/CategoryFormDialog.vue'
import CategoryDetailDialog from './components/CategoryDetailDialog.vue'
import type { CategoryAdminVO } from '@/types/api-types'

const categoryStore = useCategoryStore()
const keyword = ref('')
const { isCompactTable } = useContentAdmin()
const formDialogVisible = ref(false)
const editingCategory = ref<CategoryAdminVO | null>(null)
const dialogParentId = ref(0)
const dialogParentLabel = ref('根分类')
const detailDialogVisible = ref(false)
const detailCategory = ref<CategoryAdminVO | null>(null)

const categoryCount = computed(() => countCategories(categoryStore.categories))
const filteredCategoryTree = computed(() =>
  filterCategoryTree(categoryStore.categories, keyword.value)
)

function countCategories(tree: CategoryAdminVO[]): number {
  return tree.reduce((total, item) => total + 1 + countCategories(item.children ?? []), 0)
}

function filterCategoryTree(tree: CategoryAdminVO[], value: string): CategoryAdminVO[] {
  const normalized = value.trim().toLowerCase()
  if (!normalized) {
    return tree
  }

  const result: CategoryAdminVO[] = []

  tree.forEach(item => {
    const children = filterCategoryTree(item.children ?? [], value)
    const matched = [item.name, item.code, item.type, item.description, item.icon]
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

function resolveParentLabel(parentId: number): string {
  if (!parentId) {
    return '根分类'
  }
  const queue = [...categoryStore.categories]
  while (queue.length) {
    const node = queue.shift()
    if (!node) {
      continue
    }
    if (node.id === parentId) {
      return node.name
    }
    if (node.children?.length) {
      queue.push(...node.children)
    }
  }
  return '根分类'
}

async function refreshCategories(): Promise<void> {
  await categoryStore.fetchCategoryTree()
}

function handleAddRoot(): void {
  editingCategory.value = null
  dialogParentId.value = 0
  dialogParentLabel.value = '根分类'
  formDialogVisible.value = true
}

function handleAddChild(row: CategoryAdminVO): void {
  editingCategory.value = null
  dialogParentId.value = row.id
  dialogParentLabel.value = row.name
  formDialogVisible.value = true
}

function handleEdit(row: CategoryAdminVO): void {
  editingCategory.value = row
  dialogParentId.value = row.parentId
  dialogParentLabel.value = resolveParentLabel(row.parentId)
  formDialogVisible.value = true
}

async function handleStatusChange(row: CategoryAdminVO, value: number): Promise<void> {
  const previous = value === 1 ? 0 : 1
  const success = await categoryStore.updateCategoryStatus(row.id, { status: value })
  if (!success) {
    row.status = previous
    ElMessage.error('状态更新失败')
    return
  }
  ElMessage.success('状态更新成功')
}

async function handleDelete(row: CategoryAdminVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除分类 "${row.name}" 吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })

    const success = await categoryStore.deleteCategory(row.id)
    if (!success) {
      throw new Error('删除失败')
    }
    ElMessage.success('分类删除成功')
    refreshCategories()
  } catch {
    // ignore dismissals and failure alerts already handled
  }
}

function handleDialogSuccess(): void {
  formDialogVisible.value = false
  refreshCategories()
}

function handleDetail(row: CategoryAdminVO): void {
  detailCategory.value = row
  detailDialogVisible.value = true
}

onMounted(() => {
  refreshCategories()
})
</script>

<style scoped>
.category-management-page {
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

.category-table {
  width: 100%;
}

.category-table :deep(.el-table__cell .cell) {
  text-align: center;
}

.category-table :deep(.category-text-column .cell) {
  text-align: left;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  line-height: 1.5;
}

.category-name-cell {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 8px;
  vertical-align: middle;
}

.category-icon {
  font-size: 14px;
  color: var(--el-text-color-primary);
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
