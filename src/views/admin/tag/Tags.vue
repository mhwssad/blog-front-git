<template>
  <div class="tag-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="标签名称" class="filter-item">
          <el-input
            v-model="searchForm.name"
            class="filter-control"
            placeholder="请输入标签名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button v-permission="'content:tag:query'" type="primary" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="table-header">
          <span>标签列表</span>
          <div class="table-header__actions">
            <el-button
              v-permission="'content:tag:create'"
              type="primary"
              size="small"
              @click="handleAddTag"
            >
              <el-icon><Plus /></el-icon>
              新增标签
            </el-button>
            <el-button v-permission="'content:tag:query'" size="small" @click="fetchTags">
              <el-icon><RefreshLeft /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="pagedTags"
        row-key="id"
        :loading="tagStore.loading"
        stripe
        border
        table-layout="auto"
        class="tag-table"
      >
        <el-table-column
          prop="name"
          label="标签名称"
          min-width="200"
          align="center"
          show-overflow-tooltip
        />
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
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
              <el-button
                size="small"
                link
                type="primary"
                v-permission="'content:tag:update'"
                @click="handleEditTag(row)"
              >
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

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="filteredTags.length"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          small
        />
      </div>
    </el-card>

    <TagFormDialog
      v-model:visible="formDialogVisible"
      :tag="editingTag"
      @success="handleDialogSuccess"
    />

    <TagDetailDialog v-model:visible="detailDialogVisible" :detail="detailTag" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, RefreshLeft } from '@element-plus/icons-vue'
import { DateUtils } from '@/utils/dateUtils'
import { useTagStore } from '@/stores'
import TagFormDialog from './components/TagFormDialog.vue'
import TagDetailDialog from './components/TagDetailDialog.vue'
import type { TagVO } from '@/types/api-types'

const tagStore = useTagStore()
const searchForm = reactive({ name: '' })
const formDialogVisible = ref(false)
const editingTag = ref<TagVO | null>(null)
const detailDialogVisible = ref(false)
const detailTag = ref<TagVO | null>(null)

const pagination = reactive({
  page: 1,
  size: 10,
})

const filteredTags = computed(() => {
  const keyword = searchForm.name?.trim().toLowerCase()
  if (!keyword) return tagStore.tags
  return tagStore.tags.filter(tag => tag.name.toLowerCase().includes(keyword))
})

const pagedTags = computed(() => {
  const start = (pagination.page - 1) * pagination.size
  return filteredTags.value.slice(start, start + pagination.size)
})

async function fetchTags(): Promise<void> {
  await tagStore.fetchTags()
}

function handleSearch(): void {
  pagination.page = 1
  fetchTags()
}

function handleReset(): void {
  searchForm.name = ''
  pagination.page = 1
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
    // ignore cancel
  }
}

function handleDialogSuccess(): void {
  formDialogVisible.value = false
  fetchTags()
}

function handleDetail(tag: TagVO): void {
  detailTag.value = tag
  detailDialogVisible.value = true
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

.filter-item {
  margin-bottom: 0;
}

.filter-control {
  width: 200px;
}

.expand-icon {
  transition: transform 0.2s;
}

.expand-icon.is-expanded {
  transform: rotate(180deg);
}

.search-actions {
  margin-left: auto;
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

.tag-table {
  width: 100%;
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

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
