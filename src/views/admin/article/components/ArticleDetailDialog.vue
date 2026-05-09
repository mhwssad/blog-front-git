<template>
  <el-dialog v-model="visible" title="文章详情" width="780px" align-center destroy-on-close>
    <template v-if="detail">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="标题" :span="2">
          <span style="font-weight: 600">{{ detail.title }}</span>
          <el-tag v-if="detail.isTop === 1" type="warning" size="small" style="margin-left: 8px">
            置顶
          </el-tag>
          <el-tag v-if="detail.isOriginal === 1" size="small" style="margin-left: 4px">原创</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="作者">{{ detail.authorName }} (ID: {{ detail.authorId }})</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-switch
            :model-value="detail.status"
            :active-value="1"
            :inactive-value="0"
            active-text="已发布"
            inactive-text="草稿"
            inline-prompt
            disabled
          />
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="reviewTagType" size="small">{{ reviewStatusLabel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="访问级别">
          <el-tag :type="accessTagType" size="small">{{ formatAccessLevel(detail.accessLevel) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="可见范围">
          {{ formatVisibility(detail.visibilityScope) }}
        </el-descriptions-item>
        <el-descriptions-item label="分类/标签">
          <template v-if="detail.categoryIds?.length">
            {{ detail.categoryIds.join(', ') }}
          </template>
          <span v-else style="color: var(--el-text-color-secondary)">-</span>
          <span style="margin: 0 6px">|</span>
          <template v-if="detail.tagIds?.length">
            {{ detail.tagIds.join(', ') }}
          </template>
          <span v-else style="color: var(--el-text-color-secondary)">-</span>
        </el-descriptions-item>
        <el-descriptions-item label="浏览">{{ detail.viewCount ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="点赞">{{ detail.likeCount ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="评论">{{ detail.commentCount ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="收藏">{{ detail.collectCount ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="分享">{{ detail.shareCount ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">
          {{ formatPublishTime(detail.publishTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatUpdatedAt(detail.updatedAt) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detail.scheduledPublishTime" label="定时发布" :span="2">
          {{ detail.scheduledPublishTime }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detail.sourceUrl" label="原文地址" :span="2">
          <a :href="detail.sourceUrl" target="_blank" rel="noopener">{{ detail.sourceUrl }}</a>
        </el-descriptions-item>
      </el-descriptions>

      <div v-if="detail.summary" style="margin-top: 16px">
        <div style="font-weight: 500; margin-bottom: 8px">摘要</div>
        <div class="detail-summary">{{ detail.summary }}</div>
      </div>

      <div v-if="detail.remark" style="margin-top: 12px">
        <div style="font-weight: 500; margin-bottom: 8px">备注</div>
        <div style="color: var(--el-text-color-secondary)">{{ detail.remark }}</div>
      </div>

      <div v-if="detail.content" style="margin-top: 16px">
        <div style="font-weight: 500; margin-bottom: 8px">正文内容</div>
        <div class="detail-content" v-html="detail.content" />
      </div>
    </template>

    <div v-else style="text-align: center; padding: 32px; color: var(--el-text-color-secondary)">
      暂无数据
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button
        v-if="detail"
        v-permission="'content:article:update'"
        type="primary"
        @click="$emit('edit', detail)"
      >
        编辑
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { ArticleDetailVO } from '@/types/api-types'
import {
  formatAccessLevel,
  formatPublishTime,
  formatUpdatedAt,
  formatVisibility,
} from '@/utils'

const props = defineProps<{
  visible: boolean
  detail: ArticleDetailVO | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  edit: [detail: ArticleDetailVO]
}>()

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const accessTagType = computed(() => {
  const level = props.detail?.accessLevel
  if (level === 0) return 'success'
  if (level === 4) return 'warning'
  if (level === 2 || level === 3) return 'danger'
  return 'info'
})

const reviewStatusLabel = computed(() => {
  const map: Record<number, string> = { 0: '未送审', 1: '审核中', 2: '已通过', 3: '已拒绝' }
  return map[props.detail?.reviewStatus ?? 0] ?? '-'
})

const reviewTagType = computed<'info' | 'warning' | 'success' | 'danger'>(() => {
  const map: Record<number, 'info' | 'warning' | 'success' | 'danger'> = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger',
  }
  return map[props.detail?.reviewStatus ?? 0] ?? 'info'
})
</script>

<style scoped>
.detail-summary {
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  word-break: break-word;
}

.detail-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background: var(--el-fill-color-lighter);
}

.detail-content :deep(img) {
  max-width: 100%;
}
</style>
