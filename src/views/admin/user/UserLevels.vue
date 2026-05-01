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
          <el-button type="warning" @click="openRuleDialog">配置规则</el-button>
        </div>
      </template>

      <div ref="tableWrapperRef" class="table-wrapper">
        <el-table
          v-loading="experienceStore.loading"
          :data="experienceStore.logs"
          :height="tableHeight"
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
      </div>

      <div ref="paginationRef" class="pagination">
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

    <el-dialog v-model="adjustDialogVisible" title="调整等级" width="440px" :close-on-click-modal="false">
      <el-form :model="adjustForm" label-width="80px">
        <el-form-item label="用户ID" required>
          <el-input-number
            v-model="adjustForm.userId"
            :min="1"
            placeholder="请输入用户ID"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="调整方式" required>
          <el-radio-group v-model="adjustForm.adjustType">
            <el-radio value="level">调整等级</el-radio>
            <el-radio value="experience">调整经验</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="adjustForm.adjustType === 'level' ? '新等级' : '新经验值'" required>
          <el-input-number
            v-model="adjustForm.newValue"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="原因">
          <el-input
            v-model="adjustForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入调整原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="adjusting" @click="confirmAdjust">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="ruleDialogVisible"
      title="配置经验来源规则"
      width="560px"
      :close-on-click-modal="false"
    >
      <div v-loading="experienceStore.configLoading">
        <el-form label-width="140px">
          <el-divider content-position="left">经验来源配置</el-divider>
          <el-form-item v-for="item in ruleFormList" :key="item.configKey" :label="item.configKey">
            <el-input v-model="item.configValue" placeholder="请输入配置值" style="width: 240px" />
          </el-form-item>
          <el-empty v-if="ruleFormList.length === 0" description="暂无配置项" />
        </el-form>
      </div>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingConfig" @click="saveRules">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useExperienceStore } from '@/stores'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { formatAiDate } from '@/utils'

const experienceStore = useExperienceStore()

const query = reactive({
  userId: undefined as number | undefined,
  sourceType: '' as string,
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const { tableWrapperRef, paginationRef, tableHeight, isCompactTable, paginationLayout } =
  useContentAdmin({
    minHeight: 360,
    bottomOffset: 16,
  })

// Adjust dialog
const adjustDialogVisible = ref(false)
const adjusting = ref(false)
const adjustForm = reactive({
  userId: undefined as number | undefined,
  adjustType: 'level' as 'level' | 'experience',
  newValue: 0,
  reason: '',
})

// Rule dialog
const ruleDialogVisible = ref(false)
const savingConfig = ref(false)
const ruleFormList = ref<{ configKey: string; configValue: string }[]>([])

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

function handleAdjust(): void {
  adjustForm.userId = undefined
  adjustForm.adjustType = 'level'
  adjustForm.newValue = 0
  adjustForm.reason = ''
  adjustDialogVisible.value = true
}

async function confirmAdjust(): Promise<void> {
  if (!adjustForm.userId) {
    ElMessage.warning('请输入用户ID')
    return
  }
  if (adjustForm.newValue < 0) {
    ElMessage.warning('请输入有效的数值')
    return
  }

  adjusting.value = true
  try {
    const success = await experienceStore.adjustUserLevel(adjustForm.userId, {
      adjustType: adjustForm.adjustType,
      newValue: adjustForm.newValue,
      reason: adjustForm.reason || undefined,
    })
    if (success) {
      ElMessage.success('调整成功')
      adjustDialogVisible.value = false
      void fetchLogs()
    } else {
      ElMessage.error('调整失败')
    }
  } catch {
    ElMessage.error('调整失败')
  } finally {
    adjusting.value = false
  }
}

async function openRuleDialog(): Promise<void> {
  ruleDialogVisible.value = true
  try {
    await experienceStore.fetchConfig()
    ruleFormList.value = experienceStore.configs.map((c) => ({ ...c }))
  } catch {
    ElMessage.error('获取配置失败')
  }
}

async function saveRules(): Promise<void> {
  savingConfig.value = true
  try {
    for (const item of ruleFormList.value) {
      const success = await experienceStore.updateConfig({
        configKey: item.configKey,
        configValue: item.configValue,
      })
      if (!success) {
        ElMessage.error(`保存配置 ${item.configKey} 失败`)
        return
      }
    }
    ElMessage.success('规则保存成功')
    ruleDialogVisible.value = false
  } catch {
    ElMessage.error('保存失败')
  } finally {
    savingConfig.value = false
  }
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

.table-card {
  min-height: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}

.table-wrapper {
  min-height: 0;
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
