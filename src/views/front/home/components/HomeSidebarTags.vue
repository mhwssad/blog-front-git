<template>
  <div class="sidebar-tags">
    <h3 class="sidebar-block-title">
      <el-icon aria-hidden="true" class="title-icon"><CollectionTag /></el-icon>
      标签
    </h3>
    <div v-if="tags.length" class="tag-list">
      <button
        v-for="tag in tags"
        :key="tag.id"
        type="button"
        class="tag-item"
        @click="emit('select-tag', tag.id)"
      >
        {{ tag.name }}
      </button>
    </div>
    <div v-else class="sidebar-empty">暂无标签</div>
  </div>
</template>

<script lang="ts" setup>
import { CollectionTag } from '@element-plus/icons-vue'
import type { PublicTagVO } from '@/types/api-types'

defineProps<{
  tags: PublicTagVO[]
}>()

const emit = defineEmits<{
  'select-tag': [id: number]
}>()
</script>

<style scoped>
.sidebar-block-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.title-icon {
  color: var(--el-color-primary);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 4px 14px;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-lighter);
  border: 1px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    color 0.15s,
    background 0.15s,
    border-color 0.15s;
}

.tag-item:hover {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
}

.tag-item:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}

.sidebar-empty {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-align: center;
  padding: 8px 0;
}
</style>
