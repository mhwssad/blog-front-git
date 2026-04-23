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
import { ref, onMounted, onUnmounted } from 'vue'

const isFullscreen = ref(false)

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
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
  border-radius: 4px;
  transition: all 0.3s;
}

.action-btn:hover {
  color: var(--color-primary);
  background-color: var(--color-gray-100);
}
</style>
