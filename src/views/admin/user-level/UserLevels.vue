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
            <el-option
              v-for="opt in SOURCE_TYPE_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button
            v-permission="'sys:experience:config'"
            plain
            @click="ruleDialogVisible = true"
          >
            配置规则
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row v-if="experienceStore.userSummary" :gutter="12" class="summary-row">
      <el-col :lg="4" :md="8" :span="12">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-label">用户</div>
          <div class="summary-value">
            {{ experienceStore.userSummary.nickname || experienceStore.userSummary.username }}
            <span class="summary-sub">ID: {{ experienceStore.userSummary.userId }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="4" :md="8" :span="12">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-label">当前等级</div>
          <div class="summary-value">Lv.{{ experienceStore.userSummary.level }}</div>
        </el-card>
      </el-col>
      <el-col :lg="4" :md="8" :span="12">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-label">经验值</div>
          <div class="summary-value">{{ experienceStore.userSummary.experiencePoints }}</div>
        </el-card>
      </el-col>
      <el-col :lg="4" :md="8" :span="12">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-label">今日经验</div>
          <div class="summary-value">{{ experienceStore.userSummary.todayXp ?? '-' }}</div>
        </el-card>
      </el-col>
      <el-col :lg="4" :md="8" :span="12">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-label">发文经验</div>
          <div class="summary-value">{{ experienceStore.userSummary.articlePublishXp ?? '-' }}</div>
        </el-card>
      </el-col>
      <el-col :lg="4" :md="8" :span="12">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-label">评论经验</div>
          <div class="summary-value">{{ experienceStore.userSummary.commentCreateXp ?? '-' }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>经验流水日志</span>
          <span class="card-header__meta">{{ experienceStore.logTotal }} 条</span>
        </div>
      </template>

      <el-table
        v-loading="experienceStore.loading"
        :data="experienceStore.logs"
        :size="isCompactTable ? 'small' : 'default'"
        table-layout="auto"
        class="log-table"
        border
        stripe
      >
        <el-table-column prop="userId" label="用户ID" min-width="80" align="center" />
        <el-table-column label="来源类型" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="sourceTagType(row.sourceType)" size="small">
              {{ row.sourceTypeLabel || row.sourceType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="经验变化" min-width="100" align="center">
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
import { onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useExperienceStore } from '@/stores'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { formatAiDate } from '@/utils'
import ExperienceRuleDialog from './components/ExperienceRuleDialog.vue'

const SOURCE_TYPE_OPTIONS = [
  { label: '发文', value: 'ARTICLE' },
  { label: '评论', value: 'COMMENT' },
  { label: '点赞', value: 'LIKE' },
  { label: '登录', value: 'LOGIN' },
  { label: '签到', value: 'CHECK_IN' },
  { label: '系统调整', value: 'ADMIN_ADJUST' },
]

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

async function fetchSummary(): Promise<void> {
  if (!query.userId) {
    return
  }
  try {
    await experienceStore.fetchUserSummary(query.userId)
  } catch {
    // ignore
  }
}

function handleSearch(): void {
  pagination.current = 1
  void fetchLogs()
  void fetchSummary()
}

function handleReset(): void {
  query.userId = undefined
  query.sourceType = ''
  pagination.current = 1
  pagination.size = 10
  experienceStore.userSummary = null
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

watch(
  () => query.userId,
  (val) => {
    if (val) {
      void fetchSummary()
    } else {
      experienceStore.userSummary = null
    }
  },
)

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

.summary-row {
  margin-bottom: 16px;
}

.summary-card {
  border: none;
}

.summary-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.summary-value {
  margin-top: 4px;
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.summary-sub {
  margin-left: 6px;
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
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
