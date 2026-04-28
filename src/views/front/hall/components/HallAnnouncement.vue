<template>
  <div class="hall-announcement">
    <el-icon><Notification /></el-icon>
    <span class="announcement-text">{{ content }}</span>
  </div>
</template>

<script lang="ts" setup>
import { Notification } from '@element-plus/icons-vue'

defineProps<{
  content: string
}>()
</script>

<style scoped>
.hall-announcement {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin-bottom: 16px;
  background: var(--el-color-primary-light-9);
  border-radius: 6px;
  font-size: 13px;
  color: var(--el-color-primary-dark-2);
}

.announcement-text {
  flex: 1;
}
</style>
