<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <LayoutSidebar />

    <!-- 主内容区域 -->
    <div class="admin-main">
      <!-- 顶部栏 -->
      <LayoutHeader />

      <!-- 标签页 -->
      <LayoutTabs />

      <!-- 内容区 -->
      <div class="admin-content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import LayoutSidebar from './components/LayoutSidebar/index.vue'
import LayoutHeader from './components/LayoutHeader/index.vue'
import LayoutTabs from './components/LayoutTabs/index.vue'
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-width: 0;
  overflow: hidden;
}

.admin-content {
  flex: 1;
  min-height: 0;
  padding: 20px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable both-edges;
  scroll-behavior: smooth;
  background-color: #f5f7fa;
}
</style>
