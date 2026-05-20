<template>
  <DetailDialog v-model="visible" title="标签详情" :detail="detail" width="480px">
    <el-descriptions :column="1" border size="small">
      <el-descriptions-item label="标签ID">{{ detail!.id }}</el-descriptions-item>
      <el-descriptions-item label="标签名称">
        <span style="font-weight: 600">{{ detail!.name }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="颜色">
        <div class="tag-color">
          <span class="color-block" :style="{ backgroundColor: detail!.color || '#f5f5f5' }" />
          <span>{{ detail!.color || '—' }}</span>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ formatDate(detail!.createdAt) }}</el-descriptions-item>
      <el-descriptions-item label="标签展示">
        <span class="tag-preview" :style="tagPreviewStyle">
          {{ detail!.name }}
        </span>
      </el-descriptions-item>
    </el-descriptions>
  </DetailDialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { TagVO } from '@/types/api-types'
import { DateUtils } from '@/utils/dateUtils'

const props = defineProps<{
  visible: boolean
  detail: TagVO | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const tagPreviewStyle = computed(() => ({
  color: props.detail?.color ?? '#606266',
  borderColor: props.detail?.color ?? '#dcdfe6',
}))

function formatDate(value?: string | null): string {
  if (!value) return '—'
  return DateUtils.formatDate(value)
}
</script>

<style scoped>
.tag-color {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.color-block {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light);
}

.tag-preview {
  display: inline-block;
  padding: 4px 14px;
  border: 1px solid;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.4;
  background: var(--color-bg-base);
}
</style>
