<template>
  <el-menu
    ref="menuRef"
    :default-active="activeMenu"
    :default-openeds="defaultOpeneds"
    :collapse="collapse"
    :unique-opened="false"
    background-color="#001529"
    text-color="rgba(255, 255, 255, 0.65)"
    active-text-color="#fff"
    mode="vertical"
    class="sidebar-menu-inner"
    @select="handleSelect"
    @open="handleMenuOpen"
    @close="handleMenuClose"
  >
    <SidebarMenuItem
      v-for="item in menuList"
      :key="item.id"
      :item="item"
      :get-icon-component="getIconComponent"
    />
  </el-menu>
</template>

<script lang="ts" setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { MenuInstance } from 'element-plus'
import { useAuthStore } from '@/stores'
import { filterVisibleMenus, getAdminMenus, type AppMenuInfo } from '@/router/menu'
import { IconUtils } from '@/utils/iconUtils'
import SidebarMenuItem from './SidebarMenuItem.vue'

interface Props {
  collapse?: boolean
}

withDefaults(defineProps<Props>(), {
  collapse: false
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const menuRef = ref<MenuInstance>()

const activeMenu = computed(() => route.path)

const menuList = computed(() => filterVisibleMenus(getAdminMenus(authStore.userMenus)))

const MENU_OPENED_KEY = 'sidebar_menu_opened'
const defaultOpeneds = ref<string[]>([])
const openedMenus = ref<Set<string>>(new Set())

function collectSubMenuIndexes(menus: AppMenuInfo[]): string[] {
  return menus.flatMap(menu => {
    if (!menu.children?.length) return []
    return [String(menu.id), ...collectSubMenuIndexes(menu.children)]
  })
}

function restoreOpenState(): void {
  try {
    const saved = localStorage.getItem(MENU_OPENED_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as string[]
      defaultOpeneds.value = parsed
      openedMenus.value = new Set(parsed)
    }
  } catch {
    defaultOpeneds.value = []
    openedMenus.value = new Set()
  }
}

function saveOpenState(openeds: string[]): void {
  try {
    localStorage.setItem(MENU_OPENED_KEY, JSON.stringify(openeds))
  } catch {
    // ignore
  }
}

function handleMenuOpen(index: string): void {
  openedMenus.value.add(index)
  defaultOpeneds.value = Array.from(openedMenus.value)
  saveOpenState(defaultOpeneds.value)
}

function handleMenuClose(index: string): void {
  openedMenus.value.delete(index)
  defaultOpeneds.value = Array.from(openedMenus.value)
  saveOpenState(defaultOpeneds.value)
}

watch(menuList, async (newVal, oldVal) => {
  const availableIndexes = new Set(collectSubMenuIndexes(newVal))
  openedMenus.value = new Set([...openedMenus.value].filter(index => availableIndexes.has(index)))
  defaultOpeneds.value = Array.from(openedMenus.value)

  if (!oldVal || newVal === oldVal) {
    saveOpenState(defaultOpeneds.value)
    return
  }

  await nextTick()
  await nextTick()
  if (menuRef.value && openedMenus.value.size > 0) {
    setTimeout(() => {
      openedMenus.value.forEach(index => {
        if (menuRef.value?.open) {
          menuRef.value.open(index)
        }
      })
    }, 0)
  }
}, { flush: 'post' })

restoreOpenState()

function getIconComponent(iconName: string) {
  return IconUtils.getIcon(iconName)
}

function handleSelect(index: string) {
  if (/^(https?:)?\/\//i.test(index)) {
    window.open(index, '_blank', 'noopener,noreferrer')
    return
  }
  router.push(index)
}
</script>

<style scoped>
.sidebar-menu-inner {
  border-right: none;
  height: 100%;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.sidebar-menu-inner:not(.el-menu--collapse) {
  width: var(--sidebar-width);
}

.sidebar-menu-inner.el-menu--collapse {
  width: var(--sidebar-collapsed-width);
}

.sidebar-menu-inner :deep(.el-menu-item),
.sidebar-menu-inner :deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
}

.sidebar-menu-inner :deep(.el-menu-item:hover),
.sidebar-menu-inner :deep(.el-sub-menu__title:hover) {
  background-color: var(--sidebar-bg-hover) !important;
}

.sidebar-menu-inner :deep(.el-menu-item.is-active) {
  background-color: var(--sidebar-bg-active) !important;
}

.sidebar-menu-inner.el-menu--collapse :deep(.el-menu-item),
.sidebar-menu-inner.el-menu--collapse :deep(.el-sub-menu__title) {
  padding: 0 var(--content-padding);
}

.sidebar-menu-inner.el-menu--collapse :deep(.el-sub-menu__icon-arrow) {
  display: none;
}

/* 暗色主题滚动条 */
.sidebar-menu-inner::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu-inner::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu-inner::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar-menu-inner::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.35);
}
</style>
