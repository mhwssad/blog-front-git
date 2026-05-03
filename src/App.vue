<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { log } from '@/composables/useLogger'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))

onMounted(() => {
  log.app.info('Application mounted')
})
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <div class="app-container" :class="{ 'app-container--admin': isAdminRoute }">
      <!-- 路由视图 -->
      <RouterView />
    </div>
  </ElConfigProvider>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  width: 100%;
}

.app-container--admin {
  height: 100vh;
  overflow: hidden;
}
</style>
