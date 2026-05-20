<template>
  <DetailDialog v-model="modelValue" :detail="detail" title="收藏记录详情" width="560px">
    <template #default="{ detail: detail_ }">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="记录 ID">{{ detail_.id }}</el-descriptions-item>
        <el-descriptions-item label="用户 ID">{{ detail_.userId }}</el-descriptions-item>
        <el-descriptions-item label="收藏夹 ID">{{ detail_.folderId }}</el-descriptions-item>
        <el-descriptions-item label="目标类型">
          <el-tag size="small" effect="plain">{{ formatTargetType(detail_.targetType) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="目标 ID">{{ detail_.targetId }}</el-descriptions-item>
        <el-descriptions-item label="收藏时间">{{ formatDate(detail_.createdAt) }}</el-descriptions-item>
        <el-descriptions-item v-if="detail_.targetTitle" label="目标标题" :span="2">
          {{ detail_.targetTitle }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detail_.targetUrl" label="目标地址" :span="2">
          <a :href="detail_.targetUrl" target="_blank" rel="noopener" class="detail-link">
            {{ detail_.targetUrl }}
          </a>
        </el-descriptions-item>
        <el-descriptions-item v-if="detail_.remark" label="备注" :span="2">
          {{ detail_.remark }}
        </el-descriptions-item>
      </el-descriptions>
    </template>

    <template #footer>
      <el-button v-if="detail?.targetUrl" type="primary" @click="handleViewTarget">
        查看目标页面
      </el-button>
      <el-button @click="modelValue = false">关闭</el-button>
    </template>
  </DetailDialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { CollectionVO } from '@/types/api-types'
import { formatTargetType } from '@/utils'
import { DateUtils } from '@/utils/dateUtils'

const props = defineProps<{
  modelValue: boolean
  detail: CollectionVO | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function formatDate(value?: string | null): string {
  if (!value) return '—'
  return DateUtils.formatDate(value)
}

function handleViewTarget(): void {
  if (props.detail?.targetUrl) {
    window.open(props.detail.targetUrl, '_blank', 'noopener')
  }
}
</script>

<style scoped>
.detail-link {
  color: var(--el-color-primary);
  word-break: break-all;
}
</style>
