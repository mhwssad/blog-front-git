<template>
  <DetailDialog v-model="visible" title="分类详情" :detail="detail" width="600px">
    <el-descriptions :column="2" border size="small">
      <el-descriptions-item label="分类名称" :span="2">
        <span style="font-weight: 600">{{ detail!.name }}</span>
        <el-tag size="small" effect="plain" style="margin-left: 8px">{{ detail!.type }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="编码">{{ detail!.code }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-switch
          :model-value="detail!.status"
          :active-value="1"
          :inactive-value="0"
          active-text="正常"
          inactive-text="停用"
          inline-prompt
          disabled
        />
      </el-descriptions-item>
      <el-descriptions-item label="父分类">{{ detail!.parentId ? `${findCategoryName(detail!.parentId)} (ID: ${detail!.parentId})` : '根分类' }}</el-descriptions-item>
      <el-descriptions-item label="层级">{{ detail!.level ?? '-' }}</el-descriptions-item>
      <el-descriptions-item label="排序值">{{ detail!.sortOrder ?? '-' }}</el-descriptions-item>
      <el-descriptions-item label="图标">
        {{ detail!.icon || '-' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="detail!.ancestors" label="祖先路径" :span="2">
        {{ detail!.ancestors }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ formatDate(detail!.createdAt) }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ formatDate(detail!.updatedAt) }}</el-descriptions-item>
      <el-descriptions-item v-if="detail!.description" label="描述" :span="2">
        {{ detail!.description }}
      </el-descriptions-item>
    </el-descriptions>
  </DetailDialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { CategoryAdminVO } from '@/types/api-types'
import { DateUtils } from '@/utils/dateUtils'

const props = defineProps<{
  visible: boolean
  detail: CategoryAdminVO | null
  categoryTree: CategoryAdminVO[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

function formatDate(value?: string | null): string {
  if (!value) return '—'
  return DateUtils.formatDate(value)
}

function findCategoryName(id: number): string {
  const queue = [...props.categoryTree]
  while (queue.length) {
    const node = queue.shift()
    if (!node) continue
    if (node.id === id) return node.name
    if (node.children?.length) queue.push(...node.children)
  }
  return '—'
}
</script>
