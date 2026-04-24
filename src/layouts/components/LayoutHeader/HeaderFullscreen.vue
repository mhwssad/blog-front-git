<template>
  <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'" placement="bottom">
    <button class="action-btn" @click="toggleFullscreen">
      <el-icon :size="18">
        <FullScreen v-if="!isFullscreen" />
        <Aim v-else />
      </el-icon>
    </button>
  </el-tooltip>
</template>

<script lang="ts" setup>
import { useFullscreen } from '@vueuse/core'

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()
</script>

<style scoped>
.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-regular);
  background-color: transparent;
  border-radius: var(--border-radius-base);
  transition: var(--transition-base);
}

.action-btn:hover {
  color: var(--color-primary);
  background-color: var(--color-gray-100);
}
</style>
