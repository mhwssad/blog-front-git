<template>
  <el-dialog v-model="visible" title="收藏夹详情" width="560px" align-center destroy-on-close>
    <template v-if="detail">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="收藏夹 ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="用户 ID">{{ detail.userId }}</el-descriptions-item>
        <el-descriptions-item label="名称" :span="2">
          <span style="font-weight: 600">{{ detail.folderName }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag size="small" effect="plain">{{ formatTargetType(detail.folderType) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="收藏数量">{{ detail.collectionCount }}</el-descriptions-item>
        <el-descriptions-item label="是否公开">
          <el-tag size="small" :type="detail.isPublic === 1 ? 'success' : 'info'">
            {{ detail.isPublic === 1 ? '公开' : '私有' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="是否默认">
          <el-tag size="small" :type="detail.isDefault === 1 ? 'warning' : 'info'">
            {{ detail.isDefault === 1 ? '默认' : '自定义' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="排序值">{{ detail.sortOrder }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(detail.createdAt) }}</el-descriptions-item>
        <el-descriptions-item v-if="detail.description" label="描述" :span="2">
          {{ detail.description }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detail.updatedAt" label="更新时间">
          {{ formatDate(detail.updatedAt) }}
        </el-descriptions-item>
      </el-descriptions>
    </template>

    <div v-else style="text-align: center; padding: 32px; color: var(--el-text-color-secondary)">
      暂无数据
    </div>

    <template #footer>
      <el-button type="primary" @click="handleViewRecords">查看收藏记录</el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { CollectionFolderVO } from '@/types/api-types'
import { formatTargetType } from '@/utils'
import { DateUtils } from '@/utils/dateUtils'

const props = defineProps<{
  visible: boolean
  detail: CollectionFolderVO | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'view-records': [folderId: number]
}>()

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

function formatDate(value?: string | null): string {
  if (!value) return '—'
  return DateUtils.formatDate(value)
}

function handleViewRecords(): void {
  if (props.detail) {
    visible.value = false
    emit('view-records', props.detail.id)
  }
}
</script>
