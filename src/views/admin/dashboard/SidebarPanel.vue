<template>
  <el-row v-if="focusItems.length || notices.length" :gutter="12" class="stretch-row">
    <el-col v-if="focusItems.length" :lg="12" :span="24" class="stretch-col">
      <el-card shadow="never" class="panel-card">
        <template #header>
          <div class="panel-header">
            <span>异常关注</span>
          </div>
        </template>

        <div class="focus-list">
          <div v-for="item in focusItems" :key="item.title" class="focus-item">
            <div>
              <div class="focus-title">{{ item.title }}</div>
              <div class="focus-desc">{{ item.description }}</div>
            </div>
            <el-tag :type="item.total > 0 ? 'warning' : 'success'" size="small">
              {{ item.total }}
            </el-tag>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col v-if="notices.length" :lg="focusItems.length ? 12 : 24" :span="24" class="stretch-col">
      <NoticeList :notices="notices" />
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import type { FocusItem, NoticeSummary } from '@/types/ui'
import NoticeList from './NoticeList.vue'

defineProps<{
  focusItems: FocusItem[]
  notices: NoticeSummary[]
}>()
</script>

<style scoped>
.stretch-row {
  display: flex;
}

.stretch-row .stretch-col {
  display: flex;
}

.stretch-row .stretch-col > :deep(.el-card) {
  flex: 1;
}

.panel-card {
  min-height: 0;
}

.panel-header {
  font-weight: 600;
}

.focus-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.focus-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--el-fill-color-light);
}

.focus-title {
  font-size: 13px;
  font-weight: 600;
}

.focus-desc {
  margin-top: 2px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
</style>
