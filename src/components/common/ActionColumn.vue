<script lang="ts" setup>
withDefaults(defineProps<{
  width?: number | string
  fixed?: string | boolean
  align?: string
  compact?: boolean
}>(), {
  width: 160,
  fixed: 'right',
  align: 'center',
  compact: false,
})
</script>

<template>
  <el-table-column label="操作" :width="width" :fixed="fixed" :align="align">
    <template #default="scope">
      <div :class="['action-column', { 'action-column--compact': compact }]">
        <slot v-bind="scope" />
      </div>
    </template>
  </el-table-column>
</template>

<style scoped>
.action-column {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.action-column--compact {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
</style>
