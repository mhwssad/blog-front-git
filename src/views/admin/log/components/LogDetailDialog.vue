<template>
  <DetailDialog
    v-model="dialogVisible"
    title="日志详情"
    width="860px"
    :detail="log"
    class="log-detail-dialog"
  >
    <template #default="{ detail: log }">
      <el-descriptions :column="2" border size="small" label-width="110px">
        <el-descriptions-item label="模块">
          {{ log?.module || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="操作类型">
          {{ log?.action || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="操作人">
          {{ log?.username || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          {{ formatLogStatus(log?.status) }}
        </el-descriptions-item>
        <el-descriptions-item label="IP">
          {{ log?.ip || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="地理位置">
          {{ log?.location || [log?.province, log?.city].filter(Boolean).join(' ') || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="请求方法">
          {{ log?.requestMethod || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="执行时间">
          {{ formatExecuteTime(log?.executeTime ?? log?.executionTime ?? 0) }}
        </el-descriptions-item>
        <el-descriptions-item label="请求地址" :span="2">
          <span class="break-all">{{ log?.requestUrl || log?.requestUri || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="浏览器信息" :span="2">
          <span class="break-all">{{ log?.userAgent || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="操作描述" :span="2">
          <pre class="log-description">{{ log?.description || log?.content || log?.action || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ formatCreateTime(log?.createTime) }}
        </el-descriptions-item>
      </el-descriptions>
    </template>
  </DetailDialog>
</template>

/** * 日志详情对话框 * @description
展示系统日志的完整详情，包括模块、操作类型、操作人、IP、请求信息、执行时间等 * @module
admin/log/components/LogDetailDialog * @see api/sys/log.ts */
<script lang="ts" setup>
import { computed } from 'vue'
import type { SysLogAdminVO } from '@/types/api-types'
import { formatCreateTime, formatExecuteTime, formatLogStatus } from '@/utils'

interface Props {
  visible: boolean
  log: SysLogAdminVO | null
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
</script>

<style scoped>
.break-all {
  word-break: break-all;
}

.log-description {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
