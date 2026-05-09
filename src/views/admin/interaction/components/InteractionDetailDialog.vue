<template>
  <el-dialog v-model="visible" title="互动详情" width="520px" align-center destroy-on-close>
    <template v-if="detail">
      <div class="detail-user">
        <el-avatar v-if="detail.userAvatar" :src="detail.userAvatar" :size="36" />
        <div class="detail-user__info">
          <span class="detail-user__name">{{ detail.userNickname || '匿名用户' }}</span>
          <span class="detail-user__meta">用户 ID: {{ detail.userId }}</span>
        </div>
      </div>

      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="互动类型">
          <el-tag size="small" type="primary">{{ formatInteractionType(detail.actionType) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="互动时间">{{ formatDate(detail.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="目标类型">
          <el-tag size="small" effect="plain">{{ formatTargetType(detail.targetType) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="目标 ID">{{ detail.targetId }}</el-descriptions-item>
        <el-descriptions-item v-if="detail.targetTitle" label="目标标题" :span="2">
          {{ detail.targetTitle }}
        </el-descriptions-item>
      </el-descriptions>
    </template>

    <div v-else style="text-align: center; padding: 32px; color: var(--el-text-color-secondary)">
      暂无数据
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { InteractionVO } from '@/types/api-types'
import { formatTargetType, formatInteractionType } from '@/utils'
import { DateUtils } from '@/utils/dateUtils'

const props = defineProps<{
  visible: boolean
  detail: InteractionVO | null
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
</script>

<style scoped>
.detail-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.detail-user__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-user__name {
  font-weight: 600;
  font-size: 15px;
}

.detail-user__meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
