<template>
  <div class="article-sidebar">
    <div class="sidebar-card">
      <div class="sidebar-title">目录</div>
      <nav v-if="headings.length" class="toc-list">
        <a
          v-for="heading in headings"
          :key="heading.id"
          :href="`#${heading.id}`"
          class="toc-item"
          :class="`toc-level-${heading.level}`"
          @click.prevent="scrollTo(heading.id)"
        >
          {{ heading.text }}
        </a>
      </nav>
      <div v-else class="toc-empty">暂无目录</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TocHeading } from '@/types/ui'

defineProps<{
  headings: TocHeading[]
}>()

function scrollTo(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.article-sidebar {
  position: sticky;
  top: 80px;
}

.sidebar-card {
  padding: 16px;
  border-radius: 8px;
  background: #fff;
}

.sidebar-title {
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toc-item {
  display: block;
  padding: 4px 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  text-decoration: none;
  transition: color 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-item:hover {
  color: var(--el-color-primary);
}

.toc-level-2 {
  padding-left: 0;
}

.toc-level-3 {
  padding-left: 12px;
}

.toc-level-4 {
  padding-left: 24px;
}

.toc-empty {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
</style>
