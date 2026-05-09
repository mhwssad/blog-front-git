<template>
  <el-dialog
    v-model="dialogVisible"
    title="审计日志详情"
    width="860px"
    class="audit-log-detail-dialog"
    :close-on-click-modal="false"
    align-center
    center
  >
    <el-descriptions :column="2" border size="small" label-width="120px">
      <el-descriptions-item label="操作人">
        {{ log?.operatorUsername || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="操作人ID">
        {{ log?.operatorUserId ?? '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="目标用户">
        {{ log?.targetUsername || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="目标用户ID">
        {{ log?.targetUserId ?? '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="目标对象">
        {{ formatTargetObject(log) }}
      </el-descriptions-item>
      <el-descriptions-item label="操作类型">
        {{ log?.operationTypeDesc || log?.operationType || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="MFA">
        <el-tag :type="getMfaTagType(log?.mfaPassed)" effect="light" size="small">
          {{ formatMfaPassed(log?.mfaPassed) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="请求 IP">
        {{ log?.requestIp || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="User-Agent" :span="2">
        <span class="break-all">{{ log?.userAgent || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="操作前状态" :span="2">
        <pre class="audit-description">{{ log?.beforeState || '-' }}</pre>
      </el-descriptions-item>
      <el-descriptions-item label="操作后状态" :span="2">
        <pre class="audit-description">{{ log?.afterState || '-' }}</pre>
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">
        <pre class="audit-description">{{ log?.remark || '-' }}</pre>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间" :span="2">
        {{ formatCreateTime(log?.createdAt) }}
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { AuditLogVO } from '@/types/api-types'
import { formatCreateTime } from '@/utils'

interface Props {
  visible: boolean
  log: AuditLogVO | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

function formatMfaPassed(value?: number): string {
  if (value === 1) return '已通过'
  if (value === 0) return '未通过'
  return '-'
}

function getMfaTagType(value?: number): 'success' | 'danger' | 'info' {
  if (value === 1) return 'success'
  if (value === 0) return 'danger'
  return 'info'
}

function formatTargetObject(log: AuditLogVO | null): string {
  if (!log) {
    return '-'
  }

  if (log.targetTypeName && log.targetId !== undefined && log.targetId !== null) {
    return `${log.targetTypeName} #${log.targetId}`
  }
  if (log.targetTypeName) {
    return log.targetTypeName
  }
  if (log.targetId !== undefined && log.targetId !== null) {
    return `#${log.targetId}`
  }
  return '-'
}
</script>

<style scoped>
.break-all {
  word-break: break-all;
}

.audit-description {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
