<template>
  <div class="layout-header">
    <!-- 左侧：页头 -->
    <div class="header-left">
      <HeaderBreadcrumb />
    </div>

    <!-- 右侧：操作区 -->
    <div class="header-right">
      <HeaderActions />
    </div>
  </div>
</template>

<script lang="ts" setup>
import HeaderBreadcrumb from './HeaderBreadcrumb.vue'
import HeaderActions from './HeaderActions.vue'
</script>

<style scoped>
.layout-header {
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--content-padding);
  background-color: var(--color-bg-base);
  border-bottom: 1px solid var(--color-border-base);
  box-shadow: var(--shadow-small);
  flex-shrink: 0;
}

.header-left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.header-right {
  flex-shrink: 0;
  margin-left: var(--spacing-lg);
}
</style>
