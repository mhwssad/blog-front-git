<template>
  <div class="footprints-page">
    <!-- 顶部标题区 -->
    <div class="page-header">
      <div class="header-left">
        <el-icon :size="22" class="header-icon"><Clock /></el-icon>
        <h1 class="page-title">浏览历史</h1>
      </div>
      <el-popconfirm title="确定清空所有浏览记录？" @confirm="handleClearAll">
        <template #reference>
          <el-button
            size="small"
            type="danger"
            plain
            :disabled="!store.footprints.length"
          >
            清空全部
          </el-button>
        </template>
      </el-popconfirm>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-section">
        <span class="filter-label">类型</span>
        <div class="filter-tabs">
          <button
            v-for="opt in typeOptions"
            :key="opt.value ?? 'all'"
            class="filter-tab"
            :class="{ active: filterType === opt.value }"
            @click="filterType = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="filter-divider" />

      <div class="filter-section">
        <span class="filter-label">时间</span>
        <div class="filter-tabs">
          <button
            v-for="opt in timeOptions"
            :key="opt.value"
            class="filter-tab"
            :class="{ active: timeRange === opt.value }"
            @click="timeRange = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="filter-divider" />

      <el-input
        v-model="keyword"
        placeholder="搜索文章标题"
        clearable
        size="default"
        class="search-input"
        :prefix-icon="Search"
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch" />
        </template>
      </el-input>
    </div>

    <!-- 加载状态 -->
    <div v-if="store.footprintLoading" class="loading-area">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- 内容区域 -->
    <template v-else-if="store.footprints.length">
      <div class="timeline">
        <div
          v-for="(group, date) in groupedFootprints"
          :key="date"
          class="timeline-group"
        >
          <div class="group-header">
            <span class="group-date">{{ formatGroupDate(date) }}</span>
            <span class="group-count">{{ group.length }} 条记录</span>
          </div>

          <div class="group-items">
            <div
              v-for="fp in group"
              :key="fp.id"
              class="footprint-card"
            >
              <div class="card-icon">
                <el-icon :size="20" color="var(--el-color-primary)">
                  <Document />
                </el-icon>
              </div>

              <div class="card-body">
                <div class="card-title-row">
                  <router-link
                    v-if="fp.targetUrl"
                    :to="fp.targetUrl"
                    class="card-title"
                  >
                    {{ fp.targetTitle ?? '未知标题' }}
                  </router-link>
                  <span v-else class="card-title no-link">
                    {{ fp.targetTitle ?? '未知标题' }}
                  </span>
                  <el-tag size="small" effect="plain" round class="card-type">
                    {{ formatTargetType(fp.targetType) }}
                  </el-tag>
                </div>
                <div class="card-meta">
                  <el-icon :size="12"><Clock /></el-icon>
                  <span>{{ formatTime(fp.visitedAt) }}</span>
                </div>
              </div>

              <div class="card-actions">
                <router-link
                  v-if="fp.targetUrl"
                  :to="fp.targetUrl"
                  class="action-link"
                >
                  <el-icon :size="14"><View /></el-icon>
                  查看
                </router-link>
                <el-button
                  link
                  size="small"
                  type="danger"
                  @click="handleDelete(fp.id)"
                >
                  <el-icon :size="14"><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="store.footprintTotal > store.footprintSize" class="pagination-area">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="store.footprintSize"
          :total="store.footprintTotal"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </template>

    <!-- 空状态 -->
    <el-empty v-else description="暂无浏览记录" :image-size="100">
      <template v-if="keyword || filterType || timeRange !== 'all'">
        <el-button type="primary" plain @click="resetFilters">
          清除筛选条件
        </el-button>
      </template>
    </el-empty>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Clock, Search, Delete, View, Document } from '@element-plus/icons-vue'
import { useUserContentStore } from '@/stores'
import { formatTargetType } from '@/utils/contentAdmin'

const store = useUserContentStore()

const filterType = ref<string | undefined>(undefined)
const timeRange = ref('all')
const keyword = ref('')
const currentPage = ref(1)

const typeOptions = [
  { label: '全部', value: undefined as string | undefined },
  { label: '文章', value: 'article' },
]

const timeOptions = [
  { label: '全部时间', value: 'all' },
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '近一周', value: 'week' },
  { label: '近一月', value: 'month' },
]

function getTimeRange(range: string): { start?: string; end?: string } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`

  const end = fmt(now)

  switch (range) {
    case 'today':
      return { start: fmt(today), end }
    case 'yesterday': {
      const y = new Date(today)
      y.setDate(y.getDate() - 1)
      return { start: fmt(y), end: fmt(new Date(today.getTime() - 1)) }
    }
    case 'week': {
      const w = new Date(today)
      w.setDate(w.getDate() - 7)
      return { start: fmt(w), end }
    }
    case 'month': {
      const m = new Date(today)
      m.setMonth(m.getMonth() - 1)
      return { start: fmt(m), end }
    }
    default:
      return {}
  }
}

const groupedFootprints = computed(() => {
  const groups: Record<string, typeof store.footprints> = {}
  for (const fp of store.footprints) {
    const date = fp.visitedAt?.split(' ')[0] ?? '未知日期'
    if (!groups[date]) groups[date] = []
    groups[date].push(fp)
  }
  return groups
})

function formatGroupDate(date: string): string {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const y = new Date(now)
  y.setDate(y.getDate() - 1)
  const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`
  if (date === today) return '今天'
  if (date === yesterday) return '昨天'
  return date
}

function formatTime(visitedAt: string): string {
  const parts = visitedAt.split(' ')
  return parts[1] ?? visitedAt
}

async function loadFootprints(): Promise<void> {
  const { start, end } = getTimeRange(timeRange.value)
  await store.fetchFootprints({
    current: currentPage.value,
    size: store.footprintSize,
    targetType: filterType.value || undefined,
    keyword: keyword.value || undefined,
    visitedAtStart: start,
    visitedAtEnd: end,
  })
}

function handlePageChange(page: number): void {
  currentPage.value = page
  loadFootprints()
}

function handleSearch(): void {
  currentPage.value = 1
  loadFootprints()
}

function resetFilters(): void {
  filterType.value = undefined
  timeRange.value = 'all'
  keyword.value = ''
  currentPage.value = 1
  loadFootprints()
}

async function handleDelete(id: number): Promise<void> {
  const success = await store.deleteFootprint(id)
  if (success) {
    ElMessage.success('已删除')
    await loadFootprints()
  }
}

async function handleClearAll(): Promise<void> {
  const success = await store.clearFootprints()
  if (success) {
    ElMessage.success('已清空所有浏览记录')
  }
}

watch([filterType, timeRange], () => {
  currentPage.value = 1
  loadFootprints()
})

onMounted(loadFootprints)
</script>

<style scoped>
.footprints-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

/* ====== 顶部标题区 ====== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  color: var(--el-text-color-secondary);
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

/* ====== 筛选栏 ====== */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
  font-weight: 500;
}

.filter-tabs {
  display: flex;
  gap: 2px;
}

.filter-tab {
  padding: 4px 12px;
  border: none;
  background: none;
  border-radius: 4px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition:
    background-color 0.15s,
    color 0.15s;
  white-space: nowrap;
}

.filter-tab:hover {
  background: var(--el-fill-color-light);
}

.filter-tab.active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 500;
}

.filter-divider {
  width: 1px;
  height: 24px;
  background: var(--el-border-color-lighter);
  flex-shrink: 0;
}

.search-input {
  width: 220px;
  margin-left: auto;
  flex-shrink: 0;
}

.search-input :deep(.el-input-group__append) {
  padding: 0 12px;
}

/* ====== 加载状态 ====== */
.loading-area {
  padding: 16px 0;
}

/* ====== 时间分组 ====== */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.group-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.group-date {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.group-count {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

/* ====== 足迹卡片 ====== */
.group-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footprint-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
}

.footprint-card:hover {
  box-shadow: var(--el-box-shadow-light);
  border-color: var(--el-border-color);
}

.card-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
  flex-shrink: 0;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-title:hover {
  color: var(--el-color-primary);
}

.card-title.no-link {
  color: var(--el-text-color-regular);
}

.card-type {
  flex-shrink: 0;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.action-link {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 4px;
  transition:
    background-color 0.15s,
    color 0.15s;
}

.action-link:hover {
  background: var(--el-fill-color-light);
  color: var(--el-color-primary);
}

/* ====== 分页 ====== */
.pagination-area {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

/* ====== 响应式 ====== */
@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-divider {
    display: none;
  }

  .search-input {
    width: 100%;
    margin-left: 0;
  }

  .footprint-card {
    padding: 12px 14px;
  }

  .card-actions {
    flex-direction: column;
    gap: 2px;
  }
}
</style>
