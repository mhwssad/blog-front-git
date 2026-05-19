<template>
  <div class="interaction-management-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="目标类型" class="filter-item">
          <el-select
            v-model="searchForm.targetType"
            class="filter-control"
            placeholder="请选择"
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
        <el-form-item label="互动类型" class="filter-item">
          <el-select
            v-model="searchForm.actionType"
            class="filter-control"
            placeholder="请选择"
            clearable
          >
            <el-option
              v-for="option in interactionTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <template v-if="searchExpanded">
          <el-form-item label="用户 ID" class="filter-item">
            <el-input-number
              v-model="searchForm.userId"
              :min="0"
              class="filter-control"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="目标 ID" class="filter-item">
            <el-input-number
              v-model="searchForm.targetId"
              :min="0"
              class="filter-control"
              controls-position="right"
            />
          </el-form-item>
        </template>
        <el-form-item class="search-actions">
          <el-button v-permission="'content:interaction:query'" type="primary" @click="handleSearch">
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

    <DataTable
      :data="interactionStore.interactions"
      :loading="interactionStore.loading"
      :total="interactionStore.total"
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :page-sizes="[10, 20, 50, 100]"
      :pagination-layout="paginationLayout"
      title="互动记录"
      :compact="true"
      @page-change="fetchInteractions"
      @size-change="() => { pagination.current = 1; fetchInteractions() }"
    >
      <template #header-extra>
        <el-button v-permission="'content:interaction:query'" @click="fetchInteractions">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </template>

      <el-table-column label="用户" min-width="150" align="center">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar v-if="row.userAvatar" :src="row.userAvatar" :size="24" />
            <span>{{ row.userNickname || `用户 ${row.userId}` }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="目标" min-width="200" align="left" show-overflow-tooltip>
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ formatTargetType(row.targetType) }}</el-tag>
          <span style="margin-left: 6px">{{ row.targetTitle || `ID: ${row.targetId}` }}</span>
        </template>
      </el-table-column>
      <el-table-column label="互动类型" min-width="100" align="center">
        <template #default="{ row }">
          {{ formatInteractionType(row.actionType) }}
        </template>
      </el-table-column>
      <el-table-column label="互动时间" min-width="170" align="center">
        <template #default="{ row }">
          {{ formatContentDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button
              v-permission="'content:interaction:delete'"
              link
              type="danger"
              @click="handleDeleteInteraction(row.id)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </DataTable>

    <InteractionDetailDialog
      v-model:visible="detailVisible"
      :detail="detailRecord"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, ArrowDown } from '@element-plus/icons-vue'
import { useInteractionStore } from '@/stores'
import { useContentAdmin } from '@/composables/useContentAdmin'
import DataTable from '@/components/common/DataTable.vue'
import {
  formatContentDate,
  formatInteractionType,
  formatTargetType,
  TARGET_TYPE_OPTIONS,
  INTERACTION_TYPE_OPTIONS,
} from '@/utils'
import InteractionDetailDialog from './components/InteractionDetailDialog.vue'
import type { InteractionVO } from '@/types/api-types'

const interactionStore = useInteractionStore()
const searchExpanded = ref(false)
const searchForm = reactive({
  userId: undefined as number | undefined,
  targetId: undefined as number | undefined,
  targetType: '' as string | undefined,
  actionType: '' as string | undefined,
})

const pagination = reactive({ current: 1, size: 10 })
const { paginationLayout } = useContentAdmin()
const targetTypeOptions = TARGET_TYPE_OPTIONS
const interactionTypeOptions = INTERACTION_TYPE_OPTIONS

const detailVisible = ref(false)
const detailRecord = ref<InteractionVO | null>(null)

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

function openDetail(row: InteractionVO): void {
  detailRecord.value = row
  detailVisible.value = true
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
    // user cancelled
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

.search-card :deep(.el-form-item) {
  margin-bottom: 0;
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
  width: 180px;
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

.user-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.table-actions {
  display: inline-flex;
  justify-content: center;
  gap: 4px 8px;
}

@media (max-width: 768px) {
  .filter-control {
    width: 160px;
  }
}
</style>
