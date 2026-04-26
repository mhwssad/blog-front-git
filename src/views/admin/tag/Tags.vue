<template>
  <div class="tag-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form" @submit.prevent="handleSearch">
        <el-form-item label="标签名称">
          <el-input
            v-model="searchForm.name"
            class="filter-input"
            placeholder="请输入标签名称"
            clearable
          />
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button v-permission="'content:tag:query'" type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="table-header">
          <span>标签列表</span>
          <div class="table-header__actions">
            <el-button v-permission="'content:tag:create'" type="primary" size="small" @click="handleAddTag">
              <el-icon><Plus /></el-icon>
              新增标签
            </el-button>
            <el-button
              v-permission="'content:tag:query'"
              type="default"
              size="small"
              ghost
              @click="fetchTags"
            >
              <el-icon><RefreshLeft /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <div ref="tableWrapperRef" class="table-wrapper">
        <el-table
          :data="filteredTags"
          row-key="id"
          :loading="tagStore.loading"
          :height="tableHeight"
          stripe
          border
          table-layout="auto"
          class="tag-table"
        >
          <el-table-column prop="name" label="标签名称" min-width="200" align="center" show-overflow-tooltip />

          <el-table-column label="颜色" min-width="200" align="center">
            <template #default="{ row }">
              <div class="tag-color">
                <span class="color-block" :style="{ backgroundColor: row.color || '#f5f5f5' }" />
                <span>{{ row.color || '—' }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="创建时间" min-width="180" align="center">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" min-width="200" align="center">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" link v-permission="'content:tag:update'" @click="handleEditTag(row)">
                  编辑
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  link
                  v-permission="'content:tag:delete'"
                  @click="handleDeleteTag(row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <TagFormDialog
      v-model:visible="formDialogVisible"
      :tag="editingTag"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, RefreshLeft } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { DateUtils } from '@/utils/dateUtils'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useTagStore } from '@/stores'
import TagFormDialog from './components/TagFormDialog.vue'
import type { TagVO } from '@/api/types'

const tagStore = useTagStore()
const { tags } = storeToRefs(tagStore)
const searchForm = reactive({
  name: '',
})

const {
  tableWrapperRef,
  tableHeight,
  updateTableHeight,
} = useContentAdmin({
  minHeight: 360,
  bottomOffset: 32,
})

const formDialogVisible = ref(false)
const editingTag = ref<TagVO | null>(null)

const filteredTags = computed(() => {
  const keyword = searchForm.name?.trim().toLowerCase()
  if (!keyword) {
    return tags.value
  }

  return tags.value.filter(tag => tag.name.toLowerCase().includes(keyword))
})

async function fetchTags(): Promise<void> {
  await tagStore.fetchTags()
}

function handleSearch(): void {
  fetchTags()
}

function handleReset(): void {
  searchForm.name = ''
  fetchTags()
}

function handleAddTag(): void {
  editingTag.value = null
  formDialogVisible.value = true
}

function handleEditTag(tag: TagVO): void {
  editingTag.value = tag
  formDialogVisible.value = true
}

async function handleDeleteTag(tag: TagVO): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除标签 "${tag.name}" 吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })

    const success = await tagStore.deleteTag(tag.id)
    if (!success) {
      throw new Error('删除失败')
    }

    ElMessage.success('标签删除成功')
    fetchTags()
  } catch {
    // ignore cancel and failure details
  }
}

function handleDialogSuccess(): void {
  formDialogVisible.value = false
  fetchTags()
}

function formatDate(value?: string | null): string {
  return value ? DateUtils.formatDate(value) : '—'
}

onMounted(() => {
  fetchTags()
})
</script>

<style scoped>
.tag-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 8px 16px 24px;
}

.search-card {
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
}

.filter-input {
  width: 240px;
}

.search-actions {
  margin-left: auto;
}

.table-card {
  min-height: 0;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-wrapper {
  min-height: 0;
}

.tag-table {
  width: 100%;
}

.tag-table :deep(.el-table__cell) {
  text-align: center;
}

.tag-color {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.color-block {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-base);
}

.table-actions {
  display: flex;
  justify-content: center;
  gap: 4px 8px;
}
</style>
