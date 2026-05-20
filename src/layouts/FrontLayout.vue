<template>
  <div class="front-layout">
    <FrontHeader v-if="!route.meta.hideHeader" />

    <main class="front-main">
      <router-view />
    </main>

    <SiteFooter v-if="!route.meta.hideFooter" />
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import FrontHeader from '@/layouts/components/FrontHeader.vue'
import SiteFooter from '@/layouts/components/SiteFooter.vue'

const route = useRoute()
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
