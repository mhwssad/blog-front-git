<template>
  <div class="front-layout">
    <FrontHeader />

    <main class="front-main">
      <router-view />
    </main>

    <SiteFooter />
  </div>
</template>

<script lang="ts" setup>
import FrontHeader from '@/layouts/components/FrontHeader.vue'
import SiteFooter from '@/layouts/components/SiteFooter.vue'
</script>

<style scoped>
.front-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.front-main {
  flex: 1;
}
</style>
