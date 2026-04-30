<template>
  <div class="collection-record-list">
    <div class="record-header">
      <span class="record-title">{{ folderName ?? '全部收藏' }}</span>
      <span class="record-total">共 {{ total }} 条</span>
    </div>

    <div v-if="loading" class="record-loading">
      <el-skeleton :rows="5" animated />
    </div>

    <template v-else-if="records.length">
      <div class="record-items">
        <div v-for="record in records" :key="record.id" class="record-item">
          <div class="record-info">
            <router-link
              v-if="record.targetUrl"
              :to="record.targetUrl"
              class="record-link"
            >
              {{ record.targetTitle ?? '未知标题' }}
            </router-link>
            <span v-else class="record-title-text">{{ record.targetTitle ?? '未知标题' }}</span>
            <span class="record-type">
              <el-tag size="small" effect="plain">{{ record.targetType }}</el-tag>
            </span>
          </div>
          <div v-if="record.remark" class="record-remark">{{ record.remark }}</div>
          <div class="record-footer">
            <span class="record-time">{{ record.createdAt }}</span>
            <el-button
              link
              size="small"
              type="danger"
              @click="emit('delete', record.id)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="total > (pageSize ?? 10)" class="record-pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          small
          @current-change="emit('page-change', currentPage)"
        />
      </div>
    </template>

    <el-empty v-else description="暂无收藏记录" :image-size="64" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CollectionVO } from '@/types/api-types'

defineProps<{
  records: CollectionVO[]
  folderName?: string
  total: number
  loading?: boolean
  pageSize?: number
}>()

const emit = defineEmits<{
  delete: [id: number]
  'page-change': [page: number]
}>()

const currentPage = ref(1)
</script>

<style scoped>
.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.record-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.record-total {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

.record-loading {
  padding: 16px 0;
}

.record-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.record-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.record-item:last-child {
  border-bottom: none;
}

.record-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-link {
  font-size: 14px;
  color: var(--el-text-color-primary);
  text-decoration: none;
  transition: color 0.2s;
}

.record-link:hover {
  color: var(--el-color-primary);
}

.record-title-text {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.record-remark {
  margin-top: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.record-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.record-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.record-pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
