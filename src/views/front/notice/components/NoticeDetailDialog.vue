<template>
  <DetailDialog
    v-model="dialogVisible"
    :title="notice?.title ?? '通知详情'"
    width="560px"
    :detail="notice"
  >
    <template #default="{ detail: notice }">
      <div class="detail-meta">
        <span class="detail-time">{{ notice.publishTime ?? notice.createTime }}</span>
        <el-tag v-if="notice.isRead === 0" size="small" type="danger">未读</el-tag>
        <el-tag v-else size="small" type="success">已读</el-tag>
      </div>
      <div class="detail-content">{{ notice.content }}</div>
    </template>
  </DetailDialog>
</template>

<script lang="ts" setup>
/**
 * 通知详情弹窗组件
 * @description 展示通知的完整内容、发布时间和阅读状态
 * @module front/notice/components/NoticeDetailDialog
 */
import { computed } from 'vue'
import type { UserNoticeVO } from '@/types/api-types'

const props = defineProps<{
  visible: boolean
  notice: UserNoticeVO | null
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val),
})
</script>

<style scoped>
.detail-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.detail-time {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

.detail-content {
  font-size: 14px;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
}
</style>
