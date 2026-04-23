<template>
  <el-card shadow="never" class="side-card">
    <template #header>
      <div class="card-header">
        <span>发布配置</span>
      </div>
    </template>

    <div class="current-author">
      <span class="current-author__label">当前作者</span>
      <span class="current-author__value">{{ currentAuthorName }}</span>
    </div>

    <el-form-item label="发布状态" prop="status">
      <el-radio-group v-model="formData.status" class="status-group">
        <el-radio v-for="option in ARTICLE_STATUS_OPTIONS" :key="option.value" :value="option.value">
          {{ option.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="发布时间" prop="publishTime">
      <el-date-picker
        v-model="formData.publishTime"
        type="datetime"
        value-format="YYYY-MM-DD HH:mm:ss"
        format="YYYY-MM-DD HH:mm:ss"
        placeholder="请选择发布时间"
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="访问级别" prop="accessLevel">
      <el-select v-model="formData.accessLevel" placeholder="请选择访问级别">
        <el-option v-for="option in ACCESS_LEVEL_OPTIONS" :key="option.value" :label="option.label" :value="option.value" />
      </el-select>
    </el-form-item>

    <el-form-item label="是否置顶" prop="isTop">
      <el-radio-group v-model="formData.isTop" class="status-group">
        <el-radio :value="1">是</el-radio>
        <el-radio :value="0">否</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="文章属性" prop="isOriginal">
      <el-radio-group v-model="formData.isOriginal" class="status-group">
        <el-radio :value="1">原创</el-radio>
        <el-radio :value="0">转载</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item v-if="formData.isOriginal === 0" label="转载地址" prop="sourceUrl">
      <el-input v-model="formData.sourceUrl" maxlength="512" placeholder="请输入转载来源地址" />
    </el-form-item>

    <el-form-item label="封面地址" prop="coverImage">
      <el-input v-model="formData.coverImage" maxlength="512" placeholder="请输入封面图片地址" />
    </el-form-item>
  </el-card>
</template>

<script lang="ts" setup>
import type { ArticleSaveRequest } from '@/api/types'
import { ACCESS_LEVEL_OPTIONS, ARTICLE_STATUS_OPTIONS } from '@/utils'

interface Props {
  formData: ArticleSaveRequest
  currentAuthorName: string
}

defineProps<Props>()
</script>

<style scoped>
.side-card {
  border-radius: 16px;
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.current-author {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--el-fill-color-light);
}

.current-author__label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.current-author__value {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.status-group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 16px;
}

:deep(.status-group .el-radio) {
  margin-right: 0;
}
</style>
