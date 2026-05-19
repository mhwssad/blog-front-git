<script lang="ts" setup>
withDefaults(defineProps<{
  selectedCount: number
}>(), {
  selectedCount: 0,
})
</script>

<template>
  <transition name="el-fade-in">
    <div v-if="selectedCount > 0" class="batch-toolbar">
      <span class="batch-toolbar__count">
        已选择 <strong>{{ selectedCount }}</strong> 项
      </span>
      <div class="batch-toolbar__actions">
        <slot />
      </div>
    </div>
  </transition>
</template>

<style scoped>
.batch-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 12px;
  margin-bottom: 12px;
  background-color: var(--el-color-primary-light-9);
  border-radius: var(--el-border-radius-base);
  border: 1px solid var(--el-color-primary-light-7);
}

.batch-toolbar__count {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.batch-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
