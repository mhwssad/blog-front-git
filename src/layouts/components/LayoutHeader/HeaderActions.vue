<template>
  <div class="header-actions">
    <!-- 全屏切换 -->
    <HeaderFullscreen />

    <!-- 通知铃铛 -->
    <HeaderNotice />

    <!-- 用户菜单 -->
    <HeaderUser />
  </div>
</template>

<script lang="ts" setup>
import HeaderFullscreen from './HeaderFullscreen.vue'
import HeaderNotice from './HeaderNotice.vue'
import HeaderUser from './HeaderUser.vue'
</script>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
