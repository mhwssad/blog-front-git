<template>
  <div class="logo">
    <router-link class="logo-link" to="/">
      <div class="logo-icon">
        <el-icon :size="28">
          <Platform />
        </el-icon>
      </div>
      <transition name="logo-text">
        <span v-if="!collapse" class="logo-title">
          {{ title }}
        </span>
      </transition>
    </router-link>
  </div>
</template>

<script lang="ts" setup>
import { Platform } from '@element-plus/icons-vue'

interface Props {
  collapse?: boolean
}

withDefaults(defineProps<Props>(), {
  collapse: false
})

const title = 'Blog Admin'
</script>

<style scoped>
.logo {
  width: 100%;
  height: var(--header-height);
  display: flex;
  align-items: center;
  background-color: var(--sidebar-bg-dark);
}

.logo-link {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 16px;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s;
}

.logo-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.logo-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.logo-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.logo-text-enter-active,
.logo-text-leave-active {
  transition: all 0.3s;
}

.logo-text-enter-from,
.logo-text-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
