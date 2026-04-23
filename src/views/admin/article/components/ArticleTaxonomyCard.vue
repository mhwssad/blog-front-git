<template>
  <el-card shadow="never" class="side-card">
    <template #header>
      <div class="card-header">
        <span>内容归类</span>
      </div>
    </template>

    <el-form-item label="文章分类" prop="categoryIds">
      <el-select
        v-model="formData.categoryIds"
        multiple
        collapse-tags
        collapse-tags-tooltip
        placeholder="请选择分类"
      >
        <el-option v-for="item in categoryOptions" :key="item.id" :label="item.label" :value="item.id" />
      </el-select>
    </el-form-item>

    <el-form-item label="文章标签" prop="tagIds">
      <el-select v-model="formData.tagIds" multiple collapse-tags collapse-tags-tooltip placeholder="请选择标签">
        <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id" />
      </el-select>
    </el-form-item>

    <el-form-item label="备注" prop="remark">
      <el-input
        v-model="formData.remark"
        type="textarea"
        :rows="4"
        maxlength="256"
        show-word-limit
        resize="vertical"
        placeholder="请输入备注"
      />
    </el-form-item>

    <el-alert
      v-if="formData.accessLevel === 4"
      type="info"
      :closable="false"
      class="access-alert"
      title="当前文章为指定用户可见，保存后请回到列表页单独维护访问名单。"
    />
  </el-card>
</template>

<script lang="ts" setup>
import type { ArticleSaveRequest, TagVO } from '@/api/types'
import type { CategoryOption } from './article-editor'

interface Props {
  formData: ArticleSaveRequest
  categoryOptions: CategoryOption[]
  tags: TagVO[]
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

.access-alert {
  margin-top: 4px;
}
</style>
