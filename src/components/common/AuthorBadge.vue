<template>
  <span class="author-badge">
    <el-icon><Edit /></el-icon>
    <span class="author-badge__text">作者</span>
  </span>
</template>

<script lang="ts" setup>
import { Edit } from '@element-plus/icons-vue'
</script>

<style scoped>
.author-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1;
  background-color: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
  color: var(--el-color-primary);
  font-weight: 500;
}

.author-badge__text {
  font-size: 11px;
}
</style>
