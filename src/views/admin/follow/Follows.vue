<template>
  <div class="follow-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关注发起人">
          <el-input-number v-model="searchForm.followerId" :min="1" class="filter-control" />
        </el-form-item>
        <el-form-item label="被关注人">
          <el-input-number v-model="searchForm.followingId" :min="1" class="filter-control" />
        </el-form-item>
        <el-form-item label="关系状态">
          <el-select v-model="searchForm.followStatus" clearable class="filter-control" placeholder="全部">
            <el-option
              v-for="option in FOLLOW_STATUS_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="特别关注">
          <el-select v-model="searchForm.specialFollow" clearable class="filter-control" placeholder="全部">
            <el-option
              v-for="option in BOOLEAN_TEXT_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="来源">
          <el-input v-model="searchForm.source" class="filter-control" clearable placeholder="如 web / import" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" class="filter-control" clearable placeholder="用户名 / 昵称 / 备注" />
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button v-permission="'content:follow:query'" type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button v-permission="'content:follow:clean'" type="warning" @click="cleanDialogVisible = true">
            异常清理
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>关注关系管理</span>
          <el-button v-permission="'content:follow:query'" link type="primary" @click="fetchRelations">
            刷新
          </el-button>
        </div>
      </template>

        <el-table
          v-loading="followStore.loading"
          :data="followStore.relations"
          :size="isCompactTable ? 'small' : 'default'"
          border
          stripe
          table-layout="auto"
        >
          <el-table-column prop="relationId" label="关系 ID" min-width="96" align="center" />
          <el-table-column label="发起方" min-width="180" align="center">
            <template #default="{ row }">
              <div>{{ row.followerNickname || row.followerUsername }}</div>
              <div class="sub-text">#{{ row.followerId }} / {{ row.followerUsername }}</div>
            </template>
          </el-table-column>
          <el-table-column label="发起方状态" min-width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getUserStatusTagType(row.followerStatus, row.followerDeletedFlag)">
                {{ formatUserState(row.followerStatus, row.followerDeletedFlag) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="目标方" min-width="180" align="center">
            <template #default="{ row }">
              <div>{{ row.followingNickname || row.followingUsername }}</div>
              <div class="sub-text">#{{ row.followingId }} / {{ row.followingUsername }}</div>
            </template>
          </el-table-column>
          <el-table-column label="目标方状态" min-width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getUserStatusTagType(row.followingStatus, row.followingDeletedFlag)">
                {{ formatUserState(row.followingStatus, row.followingDeletedFlag) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="关系状态" min-width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="getFollowStatusTagType(row.followStatus)">
                {{ formatFollowStatus(row.followStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="特别关注" min-width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.isSpecialFollow === 1 ? 'warning' : 'info'">
                {{ formatBooleanText(row.isSpecialFollow) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="source" label="来源" min-width="120" align="center">
            <template #default="{ row }">
              {{ formatOptionalText(row.source) }}
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="180" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatOptionalText(row.remark) }}
            </template>
          </el-table-column>
          <el-table-column label="关注时间" min-width="168" align="center">
            <template #default="{ row }">
              {{ formatCreatedAt(row.followTime) }}
            </template>
          </el-table-column>
          <el-table-column label="取关时间" min-width="168" align="center">
            <template #default="{ row }">
              {{ formatCreatedAt(row.unfollowTime) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" min-width="168" align="center">
            <template #default="{ row }">
              {{ formatCreatedAt(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="followStore.total"
          :page-sizes="[10, 20, 50, 100]"
          :layout="paginationLayout"
          :small="isCompactTable"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="cleanDialogVisible" title="异常关注清理" width="420px">
      <el-alert
        title="清理会直接移除异常关系，用于 Mock 联调演示和后台治理操作。"
        type="warning"
        show-icon
        :closable="false"
      />
      <el-checkbox v-model="cleanForm.cleanInactive" class="clean-option">清理已取关或异常关系</el-checkbox>
      <el-checkbox v-model="cleanForm.cleanDeletedUsers" class="clean-option">清理已删除用户关系</el-checkbox>
      <el-checkbox v-model="cleanForm.cleanDisabledUsers" class="clean-option">清理已禁用用户关系</el-checkbox>

      <template #footer>
        <el-button @click="cleanDialogVisible = false">取消</el-button>
        <el-button
          v-permission="'content:follow:clean'"
          type="primary"
          :loading="followStore.cleaning"
          @click="handleClean"
        >
          确认清理
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useFollowStore } from '@/stores'
import {
  BOOLEAN_TEXT_OPTIONS,
  FOLLOW_STATUS_OPTIONS,
  formatBooleanText,
  formatCreatedAt,
  formatFollowStatus,
  formatOptionalText,
} from '@/utils'

const followStore = useFollowStore()

const searchForm = reactive({
  followerId: undefined as number | undefined,
  followingId: undefined as number | undefined,
  followStatus: undefined as number | undefined,
  specialFollow: undefined as number | undefined,
  source: '',
  keyword: '',
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const cleanDialogVisible = ref(false)
const cleanForm = reactive({
  cleanInactive: true,
  cleanDeletedUsers: true,
  cleanDisabledUsers: false,
})

const {
  paginationLayout,
  isCompactTable,
} = useContentAdmin()

function buildQueryParams() {
  return {
    current: pagination.current,
    size: pagination.size,
    followerId: searchForm.followerId,
    followingId: searchForm.followingId,
    followStatus: searchForm.followStatus,
    specialFollow: searchForm.specialFollow,
    source: searchForm.source.trim() || undefined,
    keyword: searchForm.keyword.trim() || undefined,
  }
}

async function fetchRelations(): Promise<void> {
  await followStore.fetchFollows(buildQueryParams())
}

function handleSearch(): void {
  pagination.current = 1
  void fetchRelations()
}

function handleReset(): void {
  searchForm.followerId = undefined
  searchForm.followingId = undefined
  searchForm.followStatus = undefined
  searchForm.specialFollow = undefined
  searchForm.source = ''
  searchForm.keyword = ''
  pagination.current = 1
  void fetchRelations()
}

function handleCurrentChange(current: number): void {
  pagination.current = current
  void fetchRelations()
}

function handleSizeChange(size: number): void {
  pagination.size = size
  pagination.current = 1
  void fetchRelations()
}

async function handleClean(): Promise<void> {
  const cleanedCount = await followStore.cleanFollows({ ...cleanForm })
  cleanDialogVisible.value = false

  if (cleanedCount > 0) {
    ElMessage.success(`已清理 ${cleanedCount} 条异常关系`)
  } else {
    ElMessage.info('没有匹配到可清理的异常关系')
  }

  void fetchRelations()
}

function formatUserState(status?: number, deletedFlag?: number): string {
  if (deletedFlag === 1) {
    return '已删除'
  }

  return status === 0 ? '已禁用' : '正常'
}

function getUserStatusTagType(status?: number, deletedFlag?: number): 'danger' | 'warning' | 'success' {
  if (deletedFlag === 1) {
    return 'danger'
  }

  return status === 0 ? 'warning' : 'success'
}

function getFollowStatusTagType(value: number): 'info' | 'success' | 'danger' {
  if (value === 1) {
    return 'success'
  }

  if (value === 2) {
    return 'danger'
  }

  return 'info'
}

onMounted(() => {
  void fetchRelations()
})
</script>

<style scoped>
.follow-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 0;
}

.search-card :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

.filter-control {
  width: 220px;
}

.search-actions {
  margin-right: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 500;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.sub-text {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.clean-option {
  display: flex;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .filter-control {
    width: 100%;
  }

  .search-card :deep(.el-form-item) {
    width: 100%;
    margin-right: 0;
  }

  .search-actions :deep(.el-form-item__content) {
    width: 100%;
    justify-content: center;
  }
}
</style>
