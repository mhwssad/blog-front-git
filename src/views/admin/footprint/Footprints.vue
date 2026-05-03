<template>
  <div class="footprint-management-page">
    <el-card class="search-card" shadow="never">
      <div class="card-header">
        <span>足迹管理</span>
      </div>
      <el-form
        :model="searchForm"
        label-width="80px"
        label-position="top"
        class="search-form"
      >
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="用户 ID">
              <el-input-number
                v-model="searchForm.userId"
                :min="1"
                :precision="0"
                size="small"
                class="full-width"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="目标 ID">
              <el-input-number
                v-model="searchForm.targetId"
                :min="1"
                :precision="0"
                size="small"
                class="full-width"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="目标类型">
              <el-select
                v-model="searchForm.targetType"
                placeholder="请选择"
                size="small"
                class="full-width"
                clearable
              >
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
            <el-form-item label="开始访问时间">
              <el-date-picker
                v-model="searchForm.visitedAtStart"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择"
                size="small"
                class="full-width"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="结束访问时间">
              <el-date-picker
                v-model="searchForm.visitedAtEnd"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择"
                size="small"
                class="full-width"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="form-actions">
          <el-button v-permission="'content:footprint:query'" type="primary" size="small" @click="handleSearch">
            查询
          </el-button>
          <el-button size="small" @click="handleReset">重置</el-button>
          <el-button
            v-permission="'content:footprint:delete'"
            type="danger"
            size="small"
            :loading="footprintStore.clearing"
            @click="handleClear"
          >
            条件清空
          </el-button>
        </div>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>足迹记录</span>
          <el-button
            v-permission="'content:footprint:query'"
            type="primary"
            link
            size="small"
            @click="fetchFootprints"
          >
            刷新
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="footprintStore.loading"
        :data="footprintStore.footprints"
        :size="isCompactTable ? 'small' : 'default'"
        stripe
        border
        table-layout="auto"
      >
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="userId" label="用户 ID" width="100" align="center" />
          <el-table-column prop="targetId" label="目标 ID" width="100" align="center" />
          <el-table-column label="目标类型" min-width="110" align="center">
            <template #default="{ row }">
              {{ formatTargetType(row.targetType) }}
            </template>
          </el-table-column>
          <el-table-column prop="targetTitle" label="目标标题" min-width="220" show-overflow-tooltip />
          <el-table-column prop="targetUrl" label="目标链接" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatOptionalText(row.targetUrl) }}
            </template>
          </el-table-column>
          <el-table-column prop="ipAddress" label="IP 地址" min-width="140" align="center">
            <template #default="{ row }">
              {{ formatOptionalText(row.ipAddress) }}
            </template>
          </el-table-column>
          <el-table-column prop="userAgent" label="User Agent" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatOptionalText(row.userAgent) }}
            </template>
          </el-table-column>
          <el-table-column label="访问时间" min-width="180" align="center">
            <template #default="{ row }">
              {{ formatVisitedAt(row.visitedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                v-permission="'content:footprint:delete'"
                type="danger"
                link
                size="small"
                @click="handleDelete(row.id)"
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
          :total="footprintStore.total"
          :page-sizes="[10, 20, 50, 100]"
          :layout="paginationLayout"
          :small="isCompactTable"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FootprintQueryRequest } from '@/types/api-types'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useFootprintStore } from '@/stores'
import { TARGET_TYPE_OPTIONS, formatOptionalText, formatTargetType, formatVisitedAt } from '@/utils'

const footprintStore = useFootprintStore()

const searchForm = reactive({
  userId: undefined as number | undefined,
  targetId: undefined as number | undefined,
  targetType: '' as string | undefined,
  visitedAtStart: '' as string | undefined,
  visitedAtEnd: '' as string | undefined,
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const {
  paginationLayout,
  isCompactTable,
} = useContentAdmin()

const targetTypeOptions = TARGET_TYPE_OPTIONS

function buildQueryParams(): FootprintQueryRequest {
  return {
    current: pagination.current,
    size: pagination.size,
    userId: searchForm.userId,
    targetId: searchForm.targetId,
    targetType: searchForm.targetType || undefined,
    visitedAtStart: searchForm.visitedAtStart || undefined,
    visitedAtEnd: searchForm.visitedAtEnd || undefined,
  }
}

async function fetchFootprints(): Promise<void> {
  await footprintStore.fetchFootprints(buildQueryParams())
}

function handleSearch(): void {
  pagination.current = 1
  void fetchFootprints()
}

function handleReset(): void {
  searchForm.userId = undefined
  searchForm.targetId = undefined
  searchForm.targetType = ''
  searchForm.visitedAtStart = ''
  searchForm.visitedAtEnd = ''
  pagination.current = 1
  void fetchFootprints()
}

function handleCurrentChange(current: number): void {
  pagination.current = current
  void fetchFootprints()
}

function handleSizeChange(size: number): void {
  pagination.size = size
  pagination.current = 1
  void fetchFootprints()
}

async function handleDelete(id: number): Promise<void> {
  try {
    await ElMessageBox.confirm('确定要删除该足迹记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const success = await footprintStore.deleteFootprint(id)

    if (success) {
      ElMessage.success('删除成功')
      void fetchFootprints()
      return
    }

    ElMessage.error('删除失败')
  } catch {
    // 用户取消
  }
}

async function handleClear(): Promise<void> {
  try {
    await ElMessageBox.confirm('确认按当前筛选条件清空足迹记录吗？未设置条件时将清空全部足迹。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const success = await footprintStore.clearFootprints(buildQueryParams())

    if (success) {
      ElMessage.success('清空成功')
      pagination.current = 1
      void fetchFootprints()
      return
    }

    ElMessage.error('清空失败')
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  void fetchFootprints()
})
</script>

<style scoped>
.footprint-management-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1440px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 500;
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

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
