<template>
  <div class="footprints-page">
    <div class="page-header">
      <h1 class="page-title">我的足迹</h1>
      <div class="header-actions">
        <el-select
          v-model="filterType"
          placeholder="类型筛选"
          clearable
          size="small"
          style="width: 140px"
        >
          <el-option label="文章" value="article" />
          <el-option label="其他" value="other" />
        </el-select>
        <el-popconfirm title="确定清空所有足迹？" @confirm="handleClearAll">
          <template #reference>
            <el-button size="small" type="danger" plain :disabled="!store.footprints.length">
              清空全部
            </el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <div v-if="store.footprintLoading" class="loading-area">
      <el-skeleton :rows="6" animated />
    </div>

    <template v-else-if="store.footprints.length">
      <div class="timeline">
        <div v-for="(group, date) in groupedFootprints" :key="date" class="timeline-group">
          <div class="timeline-date">{{ date }}</div>
          <div class="timeline-items">
            <div v-for="fp in group" :key="fp.id" class="timeline-item">
              <div class="item-main">
                <router-link v-if="fp.targetUrl" :to="fp.targetUrl" class="item-link">
                  {{ fp.targetTitle ?? '未知' }}
                </router-link>
                <span v-else class="item-title">{{ fp.targetTitle ?? '未知' }}</span>
                <el-tag size="small" effect="plain" class="item-type">{{ fp.targetType }}</el-tag>
              </div>
              <div class="item-meta">
                <span class="item-time">{{ fp.visitedAt }}</span>
                <el-button link size="small" type="danger" @click="handleDelete(fp.id)">
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

    <el-empty v-else description="暂无浏览足迹" />
  </div>
</template>

<script lang="ts" setup>
/**
 * 我的足迹页面
 * @description 展示用户的浏览历史，按日期分组，支持筛选和清空
 * @module front/footprint/FootprintsView
 * @see ../../api/content.ts
 */
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserContentStore } from '@/stores'

const store = useUserContentStore()

// 类型筛选（article/other）
const filterType = ref<string | undefined>(undefined)
const currentPage = ref(1)

// 按日期分组的足迹数据
const groupedFootprints = computed(() => {
  const groups: Record<string, typeof store.footprints> = {}
  for (const fp of store.footprints) {
    const date = fp.visitedAt?.split(' ')[0] ?? '未知日期'
    if (!groups[date]) groups[date] = []
    groups[date].push(fp)
  }
  return groups
})

async function loadFootprints(): Promise<void> {
  await store.fetchFootprints({
    current: currentPage.value,
    size: store.footprintSize,
    targetType: filterType.value || undefined,
  })
}

function handlePageChange(page: number): void {
  currentPage.value = page
  loadFootprints()
}

watch(filterType, () => {
  currentPage.value = 1
  loadFootprints()
})

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
    ElMessage.success('已清空所有足迹')
  }
}

onMounted(loadFootprints)
</script>

<style scoped>
.footprints-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-area {
  padding: 16px 0;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timeline-date {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.timeline-items {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-left: 2px solid var(--el-border-color-lighter);
  margin-left: 4px;
}

.timeline-item:hover {
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.item-main {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.item-link {
  font-size: 14px;
  color: var(--el-text-color-primary);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-link:hover {
  color: var(--el-color-primary);
}

.item-title {
  font-size: 14px;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-type {
  flex-shrink: 0;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.item-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.pagination-area {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
