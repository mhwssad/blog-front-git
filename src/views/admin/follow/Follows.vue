<template>
  <div class="follow-page">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关系状态" class="filter-item">
          <el-select
            v-model="searchForm.followStatus"
            clearable
            class="filter-control"
            placeholder="全部"
          >
            <el-option
              v-for="option in FOLLOW_STATUS_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词" class="filter-item">
          <el-input
            v-model="searchForm.keyword"
            class="filter-control"
            clearable
            placeholder="用户名 / 昵称 / 备注"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <template v-if="searchExpanded">
          <el-form-item label="关注发起人" class="filter-item">
            <el-input-number v-model="searchForm.followerId" :min="1" class="filter-control" controls-position="right" />
          </el-form-item>
          <el-form-item label="被关注人" class="filter-item">
            <el-input-number v-model="searchForm.followingId" :min="1" class="filter-control" controls-position="right" />
          </el-form-item>
          <el-form-item label="特别关注" class="filter-item">
            <el-select
              v-model="searchForm.specialFollow"
              clearable
              class="filter-control"
              placeholder="全部"
            >
              <el-option
                v-for="option in BOOLEAN_TEXT_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="来源" class="filter-item">
            <el-input v-model="searchForm.source" class="filter-control" clearable placeholder="如 web / import" />
          </el-form-item>
        </template>
        <el-form-item class="search-actions">
          <el-button v-permission="'content:follow:query'" type="primary" @click="handleSearch">
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

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>关注关系管理</span>
          <div class="card-header__actions">
            <el-button
              v-permission="'content:follow:clean'"
              type="warning"
              size="small"
              @click="cleanDialogVisible = true"
            >
              异常清理
            </el-button>
            <el-button v-permission="'content:follow:query'" size="small" @click="fetchRelations">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="followStore.loading"
        :data="followStore.relations"
        border
        stripe
        table-layout="auto"
      >
        <el-table-column label="关注者" min-width="160" align="center">
          <template #default="{ row }">
            <div>{{ row.followerNickname || row.followerUsername }}</div>
            <div class="sub-text">ID {{ row.followerId }}</div>
          </template>
        </el-table-column>
        <el-table-column label="被关注者" min-width="160" align="center">
          <template #default="{ row }">
            <div>{{ row.followingNickname || row.followingUsername }}</div>
            <div class="sub-text">ID {{ row.followingId }}</div>
          </template>
        </el-table-column>
        <el-table-column label="关系状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="getFollowStatusTagType(row.followStatus)">
              {{ formatFollowStatus(row.followStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="特别关注" min-width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.isSpecialFollow === 1 ? 'warning' : 'info'">
              {{ row.isSpecialFollow === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关注时间" min-width="170" align="center">
          <template #default="{ row }">
            {{ formatCreatedAt(row.followTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
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
          background
          small
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <FollowDetailDialog
      v-model:visible="detailVisible"
      :detail="detailRecord"
    />

    <FollowCleanDialog
      v-model:visible="cleanDialogVisible"
      @update:visible="onCleanDialogClose"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { Refresh, ArrowDown } from '@element-plus/icons-vue'
import { useContentAdmin } from '@/composables/useContentAdmin'
import { useFollowStore } from '@/stores'
import {
  BOOLEAN_TEXT_OPTIONS,
  FOLLOW_STATUS_OPTIONS,
  formatCreatedAt,
  formatFollowStatus,
} from '@/utils'
import FollowDetailDialog from './components/FollowDetailDialog.vue'
import FollowCleanDialog from './components/FollowCleanDialog.vue'
import type { FollowAdminRelationVO } from '@/types/api-types'

const followStore = useFollowStore()
const searchExpanded = ref(false)

const searchForm = reactive({
  followerId: undefined as number | undefined,
  followingId: undefined as number | undefined,
  followStatus: undefined as number | undefined,
  specialFollow: undefined as number | undefined,
  source: '',
  keyword: '',
})

const pagination = reactive({ current: 1, size: 10 })
const { paginationLayout } = useContentAdmin()

const detailVisible = ref(false)
const detailRecord = ref<FollowAdminRelationVO | null>(null)
const cleanDialogVisible = ref(false)

function getFollowStatusTagType(value: number): 'info' | 'success' | 'danger' {
  if (value === 1) return 'success'
  if (value === 2) return 'danger'
  return 'info'
}

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

function openDetail(row: FollowAdminRelationVO): void {
  detailRecord.value = row
  detailVisible.value = true
}

function onCleanDialogClose(visible: boolean): void {
  if (!visible) void fetchRelations()
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

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
}

.card-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub-text {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .filter-control {
    width: 160px;
  }
}
</style>
