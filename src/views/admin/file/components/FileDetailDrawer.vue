<template>
  <el-drawer
    :model-value="modelValue"
    :title="detail ? `文件详情 #${detail.id}` : '文件详情'"
    size="680px"
    @close="emit('update:modelValue', false)"
  >
    <div v-loading="loading" class="file-detail-drawer">
      <el-empty v-if="!detail && !loading" description="暂无文件详情" />
      <template v-else-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="文件名">{{ detail.fileName }}</el-descriptions-item>
          <el-descriptions-item label="原始名">{{ detail.originalName }}</el-descriptions-item>
          <el-descriptions-item label="文件类型">{{ detail.fileType }}</el-descriptions-item>
          <el-descriptions-item label="文件大小">{{ formatFileSize(detail.fileSize) }}</el-descriptions-item>
          <el-descriptions-item label="上传用户">#{{ detail.uploadUserId ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="公开状态">{{ formatVisibility(detail.isPublic) }}</el-descriptions-item>
          <el-descriptions-item label="存储分类">{{ formatOptionalText(detail.category) }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ formatFileStatus(detail.status) }}</el-descriptions-item>
          <el-descriptions-item label="引用数">{{ detail.referenceCount ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatCreatedAt(detail.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="文件地址" :span="2">
            <el-link :href="detail.fileUrl" target="_blank" type="primary">
              {{ detail.fileUrl }}
            </el-link>
          </el-descriptions-item>
          <el-descriptions-item label="文件路径" :span="2">
            {{ formatOptionalText(detail.filePath) }}
          </el-descriptions-item>
        </el-descriptions>

        <section class="drawer-section">
          <div class="section-header">引用信息</div>
          <el-table :data="detail.references ?? []" border size="small" table-layout="auto">
            <el-table-column prop="id" label="引用 ID" min-width="90" align="center" />
            <el-table-column prop="userId" label="用户 ID" min-width="90" align="center" />
            <el-table-column prop="referenceType" label="引用类型" min-width="120" align="center" />
            <el-table-column prop="referenceId" label="业务 ID" min-width="100" align="center" />
            <el-table-column label="公开" min-width="80" align="center">
              <template #default="{ row }">
                {{ formatVisibility(row.isPublic) }}
              </template>
            </el-table-column>
            <el-table-column prop="category" label="业务分类" min-width="100" align="center">
              <template #default="{ row }">
                {{ formatOptionalText(row.category) }}
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="160" align="center" show-overflow-tooltip>
              <template #default="{ row }">
                {{ formatOptionalText(row.remark) }}
              </template>
            </el-table-column>
            <el-table-column label="创建时间" min-width="160" align="center">
              <template #default="{ row }">
                {{ formatCreatedAt(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </section>

        <section class="drawer-section">
          <div class="section-header">上传任务</div>
          <el-table :data="detail.tasks ?? []" border size="small" table-layout="auto">
            <el-table-column prop="id" label="任务 ID" min-width="90" align="center" />
            <el-table-column prop="uploadId" label="上传 ID" min-width="180" align="center" show-overflow-tooltip />
            <el-table-column prop="originalName" label="原始文件名" min-width="140" align="center" show-overflow-tooltip />
            <el-table-column label="文件大小" min-width="100" align="center">
              <template #default="{ row }">
                {{ row.fileSize ? formatFileSize(row.fileSize) : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="秒传" min-width="70" align="center">
              <template #default="{ row }">
                {{ row.isQuickUpload === 1 ? '是' : '否' }}
              </template>
            </el-table-column>
            <el-table-column label="分片" min-width="70" align="center">
              <template #default="{ row }">
                {{ row.isChunked === 1 ? '是' : '否' }}
              </template>
            </el-table-column>
            <el-table-column label="任务状态" min-width="110" align="center">
              <template #default="{ row }">
                {{ formatFileTaskStatus(row.taskStatus) }}
              </template>
            </el-table-column>
            <el-table-column label="完成时间" min-width="160" align="center">
              <template #default="{ row }">
                {{ formatCreatedAt(row.completeTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="errorMessage" label="错误信息" min-width="180" align="center" show-overflow-tooltip>
              <template #default="{ row }">
                {{ formatOptionalText(row.errorMessage) }}
              </template>
            </el-table-column>
          </el-table>
        </section>
      </template>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import type { FileDetailVO } from '@/api/types'
import { FormatUtils } from '@/utils'
import {
  formatCreatedAt,
  formatFileStatus,
  formatFileTaskStatus,
  formatOptionalText,
  formatVisibility,
} from '@/utils'

interface Props {
  modelValue: boolean
  detail: FileDetailVO | null
  loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function formatFileSize(value: number): string {
  return FormatUtils.formatFileSize(value)
}
</script>

<style scoped>
.file-detail-drawer {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.drawer-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  font-size: 15px;
  font-weight: 600;
}
</style>
