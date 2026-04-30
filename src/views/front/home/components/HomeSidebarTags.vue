<template>
  <div class="sidebar-tags">
    <div class="sidebar-block-title">标签</div>
    <div v-if="tags.length" class="tag-list">
      <el-tag
        v-for="tag in tags"
        :key="tag.id"
        size="small"
        effect="plain"
        class="tag-item"
        @click="emit('select-tag', tag.id)"
      >
        {{ tag.name }}
      </el-tag>
    </div>
    <div v-else class="sidebar-empty">暂无标签</div>
  </div>
</template>

<script lang="ts" setup>
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
  margin-bottom: 12px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  cursor: pointer;
}

.sidebar-empty {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
</style>
