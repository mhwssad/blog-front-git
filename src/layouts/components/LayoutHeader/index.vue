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
  z-index: 1002;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid var(--color-border-base);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
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
  margin-left: 20px;
}

/* 覆盖 el-page-header 默认样式 */
.header-left :deep(.el-page-header) {
  height: 56px;
  padding: 0;
  line-height: 56px;
}

.header-left :deep(.el-page-header__content) {
  height: 56px;
  line-height: 56px;
}

.header-left :deep(.el-page-header__back) {
  margin: 0;
}

.header-left :deep(.el-page-header__left) {
  margin: 0;
}
</style>
