<template>
  <div class="user-level-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline class="search-form">
        <el-form-item label="用户ID" class="filter-item">
          <el-input
            v-model.number="query.userId"
            placeholder="请输入用户ID"
            clearable
            class="filter-control"
          />
        </el-form-item>
        <el-form-item label="来源类型" class="filter-item">
          <el-select v-model="query.sourceType" placeholder="全部" clearable class="filter-control">
            <el-option label="发文" value="ARTICLE" />
            <el-option label="评论" value="COMMENT" />
            <el-option label="点赞" value="LIKE" />
            <el-option label="登录" value="LOGIN" />
            <el-option label="签到" value="CHECK_IN" />
            <el-option label="系统调整" value="ADMIN_ADJUST" />
          </el-select>
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>经验流水日志</span>
          <el-button type="warning" @click="ruleDialogVisible = true">配置规则</el-button>
        </div>
      </template>

      <el-table
        v-loading="experienceStore.loading"
        :data="experienceStore.logs"
        :size="isCompactTable ? 'small' : 'default'"
        table-layout="auto"
        border
        stripe
      >
        <el-table-column prop="userId" label="用户ID" min-width="80" align="center" />
        <el-table-column prop="sourceTypeLabel" label="来源类型" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="sourceTagType(row.sourceType)" size="small">
              {{ row.sourceTypeLabel || row.sourceType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="experienceChange" label="经验变化" min-width="100" align="center">
          <template #default="{ row }">
            <span :class="row.experienceChange > 0 ? 'exp-positive' : 'exp-negative'">
              {{ row.experienceChange > 0 ? '+' : '' }}{{ row.experienceChange }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="等级变化" min-width="120" align="center">
          <template #default="{ row }">
            <template v-if="row.levelBefore !== row.levelAfter">
              <el-tag size="small" type="info">Lv.{{ row.levelBefore }}</el-tag>
              <span class="level-arrow">-&gt;</span>
              <el-tag size="small" type="success">Lv.{{ row.levelAfter }}</el-tag>
            </template>
            <template v-else>
              <span class="level-same">Lv.{{ row.levelBefore }}</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          label="描述"
          min-width="180"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="时间" min-width="160" align="center">
          <template #default="{ row }">
            {{ formatAiDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="experienceStore.logTotal"
          :page-sizes="[10, 20, 50]"
          :layout="paginationLayout"
          :small="isCompactTable"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <ExperienceRuleDialog v-model:visible="ruleDialogVisible" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useExperienceStore } from '@/stores'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { formatAiDate } from '@/utils'
import ExperienceRuleDialog from './components/ExperienceRuleDialog.vue'

const experienceStore = useExperienceStore()

const query = reactive({
  userId: undefined as number | undefined,
  sourceType: '' as string,
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const { isCompactTable, paginationLayout } = useContentAdmin()

const ruleDialogVisible = ref(false)

function sourceTagType(sourceType: string): 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    ARTICLE: 'success',
    COMMENT: 'info',
    LIKE: 'warning',
    LOGIN: 'info',
    CHECK_IN: 'info',
    ADMIN_ADJUST: 'danger',
  }
  return map[sourceType] ?? 'info'
}

async function fetchLogs(): Promise<void> {
  try {
    await experienceStore.fetchLogs({
      current: pagination.current,
      size: pagination.size,
      userId: query.userId,
      sourceType: query.sourceType || undefined,
    })
  } catch {
    ElMessage.error('获取经验日志失败')
  }
}

function handleSearch(): void {
  pagination.current = 1
  void fetchLogs()
}

function handleReset(): void {
  query.userId = undefined
  query.sourceType = ''
  pagination.current = 1
  pagination.size = 10
  void fetchLogs()
}

function handleSizeChange(size: number): void {
  pagination.size = size
  pagination.current = 1
  void fetchLogs()
}

function handleCurrentChange(current: number): void {
  pagination.current = current
  void fetchLogs()
}

onMounted(() => {
  void fetchLogs()
})
</script>

<style scoped>
.user-level-page {
  padding: 0;
  max-width: 1560px;
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
  width: 200px;
}

.search-actions {
  margin-left: 0;
  margin-right: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.exp-positive {
  color: var(--el-color-success);
  font-weight: 600;
}

.exp-negative {
  color: var(--el-color-danger);
  font-weight: 600;
}

.level-arrow {
  margin: 0 4px;
  color: var(--el-text-color-secondary);
}

.level-same {
  color: var(--el-text-color-regular);
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
