<template>
  <DetailDialog v-model="modelValue" :detail="detail" title="收藏夹详情" width="560px">
    <template #default="{ detail: detail_ }">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="收藏夹 ID">{{ detail_.id }}</el-descriptions-item>
        <el-descriptions-item label="用户 ID">{{ detail_.userId }}</el-descriptions-item>
        <el-descriptions-item label="名称" :span="2">
          <span style="font-weight: 600">{{ detail_.folderName }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag size="small" effect="plain">{{ formatTargetType(detail_.folderType) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="收藏数量">{{ detail_.collectionCount }}</el-descriptions-item>
        <el-descriptions-item label="是否公开">
          <el-tag size="small" :type="detail_.isPublic === 1 ? 'success' : 'info'">
            {{ detail_.isPublic === 1 ? '公开' : '私有' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="是否默认">
          <el-tag size="small" :type="detail_.isDefault === 1 ? 'warning' : 'info'">
            {{ detail_.isDefault === 1 ? '默认' : '自定义' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="排序值">{{ detail_.sortOrder }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(detail_.createdAt) }}</el-descriptions-item>
        <el-descriptions-item v-if="detail_.description" label="描述" :span="2">
          {{ detail_.description }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detail_.updatedAt" label="更新时间">
          {{ formatDate(detail_.updatedAt) }}
        </el-descriptions-item>
      </el-descriptions>
    </template>

    <template #footer>
      <el-button type="primary" @click="handleViewRecords">查看收藏记录</el-button>
      <el-button @click="modelValue = false">关闭</el-button>
    </template>
  </DetailDialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { CollectionFolderVO } from '@/types/api-types'
import { formatTargetType } from '@/utils'
import { DateUtils } from '@/utils/dateUtils'

const props = defineProps<{
  modelValue: boolean
  detail: CollectionFolderVO | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'view-records': [folderId: number]
}>()

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function formatDate(value?: string | null): string {
  if (!value) return '—'
  return DateUtils.formatDate(value)
}

function handleViewRecords(): void {
  if (props.detail) {
    modelValue.value = false
    emit('view-records', props.detail.id)
  }
}
</script>
