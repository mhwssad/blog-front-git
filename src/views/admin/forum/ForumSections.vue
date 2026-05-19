<template>
  <div class="forum-sections-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键词" class="filter-item">
          <el-input
            v-model="searchForm.keyword"
            class="filter-control"
            clearable
            placeholder="请输入版块名称或简介"
          />
        </el-form-item>
        <el-form-item label="状态" class="filter-item">
          <el-select
            v-model="searchForm.status"
            class="filter-control"
            clearable
            placeholder="全部"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="可见范围" class="filter-item">
          <el-select
            v-model="searchForm.visibilityScope"
            class="filter-control"
            clearable
            placeholder="全部"
          >
            <el-option label="公开" :value="0" />
            <el-option label="登录可见" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button v-permission="'content:forum:query'" type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <DataTable
      class="section-table"
      title="论坛版块列表"
      :data="forumStore.sections"
      :loading="forumStore.sectionLoading"
      :total="forumStore.sectionTotal"
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :page-sizes="[10, 20, 50, 100]"
      :pagination-layout="paginationLayout"
      :compact="isCompactTable"
      @page-change="handleCurrentChange"
      @size-change="handleSizeChange"
    >
      <template #header-extra>
        <span class="header-count">{{ forumStore.sectionTotal }} 条</span>
        <el-button v-permission="'content:forum:create'" type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新增版块
        </el-button>
      </template>

      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column label="版块名称" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="cell-stack">
            <span>{{ row.name }}</span>
            <span class="cell-subtext">#{{ row.id }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="description"
        label="简介"
        min-width="240"
        show-overflow-tooltip
      />
      <el-table-column prop="sortOrder" label="排序" width="90" align="center" />
      <el-table-column label="可见范围" min-width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="getVisibilityTagType(row.visibilityScope)" effect="light" size="small">
            {{ formatVisibility(row.visibilityScope) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="postLevelLimit" label="发帖等级" min-width="100" align="center" />
      <el-table-column label="状态" min-width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getSectionStatusTagType(row.status)" effect="light" size="small">
            {{ getSectionStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="170" align="center">
        <template #default="{ row }">
          {{ formatCreatedAt(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" min-width="170" align="center">
        <template #default="{ row }">
          {{ formatUpdatedAt(row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        :min-width="isCompactTable ? 180 : 220"
        :fixed="isCompactTable ? false : 'right'"
        class-name="action-column"
        align="center"
      >
        <template #default="{ row }">
          <div class="table-actions" :class="{ 'table-actions--compact': isCompactTable }">
            <el-button
              v-permission="'content:forum:query'"
              link
              type="primary"
              @click="handleView(row)"
            >
              详情
            </el-button>
            <el-button
              v-permission="'content:forum:update'"
              link
              type="primary"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-permission="'content:forum:update'"
              link
              :type="row.status === 1 ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button
              v-permission="'content:forum:delete'"
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

    <el-dialog
      v-model="formVisible"
      :title="isEditing ? '编辑版块' : '新增版块'"
      width="640px"
      destroy-on-close
      align-center
      @closed="resetForm"
    >
      <el-form
        ref="sectionFormRef"
        :model="sectionForm"
        :rules="sectionRules"
        label-width="110px"
      >
        <el-form-item label="版块名称" prop="name">
          <el-input
            v-model="sectionForm.name"
            maxlength="64"
            show-word-limit
            placeholder="请输入版块名称"
          />
        </el-form-item>
        <el-form-item label="版块简介" prop="description">
          <el-input
            v-model="sectionForm.description"
            :rows="4"
            type="textarea"
            maxlength="512"
            show-word-limit
            placeholder="请输入版块简介"
          />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :xs="24" :sm="8">
            <el-form-item label="排序值" prop="sortOrder">
              <el-input-number
                v-model="sectionForm.sortOrder"
                :min="0"
                controls-position="right"
                class="dialog-number"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="可见范围" prop="visibilityScope">
              <el-select v-model="sectionForm.visibilityScope" class="dialog-control">
                <el-option label="公开" :value="0" />
                <el-option label="登录可见" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="发帖等级" prop="postLevelLimit">
              <el-input-number
                v-model="sectionForm.postLevelLimit"
                :min="1"
                controls-position="right"
                class="dialog-number"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="sectionForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingSection" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-drawer
      v-model="detailVisible"
      title="版块详情"
      size="520px"
      destroy-on-close
    >
      <el-descriptions v-if="currentSection" :column="1" border>
        <el-descriptions-item label="ID">{{ currentSection.id }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{ currentSection.name }}</el-descriptions-item>
        <el-descriptions-item label="简介">
          {{ currentSection.description || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="排序">{{ currentSection.sortOrder }}</el-descriptions-item>
        <el-descriptions-item label="可见范围">
          <el-tag :type="getVisibilityTagType(currentSection.visibilityScope)" effect="light">
            {{ formatVisibility(currentSection.visibilityScope) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发帖等级">
          {{ currentSection.postLevelLimit }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getSectionStatusTagType(currentSection.status)" effect="light">
            {{ getSectionStatusText(currentSection.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatCreatedAt(currentSection.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatUpdatedAt(currentSection.updatedAt) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, RefreshRight, Search } from '@element-plus/icons-vue'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useForumAdminStore } from '@/stores'
import type {
  ForumSectionSaveRequest,
  ForumSectionQueryRequest,
  ForumSectionVO,
  StatusUpdateRequest,
} from '@/types/api-types'
import { formatCreatedAt, formatUpdatedAt, formatVisibility } from '@/utils'

const forumStore = useForumAdminStore()
const { isCompactTable, paginationLayout } = useContentAdmin()

const searchForm = reactive<ForumSectionQueryRequest>({
  current: 1,
  size: 10,
  keyword: undefined,
  status: undefined,
  visibilityScope: undefined,
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const formVisible = ref(false)
const detailVisible = ref(false)
const savingSection = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const sectionFormRef = ref<FormInstance>()
const currentSection = ref<ForumSectionVO | null>(null)

const sectionForm = reactive<ForumSectionSaveRequest>({
  name: '',
  description: '',
  sortOrder: 0,
  visibilityScope: 0,
  postLevelLimit: 1,
  status: 1,
})

const sectionRules: FormRules<ForumSectionSaveRequest> = {
  name: [{ required: true, message: '请输入版块名称', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '请输入排序值', trigger: 'change' }],
  visibilityScope: [{ required: true, message: '请选择可见范围', trigger: 'change' }],
  postLevelLimit: [{ required: true, message: '请输入发帖等级', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

function getSectionStatusText(value?: number): string {
  return value === 0 ? '禁用' : '启用'
}

function getSectionStatusTagType(value?: number): 'success' | 'warning' | 'info' {
  return value === 0 ? 'info' : 'success'
}

function getVisibilityTagType(value?: number): 'success' | 'info' {
  return value === 1 ? 'success' : 'info'
}

async function fetchSections(): Promise<void> {
  await forumStore.fetchSections({
    current: pagination.current,
    size: pagination.size,
    keyword: searchForm.keyword?.trim() || undefined,
    status: searchForm.status,
    visibilityScope: searchForm.visibilityScope,
  })
}

function resetForm(): void {
  editingId.value = null
  isEditing.value = false
  Object.assign(sectionForm, {
    name: '',
    description: '',
    sortOrder: 0,
    visibilityScope: 0,
    postLevelLimit: 1,
    status: 1,
  })
  sectionFormRef.value?.clearValidate()
}

function openForm(row?: ForumSectionVO): void {
  if (row) {
    editingId.value = row.id
    isEditing.value = true
    Object.assign(sectionForm, {
      name: row.name,
      description: row.description,
      sortOrder: row.sortOrder,
      visibilityScope: row.visibilityScope,
      postLevelLimit: row.postLevelLimit,
      status: row.status,
    })
  } else {
    resetForm()
  }

  formVisible.value = true
  void nextTick(() => sectionFormRef.value?.clearValidate())
}

function handleCreate(): void {
  openForm()
}

function handleEdit(row: ForumSectionVO): void {
  openForm(row)
}

function handleView(row: ForumSectionVO): void {
  currentSection.value = row
  detailVisible.value = true
}

async function handleSubmit(): Promise<void> {
  if (!sectionFormRef.value) return

  const valid = await sectionFormRef.value.validate().catch(() => false)
  if (!valid) return

  savingSection.value = true
  try {
    const payload: ForumSectionSaveRequest = {
      name: sectionForm.name.trim(),
      description: sectionForm.description?.trim() || undefined,
      sortOrder: sectionForm.sortOrder,
      visibilityScope: sectionForm.visibilityScope,
      postLevelLimit: sectionForm.postLevelLimit,
      status: sectionForm.status,
    }

    const success = editingId.value
      ? await forumStore.updateSection(editingId.value, payload)
      : await forumStore.createSection(payload)

    if (!success) {
      throw new Error('save failed')
    }

    ElMessage.success(isEditing.value ? '版块更新成功' : '版块创建成功')
    formVisible.value = false
    await fetchSections()
  } catch {
    ElMessage.error(isEditing.value ? '版块更新失败' : '版块创建失败')
  } finally {
    savingSection.value = false
  }
}

async function handleToggleStatus(row: ForumSectionVO): Promise<void> {
  const nextStatus = row.status === 1 ? 0 : 1
  const actionText = nextStatus === 1 ? '启用' : '禁用'

  try {
    await ElMessageBox.confirm(`确定要${actionText}版块「${row.name}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await forumStore.updateSectionStatus(row.id, {
      status: nextStatus,
    } satisfies StatusUpdateRequest)

    if (!success) {
      ElMessage.error('版块状态更新失败')
      return
    }

    ElMessage.success(`版块已${actionText}`)
    await fetchSections()
  } catch {
    // cancelled or failed
  }
}

async function handleDelete(row: ForumSectionVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除版块「${row.name}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await forumStore.deleteSection(row.id)
    if (!success) {
      ElMessage.error('版块删除失败')
      return
    }

    ElMessage.success('版块删除成功')
    await fetchSections()
  } catch {
    // cancelled or failed
  }
}

function handleSearch(): void {
  pagination.current = 1
  void fetchSections()
}

function handleReset(): void {
  Object.assign(searchForm, {
    current: 1,
    size: 10,
    keyword: undefined,
    status: undefined,
    visibilityScope: undefined,
  })
  pagination.current = 1
  pagination.size = 10
  void fetchSections()
}

function handleSizeChange(size: number): void {
  pagination.size = size
  pagination.current = 1
  void fetchSections()
}

function handleCurrentChange(current: number): void {
  pagination.current = current
  void fetchSections()
}

onMounted(() => {
  void fetchSections()
})
</script>

<style scoped>
.forum-sections-page {
  padding: 0;
  max-width: 1680px;
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

.search-actions {
  margin-left: 0;
  margin-right: 0;
}

.header-count {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.section-table {
  width: 100%;
}

.section-table :deep(.el-table__cell .cell) {
  text-align: center;
}

.section-table :deep(.action-column) {
  border-left: 2px solid var(--el-border-color);
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

.cell-stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cell-subtext {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.2;
}

.dialog-control,
.dialog-number {
  width: 100%;
}

@media (max-width: 768px) {
  .filter-item,
  .search-actions {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
  }

  .filter-control {
    width: 100%;
  }

  .search-actions :deep(.el-form-item__content) {
    width: 100%;
    justify-content: center;
  }
}
</style>
