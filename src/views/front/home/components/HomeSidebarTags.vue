<template>
  <el-card shadow="never" class="sidebar-card">
    <template #header>
      <div class="sidebar-title-row">
        <el-tag type="primary" effect="plain" round>标签云</el-tag>
        <el-icon class="title-icon"><CollectionTag /></el-icon>
      </div>
    </template>

    <div class="tag-cloud">
      <el-tag
        v-for="tag in tags"
        :key="tag.id"
        round
        effect="plain"
        class="tag-item"
        :style="{ '--tag-color': tag.color || '#2563eb' }"
        @click="emit('select-tag', tag.id)"
      >
        {{ tag.name }}
      </el-tag>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { CollectionTag } from '@element-plus/icons-vue'
import type { PublicTagVO } from '@/api/types'

defineProps<{
  tags: PublicTagVO[]
}>()

const emit = defineEmits<{
  (e: 'select-tag', value: number): void
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

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  border-color: color-mix(in srgb, var(--tag-color) 22%, #ffffff);
  color: var(--tag-color);
  background: color-mix(in srgb, var(--tag-color) 8%, #ffffff);
  cursor: pointer;
}
</style>
