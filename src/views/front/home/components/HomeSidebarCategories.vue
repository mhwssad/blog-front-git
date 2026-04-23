<template>
  <el-card shadow="never" class="sidebar-card">
    <template #header>
      <div class="sidebar-title-row">
        <el-tag type="primary" effect="plain" round>分类树</el-tag>
        <el-icon class="title-icon"><FolderOpened /></el-icon>
      </div>
    </template>

    <div class="category-tree">
      <article v-for="category in categories" :key="category.id" class="category-root">
        <div class="category-root-name">{{ category.name }}</div>
        <p class="category-root-desc">{{ category.description || '暂无分类描述' }}</p>
        <div class="category-children">
          <el-tag
            v-for="child in category.children || []"
            :key="child.id"
            round
            effect="plain"
            class="clickable-tag"
            @click="emit('select-category', child.id)"
          >
            {{ child.name }}
          </el-tag>
        </div>
      </article>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { FolderOpened } from '@element-plus/icons-vue'
import type { PublicCategoryTreeVO } from '@/api/types'

defineProps<{
  categories: PublicCategoryTreeVO[]
}>()

const emit = defineEmits<{
  (e: 'select-category', value: number): void
}>()
</script>

<style scoped>
.sidebar-card {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
}

.sidebar-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-icon {
  color: #94a3b8;
}

.category-root + .category-root {
  margin-top: 18px;
}

.category-root-name {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.category-root-desc {
  margin-top: 10px;
  color: #475569;
  line-height: 1.75;
}

.category-children {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.clickable-tag {
  cursor: pointer;
}
</style>
