<template>
  <div class="interaction-management-page">
    <el-card class="search-card" shadow="never">
      <div class="card-header">
        <span>互动管理</span>
      </div>
      <el-form
        :model="searchForm"
        label-width="80px"
        label-position="top"
        class="search-form"
      >
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="用户ID">
              <el-input-number v-model="searchForm.userId" :min="0" size="small" :precision="0" class="full-width" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="目标ID">
              <el-input-number v-model="searchForm.targetId" :min="0" size="small" :precision="0" class="full-width" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="目标类型">
              <el-select v-model="searchForm.targetType" placeholder="请选择" size="small" class="full-width" clearable>
                <el-option
                  v-for="option in targetTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="互动类型">
              <el-select v-model="searchForm.actionType" placeholder="请选择" size="small" class="full-width" clearable>
                <el-option
                  v-for="option in interactionTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="form-actions">
          <el-button v-permission="'content:interaction:query'" type="primary" size="small" @click="handleSearch">
            查询
          </el-button>
          <el-button size="small" @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>互动记录</span>
          <el-button
            v-permission="'content:interaction:query'"
            type="text"
            size="small"
            @click="() => fetchInteractions()"
          >
            刷新
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="interactionStore.loading"
        :data="interactionStore.interactions"
        stripe
        border
        table-layout="auto"
        size="small"
        class="behaviors-table"
      >
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column
            prop="userId"
            label="用户ID"
            width="120"
            align="center"
          />
          <el-table-column
            prop="targetId"
            label="目标ID"
            width="120"
            align="center"
          />
          <el-table-column
            prop="targetType"
            label="目标类型"
            min-width="140"
            align="center"
          >
            <template #default="{ row }">
              {{ formatTargetType(row.targetType) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="actionType"
            label="互动类型"
            min-width="140"
            align="center"
          >
            <template #default="{ row }">
              {{ formatInteractionType(row.actionType) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="createdAt"
            label="创建时间"
            min-width="180"
            align="center"
          >
            <template #default="{ row }">
              {{ formatContentDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            min-width="140"
            align="center"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                v-permission="'content:interaction:delete'"
                type="danger"
                size="small"
                link
                @click="handleDeleteInteraction(row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="interactionStore.total"
          :page-sizes="[10, 20, 50, 100]"
          :layout="paginationLayout"
          :small="isCompactTable"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useInteractionStore } from '@/stores'
import { useContentAdmin } from '@/composables/useContentAdmin'
import {
  formatContentDate,
  formatInteractionType,
  formatTargetType,
  TARGET_TYPE_OPTIONS,
  INTERACTION_TYPE_OPTIONS,
} from '@/utils'

const interactionStore = useInteractionStore()
const searchForm = reactive({
  userId: undefined as number | undefined,
  targetId: undefined as number | undefined,
  targetType: '' as string | undefined,
  actionType: '' as string | undefined,
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const { paginationLayout, isCompactTable } = useContentAdmin()

const targetTypeOptions = TARGET_TYPE_OPTIONS
const interactionTypeOptions = INTERACTION_TYPE_OPTIONS

async function fetchInteractions(): Promise<void> {
  await interactionStore.fetchInteractions({
    current: pagination.current,
    size: pagination.size,
    userId: searchForm.userId,
    targetId: searchForm.targetId,
    targetType: searchForm.targetType,
    actionType: searchForm.actionType,
  })
}

function handleSearch(): void {
  pagination.current = 1
  void fetchInteractions()
}

function handleReset(): void {
  searchForm.userId = undefined
  searchForm.targetId = undefined
  searchForm.targetType = ''
  searchForm.actionType = ''
  pagination.current = 1
  void fetchInteractions()
}

function handleSizeChange(size: number): void {
  pagination.size = size
  pagination.current = 1
  void fetchInteractions()
}

function handleCurrentChange(current: number): void {
  pagination.current = current
  void fetchInteractions()
}

async function handleDeleteInteraction(id: number): Promise<void> {
  try {
    await ElMessageBox.confirm('确定要删除该互动记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const success = await interactionStore.deleteInteraction(id)
    if (success) {
      ElMessage.success('删除成功')
      void fetchInteractions()
    } else {
      ElMessage.error('删除失败')
    }
  } catch {
    // 取消或失败
  }
}

onMounted(() => {
  void fetchInteractions()
})
</script>

<style scoped>
.interaction-management-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1440px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  gap: 12px;
}

.search-form {
  margin-top: 16px;
}

.search-form :deep(.el-form-item__content) {
  width: 100%;
}

.full-width {
  width: 100%;
}

.form-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.behaviors-table {
  width: 100%;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
