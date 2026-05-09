<template>
  <el-dialog
    v-model="dialogVisible"
    title="通知详情"
    width="720px"
    class="notice-detail-dialog"
    :close-on-click-modal="false"
    align-center
    center
  >
    <el-descriptions :column="1" border size="small" label-width="110px">
      <el-descriptions-item label="通知标题">
        {{ notice?.title || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="通知类型">
        {{ formatNoticeType(notice?.type) }}
      </el-descriptions-item>
      <el-descriptions-item label="通知状态">
        {{ formatNoticeStatus(notice?.status) }}
      </el-descriptions-item>
      <el-descriptions-item label="发布时间">
        {{ formatSystemDate(notice?.publishTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ formatCreateTime(notice?.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="通知内容">
        <pre class="notice-content">{{ notice?.content || '-' }}</pre>
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

/** * 通知详情对话框 * @description 展示通知的完整信息，包括标题、类型、状态、发布时间、内容等 *
@module admin/notice/components/NoticeDetailDialog * @see api/sys/notice.ts */
<script lang="ts" setup>
import { computed } from 'vue'
import type { SysNoticeAdminVO } from '@/types/api-types'
import { formatCreateTime, formatNoticeStatus, formatNoticeType, formatSystemDate } from '@/utils'

interface Props {
  visible: boolean
  notice: SysNoticeAdminVO | null
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
.notice-content {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
