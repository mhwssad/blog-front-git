<template>
  <div class="layout-sidebar" :class="{ 'is-collapsed': isCollapsed }">
    <!-- Logo 区域 -->
    <LayoutLogo :collapse="isCollapsed" />

    <!-- 菜单区域 -->
    <div class="sidebar-menu">
      <SidebarMenu :collapse="isCollapsed" />
    </div>

    <!-- 折叠按钮 -->
    <div class="sidebar-footer">
      <button
        class="collapse-btn"
        :title="isCollapsed ? '展开菜单' : '收起菜单'"
        @click="toggleCollapse"
      >
        <el-icon :size="18">
          <Expand v-if="isCollapsed" />
          <Fold v-else />
        </el-icon>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import LayoutLogo from '../LayoutLogo.vue'
import SidebarMenu from './SidebarMenu.vue'

const isCollapsed = ref(false)

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

defineExpose({
  isCollapsed,
  toggleCollapse
})
</script>

<style scoped>
.layout-sidebar {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--sidebar-bg);
  color: var(--sidebar-text);
  transition: width 0.3s ease;
  flex-shrink: 0;
}

.layout-sidebar.is-collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.collapse-btn {
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sidebar-text);
  background-color: transparent;
  border-radius: 4px;
  transition: all 0.3s;
  cursor: pointer;
}

.collapse-btn:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

/* 滚动条样式 */
.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
