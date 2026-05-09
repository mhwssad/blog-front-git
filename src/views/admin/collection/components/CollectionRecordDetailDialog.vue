<template>
  <el-dialog v-model="visible" title="收藏记录详情" width="560px" align-center destroy-on-close>
    <template v-if="detail">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="记录 ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="用户 ID">{{ detail.userId }}</el-descriptions-item>
        <el-descriptions-item label="收藏夹 ID">{{ detail.folderId }}</el-descriptions-item>
        <el-descriptions-item label="目标类型">
          <el-tag size="small" effect="plain">{{ formatTargetType(detail.targetType) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="目标 ID">{{ detail.targetId }}</el-descriptions-item>
        <el-descriptions-item label="收藏时间">{{ formatDate(detail.createdAt) }}</el-descriptions-item>
        <el-descriptions-item v-if="detail.targetTitle" label="目标标题" :span="2">
          {{ detail.targetTitle }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detail.targetUrl" label="目标地址" :span="2">
          <a :href="detail.targetUrl" target="_blank" rel="noopener" class="detail-link">
            {{ detail.targetUrl }}
          </a>
        </el-descriptions-item>
        <el-descriptions-item v-if="detail.remark" label="备注" :span="2">
          {{ detail.remark }}
        </el-descriptions-item>
      </el-descriptions>
    </template>

    <div v-else style="text-align: center; padding: 32px; color: var(--el-text-color-secondary)">
      暂无数据
    </div>

    <template #footer>
      <el-button v-if="detail?.targetUrl" type="primary" @click="handleViewTarget">
        查看目标页面
      </el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { CollectionVO } from '@/types/api-types'
import { formatTargetType } from '@/utils'
import { DateUtils } from '@/utils/dateUtils'

const props = defineProps<{
  visible: boolean
  detail: CollectionVO | null
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
