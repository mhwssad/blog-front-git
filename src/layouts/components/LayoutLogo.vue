<template>
  <div class="logo">
    <router-link class="logo-link" to="/">
      <img :src="logoUrl" alt="Logo" class="logo-image" />
      <transition name="logo-text">
        <span v-if="!collapse" class="logo-title">
          {{ title }}
        </span>
      </transition>
    </router-link>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useConfigStore } from '@/stores/modules/config'
import logoUrl from '@/assets/images/logo.png'

interface Props {
  collapse?: boolean
}

withDefaults(defineProps<Props>(), {
  collapse: false
})

const configStore = useConfigStore()
const title = ref('Blog Admin')

onMounted(async () => {
  const name = await configStore.fetchConfigByKey('site_name')
  if (name) {
    title.value = name
  }
})
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

.logo-image {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  object-fit: contain;
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
