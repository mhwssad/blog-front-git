<template>
  <div class="editor-settings">
    <!-- 发布配置 -->
    <el-card shadow="never">
      <template #header><span>发布配置</span></template>

      <div class="author-row">
        <span class="author-label">当前作者</span>
        <span class="author-value">{{ authorName }}</span>
      </div>

      <el-form-item label="发布状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio v-for="o in ARTICLE_STATUS_OPTIONS" :key="o.value" :value="o.value">
            {{ o.label }}
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
        <el-select v-model="formData.accessLevel" placeholder="请选择">
          <el-option
            v-for="o in ACCESS_LEVEL_OPTIONS"
            :key="o.value"
            :label="o.label"
            :value="o.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="是否置顶" prop="isTop">
        <el-radio-group v-model="formData.isTop">
          <el-radio :value="1">是</el-radio>
          <el-radio :value="0">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="文章属性" prop="isOriginal">
        <el-radio-group v-model="formData.isOriginal">
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

    <!-- 内容归类 -->
    <el-card shadow="never">
      <template #header><span>内容归类</span></template>

      <el-form-item label="文章分类" prop="categoryIds">
        <el-select
          v-model="formData.categoryIds"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择分类"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="文章标签" prop="tagIds">
        <el-select
          v-model="formData.tagIds"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择标签"
        >
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
        title="当前文章为指定用户可见，保存后请回到列表页单独维护访问名单。"
      />
    </el-card>
  </div>
</template>

/** * 文章编辑器设置面板 * @description
文章编辑器的侧边设置面板，包含作者选择、发布状态、可见范围、分类标签、封面图片、SEO信息、定时发布等功能
* @module admin/article/components/ArticleEditorSettings * @see api/sys/article.ts */ /** *
文章编辑器设置面板 * @description
文章编辑器的侧边设置面板，包含作者选择、发布状态、可见范围、分类标签、封面图片、SEO信息、定时发布等功能
* @module admin/article/components/ArticleEditorSettings * @see api/sys/article.ts */
<script lang="ts" setup>
import type { ArticleSaveRequest, CategoryAdminVO, TagVO } from '@/types/api-types'
import { ACCESS_LEVEL_OPTIONS, ARTICLE_STATUS_OPTIONS } from '@/utils'
import { buildCategoryOptions } from './article-editor'
import { computed } from 'vue'

interface Props {
  formData: ArticleSaveRequest
  categories: CategoryAdminVO[]
  tags: TagVO[]
  authorName: string
}

const props = defineProps<Props>()

const categoryOptions = computed(() => buildCategoryOptions(props.categories))
</script>

<style scoped>
.editor-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-settings :deep(.el-card) {
  border-radius: 12px;
  border-color: var(--color-border-light);
  box-shadow: var(--shadow-small);
}

.author-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--color-gray-100);
}

.author-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.author-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.editor-settings :deep(.el-radio-group) {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 16px;
}

.editor-settings :deep(.el-radio) {
  margin-right: 0;
}

.editor-settings :deep(.el-select),
.editor-settings :deep(.el-date-editor) {
  width: 100%;
}
</style>
